#!/usr/bin/env python3
"""
Test script to verify user database persistence
This script can be run to test the user database functionality
"""

import os
import sys
import hashlib
from datetime import datetime, timezone, timedelta

# Add the backend directory to the path so we can import user_database
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(project_root, 'backend', 'database'))

from user_database import UserDatabase

def test_user_database():
    """Test the user database functionality"""
    print("🧪 Testing User Database Persistence...")
    
    # Use a test database file
    test_db_path = "/tmp/test_users.db"
    
    # Clean up any existing test database
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    # Initialize database
    print("1. Initializing database...")
    db = UserDatabase(test_db_path)
    
    # Check initial migration
    print("2. Checking initial users migration...")
    users = db.get_all_users()
    print(f"   Found {len(users)} initial users")
    for user in users:
        print(f"   - {user['username']} ({user['role']})")
    
    # Test creating a new user
    print("3. Creating a test user...")
    test_username = f"testuser_{int(datetime.now().timestamp())}"
    password_hash = hashlib.sha256("TestPassword123!".encode()).hexdigest()
    
    success = db.create_user(
        username=test_username,
        password_hash=password_hash,
        role="user",
        expires_at=(datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
    )
    
    if success:
        print(f"   ✅ Created user: {test_username}")
    else:
        print(f"   ❌ Failed to create user: {test_username}")
        return False
    
    # Test retrieving the user
    print("4. Retrieving the test user...")
    user = db.get_user(test_username)
    if user:
        print(f"   ✅ Retrieved user: {user['username']} (role: {user['role']})")
    else:
        print(f"   ❌ Failed to retrieve user: {test_username}")
        return False
    
    # Test updating the user
    print("5. Updating the test user...")
    success = db.update_user(test_username, role="power_user", is_active=True)
    if success:
        updated_user = db.get_user(test_username)
        print(f"   ✅ Updated user role to: {updated_user['role']}")
    else:
        print(f"   ❌ Failed to update user: {test_username}")
        return False
    
    # Test password update
    print("6. Updating user password...")
    new_password_hash = hashlib.sha256("NewPassword456!".encode()).hexdigest()
    success = db.update_password(test_username, new_password_hash)
    if success:
        updated_user = db.get_user(test_username)
        if updated_user['password_hash'] == new_password_hash:
            print("   ✅ Password updated successfully")
        else:
            print("   ❌ Password hash mismatch")
            return False
    else:
        print(f"   ❌ Failed to update password for: {test_username}")
        return False
    
    # Test database stats
    print("7. Getting database statistics...")
    stats = db.get_database_stats()
    print(f"   Total users: {stats['total_users']}")
    print(f"   Active users: {stats['active_users']}")
    print(f"   Role counts: {stats['role_counts']}")
    print(f"   Database size: {stats['database_size_bytes']} bytes")
    
    # Test backup
    print("8. Testing database backup...")
    backup_path = "/tmp/test_users_backup.db"
    success = db.backup_database(backup_path)
    if success and os.path.exists(backup_path):
        print(f"   ✅ Backup created: {backup_path}")
        os.remove(backup_path)  # Clean up
    else:
        print("   ❌ Failed to create backup")
        return False
    
    # Test persistence by creating a new database instance
    print("9. Testing persistence with new database instance...")
    db2 = UserDatabase(test_db_path)
    persistent_user = db2.get_user(test_username)
    if persistent_user and persistent_user['role'] == 'power_user':
        print("   ✅ Data persisted across database instances")
    else:
        print("   ❌ Data not persisted properly")
        return False
    
    # Test user deletion
    print("10. Testing user deletion...")
    success = db.delete_user(test_username)
    if success:
        deleted_user = db.get_user(test_username)
        if deleted_user is None:
            print(f"   ✅ User {test_username} deleted successfully")
        else:
            print(f"   ❌ User {test_username} still exists after deletion")
            return False
    else:
        print(f"   ❌ Failed to delete user: {test_username}")
        return False
    
    # Clean up test database
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    print("\n🎉 All tests passed! User database persistence is working correctly.")
    return True

def test_production_database():
    """Test the production database path (read-only)"""
    print("\n🔍 Testing Production Database Access...")
    
    prod_db_path = "/app/data/users.db"
    
    # Check if we can access the production database path
    if os.path.exists(prod_db_path):
        print(f"   ✅ Production database exists: {prod_db_path}")
        
        try:
            db = UserDatabase(prod_db_path)
            stats = db.get_database_stats()
            print(f"   📊 Production database stats:")
            print(f"      Total users: {stats['total_users']}")
            print(f"      Active users: {stats['active_users']}")
            print(f"      Database size: {stats['database_size_bytes']} bytes")
            return True
        except Exception as e:
            print(f"   ❌ Failed to access production database: {e}")
            return False
    else:
        print(f"   ℹ️  Production database not found (expected in Docker environment)")
        print(f"      Path: {prod_db_path}")
        return True  # This is expected outside of Docker

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 USER DATABASE PERSISTENCE TEST")
    print("=" * 60)
    
    # Run the main test
    success = test_user_database()
    
    # Try to test production database if available
    test_production_database()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ ALL TESTS PASSED - User persistence is working!")
        sys.exit(0)
    else:
        print("❌ TESTS FAILED - Check the output above for details")
        sys.exit(1)
