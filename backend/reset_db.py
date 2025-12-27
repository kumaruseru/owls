"""
Script để reset database PostgreSQL.
Xóa toàn bộ tables và recreate schema.

Chạy: python reset_db.py
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.db import connection


def reset_database():
    """Drop all tables and reset schema."""
    print("⚠️  WARNING: This will DELETE ALL DATA in the database!")
    confirm = input("Type 'yes' to confirm: ")
    
    if confirm.lower() != 'yes':
        print("Cancelled.")
        return
    
    print("\n🔄 Resetting database...")
    
    with connection.cursor() as cursor:
        # Drop all tables in public schema
        cursor.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        
        # Drop all types (for enums)
        cursor.execute("""
            DO $$ DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
                    EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.typname) || ' CASCADE';
                END LOOP;
            END $$;
        """)
    
    print("✅ Database reset successfully!")
    print("\n📝 Now run:")
    print("   python manage.py migrate")
    print("   python manage.py createsuperuser")


if __name__ == '__main__':
    reset_database()
