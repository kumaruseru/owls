"""
Database management script.
Run this file to reset database and recreate migrations.

Usage: python main.py
"""

import os
import sys
from pathlib import Path

# Setup paths
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))

# Load .env BEFORE Django setup
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '.env')

# Setup Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

import django
django.setup()

from django.conf import settings
from django.core.management import call_command
from django.db import connection


def reset_database():
    """Reset database based on engine type."""
    engine = settings.DATABASES['default']['ENGINE']
    
    if 'sqlite' in engine:
        # For SQLite, delete the database file
        db_path = settings.DATABASES['default'].get('NAME')
        if db_path and os.path.exists(db_path):
            os.remove(db_path)
            print(f"✓ Deleted SQLite database: {db_path}")
        else:
            print("No SQLite database file found.")
    elif 'postgresql' in engine or 'postgres' in engine:
        # For PostgreSQL, drop all tables
        print("Dropping all PostgreSQL tables...")
        with connection.cursor() as cursor:
            cursor.execute("""
                DO $$ DECLARE
                    r RECORD;
                BEGIN
                    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                    END LOOP;
                END $$;
            """)
        print("✓ All tables dropped.")
    else:
        print(f"Database engine '{engine}' not fully supported.")
        print("Attempting to flush database...")
        try:
            call_command('flush', '--no-input')
            print("✓ Database flushed.")
        except Exception as e:
            print(f"Failed to flush: {e}")
            return False
    
    return True


def create_migrations():
    """Create migrations for all apps."""
    print("\n📦 Creating migrations...")
    call_command('makemigrations', 'users', 'products', 'cart', 'orders', 'reviews')
    print("✓ Migrations created.")


def run_migrations():
    """Run all migrations."""
    print("\n🔄 Running migrations...")
    call_command('migrate')
    print("✓ Migrations applied.")


def create_superuser():
    """Create a superuser for admin access."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    
    email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@owls.asia')
    username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
    password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin123')
    
    if not User.objects.filter(email=email).exists():
        User.objects.create_superuser(
            email=email,
            username=username,
            password=password
        )
        print(f"\n✓ Superuser created:")
        print(f"  Email: {email}")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
    else:
        print(f"\n⚠ Superuser with email {email} already exists.")


def main():
    print("=" * 50)
    print("OWLS E-Commerce Database Management")
    print("=" * 50)
    
    engine = settings.DATABASES['default']['ENGINE']
    print(f"\nDatabase Engine: {engine}")
    
    # Confirm before dropping
    confirm = input("\n⚠️  This will DELETE all data. Continue? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("\n🗑️  Resetting database...")
    if reset_database():
        create_migrations()
        run_migrations()
        create_superuser()
        
        print("\n" + "=" * 50)
        print("✅ Database reset complete!")
        print("=" * 50)
        print("\nYou can now run: python manage.py runserver")


if __name__ == '__main__':
    main()
