import openpyxl
from django.http import HttpResponse

class ProductExportService:
    @staticmethod
    def export_to_excel(queryset):
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
