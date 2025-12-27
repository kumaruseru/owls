from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Max, Min, F, Case, When, DecimalField
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer
from .filters import ProductFilter, ProductOrderingFilter
from .services import ProductExportService


class ProductPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 100


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    pagination_class = ProductPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, ProductOrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
        
        # Annotate effective price for correct sorting
        queryset = queryset.annotate(
            effective_price=Case(
                When(sale_price__gt=0, then=F('sale_price')),
                default=F('price'),
                output_field=DecimalField()
            )
        )
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'reviews')
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'


class ProductFilterView(APIView):
    """API endpoint returns filtering options (brands, colors, price range)."""
    
    def get(self, request):
        # Use common filter logic to enable faceted search / dynamic filters
        base_qs = Product.objects.filter(is_active=True)
        filterset = ProductFilter(request.GET, queryset=base_qs)
        
        if filterset.is_valid():
            products = filterset.qs
        else:
            products = base_qs

        # Calculate effective price for aggregation
        # If sale_price > 0, use it, else use price
        products = products.annotate(
            effective_price=Case(
                When(sale_price__gt=0, then=F('sale_price')),
                default=F('price'),
                output_field=DecimalField()
            )
        )

        # Aggregate price range based on effective price
        price_stats = products.aggregate(
            min_price=Min('effective_price'), 
            max_price=Max('effective_price')
        )
        
        # Get distinct brands and colors based on filtered products
        brands = products.exclude(brand__isnull=True).exclude(brand='').values_list('brand', flat=True).distinct().order_by('brand')
        colors = products.exclude(color__isnull=True).exclude(color='').values_list('color', flat=True).distinct().order_by('color')
        
        return Response({
            'min_price': price_stats['min_price'] or 0,
            'max_price': price_stats['max_price'] or 0,
            'brands': list(brands),
            'colors': list(colors)
        })


class AdminProductListView(generics.ListCreateAPIView):
    """Admin: List and Create Products."""
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all().order_by('-created_at')
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'sku']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer

    def list(self, request, *args, **kwargs):
        # Check for export
        if request.query_params.get('export') == 'excel':
            queryset = self.filter_queryset(self.get_queryset())
            return ProductExportService.export_to_excel(queryset)

        return super().list(request, *args, **kwargs)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Retrieve, Update, Delete Product."""
    permission_classes = [permissions.IsAdminUser]
    queryset = Product.objects.all()
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return ProductCreateSerializer
        return ProductDetailSerializer


class AdminProductImageSetPrimaryView(APIView):
    """Admin: Set an image as primary."""
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        image = get_object_or_404(ProductImage, pk=pk)
        
        # Explicitly set other images to False for atomicity/clarity, relying on DB transaction would be better but this is sufficient.
        ProductImage.objects.filter(product=image.product).update(is_primary=False)
        
        image.is_primary = True
        image.save()
        
        return Response({'status': 'success', 'message': 'Image set as primary'})
