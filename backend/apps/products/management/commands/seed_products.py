import json
import os
import requests
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.conf import settings
from apps.products.models import Category, Product, ProductImage
from django.utils.text import slugify

class Command(BaseCommand):
    help = 'Seed database with mock products'

    def handle(self, *args, **options):
        # Path to the json file
        json_file_path = os.path.join(settings.BASE_DIR, 'apps/products/fixtures/mock_products.json')
        
        if not os.path.exists(json_file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {json_file_path}'))
            return

        with open(json_file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.stdout.write('Seeding data...')

        for category_data in data:
            category_name = category_data['name']
            
            # Create or get category
            slug = category_data.get('slug', slugify(category_name))
            category, created = Category.objects.get_or_create(
                slug=slug,
                defaults={
                    'name': category_name,
                    'description': category_data.get('description', '')
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category_name}'))
            else:
                self.stdout.write(f'Category already exists: {category_name}')

            # Create products
            for product_data in category_data.get('products', []):
                product_name = product_data['name']
                
                product, created = Product.objects.get_or_create(
                    sku=product_data.get('sku'),
                    defaults={
                        'name': product_name,
                        'slug': slugify(product_name),
                        'description': product_data.get('description', ''),
                        'short_description': product_data.get('short_description', ''),
                        'price': product_data.get('price', 0),
                        'sale_price': product_data.get('sale_price'),
                        'stock': product_data.get('stock', 0),
                        'is_featured': product_data.get('is_featured', False),
                        'category': category
                    }
                )

                if created:
                    self.stdout.write(self.style.SUCCESS(f'  Created product: {product_name}'))
                    
                    # Handle Images
                    images_data = product_data.get('images', [])
                    for idx, img_data in enumerate(images_data):
                        img_url = img_data.get('url')
                        is_primary = img_data.get('is_primary', False)
                        
                        if img_url:
                            try:
                                response = requests.get(img_url)
                                if response.status_code == 200:
                                    file_name = f"{slugify(product_name)}_{idx+1}.jpg"
                                    
                                    product_image = ProductImage(
                                        product=product,
                                        is_primary=is_primary,
                                        order=idx,
                                        alt_text=f"{product_name} image"
                                    )
                                    product_image.image.save(file_name, ContentFile(response.content), save=True)
                                    self.stdout.write(f'    Downloaded image: {file_name} -> {product_image.image.url} -> {product_image.image.url}')
                            except Exception as e:
                                self.stdout.write(self.style.WARNING(f'    Failed to download image {img_url}: {e}'))

                else:
                    self.stdout.write(f'  Product already exists: {product_name}')

        self.stdout.write(self.style.SUCCESS('Data seeding completed!'))
