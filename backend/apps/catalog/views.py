from rest_framework import generics, filters, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Max, Min
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductImage
from .serializers import CategorySerializer, ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer


class CategoryDetailView(generics.RetrieveAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')
    serializer_class = ProductListSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'brand', 'is_featured']
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'created_at', 'name']


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'reviews')
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'


class ProductFilterView(APIView):
    """API endpoint returns filtering options (brands, colors, price range)."""
    
    def get(self, request):
        products = Product.objects.filter(is_active=True)
        
        # Aggregate price range
        price_stats = products.aggregate(min_price=Min('price'), max_price=Max('price'))
        
        # Get distinct brands and colors
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
    filterset_fields = ['category', 'is_active', 'is_featured', 'brand']
    search_fields = ['name', 'sku']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateSerializer
        return ProductListSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Handle stock filtering manually if needed, or rely on frontend sending stock__gt=0 via custom filter set if we had one.
        # For now, let's keep it simple with standard filters. 
        # But wait, user wants filters.
        
        # Check for export
        if request.query_params.get('export') == 'excel':
            import openpyxl
            from django.http import HttpResponse

            response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = 'attachment; filename="products_export.xlsx"'

            wb = openpyxl.Workbook()
            ws = wb.active
            ws.title = "Products"

            # Headers
            headers = ['ID', 'Name', 'SKU', 'Category', 'Brand', 'Price', 'Sale Price', 'Stock', 'Active', 'Featured']
            ws.append(headers)

            # Data
            for product in queryset:
                ws.append([
                    str(product.id),
                    product.name,
                    product.sku or '',
                    product.category.name if product.category else '',
                    product.brand or '',
                    product.price,
                    product.sale_price or '',
                    product.stock,
                    'Yes' if product.is_active else 'No',
                    'Yes' if product.is_featured else 'No'
                ])
            
            # Simple column width adjustment
            for col in ws.columns:
                max_length = 0
                column = col[0].column_letter # Get the column name
                for cell in col:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(str(cell.value))
                    except:
                        pass
                adjusted_width = (max_length + 2)
                ws.column_dimensions[column].width = adjusted_width

            wb.save(response)
            return response

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
        
        # Set this as primary, others for same product as False (handled by model save() usually, 
        # but let's be explicit or rely on model if it has logic)
        # Model save() logic: if self.is_primary: ProductImage.objects.filter(product=self.product...).update(is_primary=False)
        
        image.is_primary = True
        image.save()
        
        return Response({'status': 'success', 'message': 'Image set as primary'})
