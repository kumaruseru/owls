from rest_framework import serializers
from .models import Category, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'parent', 'product_count')


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'order')


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    current_price = serializers.ReadOnlyField()
    discount_percent = serializers.ReadOnlyField()
    primary_image = serializers.ImageField(read_only=True)
    average_rating = serializers.ReadOnlyField()
    review_count = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'short_description', 'price', 'sale_price',
                  'current_price', 'discount_percent', 'category', 'stock', 'brand',
                  'is_featured', 'primary_image', 'average_rating', 'review_count', 'is_in_stock', 'is_active')


class ProductDetailSerializer(ProductListSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ('description', 'sku', 'color', 'attributes', 'images')


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products with category ID and image handling."""
    image = serializers.ImageField(write_only=True, required=False)
    
    class Meta:
        model = Product
        fields = ('id', 'name', 'slug', 'description', 'price', 'sale_price',
                  'category', 'stock', 'brand', 'is_featured', 'image', 'sku', 'color', 'is_active', 'attributes')
        read_only_fields = ('id', 'slug')

    def validate_attributes(self, value):
        if isinstance(value, str):
            import json
            try:
                return json.loads(value)
            except ValueError:
                raise serializers.ValidationError("Invalid JSON format for attributes")
        return value

    def create(self, validated_data):
        image = validated_data.pop('image', None)
        product = Product.objects.create(**validated_data)
        
        if image:
            ProductImage.objects.create(product=product, image=image, is_primary=True)
            
        return product

    def update(self, instance, validated_data):
        image = validated_data.pop('image', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if image:
            # Create new image and set as primary. 
            # The ProductImage model's save() method will automatically unset is_primary for other images.
            ProductImage.objects.create(product=instance, image=image, is_primary=True)
            
        return instance
