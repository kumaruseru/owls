import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.users.models import User

user = User.objects.filter(email='admin@owls.asia').first()
print(f"User exists: {user is not None}")
if user:
    print(f"Email: {user.email}")
    print(f"Username: {user.username}")
    print(f"Is active: {user.is_active}")
    print(f"Is superuser: {user.is_superuser}")
    print(f"Password check: {user.check_password('admin123')}")
else:
    print("User not found!")
    print("All users:", list(User.objects.values_list('email', flat=True)))
