#!/usr/bin/env python3
"""
User Database Management Module
Provides persistent user storage using SQLite for the NullSector Calculator API
"""

import sqlite3
import hashlib
import json
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UserDatabase:
    """Manages user data persistence using SQLite"""
    
    def __init__(self, db_path: str = "/app/data/users.db"):
        """Initialize the user database
        
        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        
        # Ensure the data directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Initialize the database
        self._init_database()
        
        # Migrate hardcoded users if this is a fresh database
        self._migrate_initial_users()
    
    def _init_database(self):
        """Initialize the database schema"""
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    username TEXT PRIMARY KEY,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    expires_at TEXT,
                    last_login TEXT,
                    is_active INTEGER NOT NULL DEFAULT 1,
                    metadata TEXT DEFAULT '{}'
                )
            """)
            
            # Create an index for faster lookups
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
            """)
            
            # Create a version table to track migrations
            conn.execute("""
                CREATE TABLE IF NOT EXISTS db_version (
                    version INTEGER PRIMARY KEY,
                    applied_at TEXT NOT NULL
                )
            """)
            
            conn.commit()
            logger.info("Database schema initialized")
    
    def _migrate_initial_users(self):
        """Migrate hardcoded users to the database if it's empty"""
        with sqlite3.connect(self.db_path) as conn:
            # Check if we have any users
            cursor = conn.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            if user_count == 0:
                logger.info("Empty database detected, migrating initial users...")
                
                # Initial users from the original system
                initial_users = {
                    'David': {
                        'password_hash': hashlib.sha256('Sk7walk3r!'.encode()).hexdigest(),
                        'role': 'admin',
                        'created_at': '2025-09-03T10:30:00Z',
                        'expires_at': None,
                        'last_login': '2025-09-30T14:22:00Z',
                        'is_active': True
                    },
                    'Thomas': {
                        'password_hash': hashlib.sha256('Th0mas@99'.encode()).hexdigest(),
                        'role': 'power_user',
                        'created_at': '2025-09-05T09:15:00Z',
                        'expires_at': '2025-11-05T09:15:00Z',
                        'last_login': '2025-09-28T11:45:00Z',
                        'is_active': True
                    },
                    'Kiko': {
                        'password_hash': hashlib.sha256('K1ko#2025'.encode()).hexdigest(),
                        'role': 'user',
                        'created_at': '2025-09-10T16:20:00Z',
                        'expires_at': '2025-10-24T16:20:00Z',
                        'last_login': '2025-09-29T08:30:00Z',
                        'is_active': True
                    },
                    'Maciej': {
                        'password_hash': hashlib.sha256('Mac1ej*77'.encode()).hexdigest(),
                        'role': 'power_user',
                        'created_at': '2025-09-12T13:45:00Z',
                        'expires_at': '2025-11-12T13:45:00Z',
                        'last_login': '2025-09-27T16:10:00Z',
                        'is_active': True
                    },
                    'admin': {
                        'password_hash': hashlib.sha256('Vader@66'.encode()).hexdigest(),
                        'role': 'admin',
                        'created_at': '2025-09-03T10:00:00Z',
                        'expires_at': None,
                        'last_login': '2025-10-01T09:00:00Z',
                        'is_active': True
                    }
                }
                
                for username, user_data in initial_users.items():
                    self.create_user(
                        username=username,
                        password_hash=user_data['password_hash'],
                        role=user_data['role'],
                        created_at=user_data['created_at'],
                        expires_at=user_data.get('expires_at'),
                        last_login=user_data.get('last_login'),
                        is_active=user_data['is_active'],
                        is_migration=True
                    )
                
                # Record the migration
                conn.execute(
                    "INSERT INTO db_version (version, applied_at) VALUES (1, ?)",
                    (datetime.now(timezone.utc).isoformat(),)
                )
                conn.commit()
                
                logger.info(f"Migrated {len(initial_users)} initial users to database")
    
    def get_user(self, username: str) -> Optional[Dict[str, Any]]:
        """Get a user by username
        
        Args:
            username: The username to look up
            
        Returns:
            User data dictionary or None if not found
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute(
                "SELECT * FROM users WHERE username = ?",
                (username,)
            )
            row = cursor.fetchone()
            
            if row:
                user_data = dict(row)
                user_data['is_active'] = bool(user_data['is_active'])
                user_data['metadata'] = json.loads(user_data.get('metadata', '{}'))
                return user_data
            
            return None
    
    def get_all_users(self) -> List[Dict[str, Any]]:
        """Get all users
        
        Returns:
            List of user data dictionaries
        """
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.execute("SELECT * FROM users ORDER BY created_at")
            rows = cursor.fetchall()
            
            users = []
            for row in rows:
                user_data = dict(row)
                user_data['is_active'] = bool(user_data['is_active'])
                user_data['metadata'] = json.loads(user_data.get('metadata', '{}'))
                users.append(user_data)
            
            return users
    
    def create_user(self, username: str, password_hash: str, role: str, 
                   created_at: Optional[str] = None, expires_at: Optional[str] = None,
                   last_login: Optional[str] = None, is_active: bool = True,
                   metadata: Optional[Dict] = None, is_migration: bool = False) -> bool:
        """Create a new user
        
        Args:
            username: The username
            password_hash: Pre-hashed password
            role: User role (admin, power_user, user)
            created_at: Creation timestamp (defaults to now)
            expires_at: Expiration timestamp (optional)
            last_login: Last login timestamp (optional)
            is_active: Whether the user is active
            metadata: Additional user metadata
            is_migration: Whether this is part of a migration (skips duplicate checks)
            
        Returns:
            True if created successfully, False if username already exists
        """
        if created_at is None:
            created_at = datetime.now(timezone.utc).isoformat()
        
        if metadata is None:
            metadata = {}
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.execute("""
                    INSERT INTO users (username, password_hash, role, created_at, 
                                     expires_at, last_login, is_active, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    username, password_hash, role, created_at,
                    expires_at, last_login, int(is_active), json.dumps(metadata)
                ))
                conn.commit()
                
                if not is_migration:
                    logger.info(f"Created user: {username} (role: {role})")
                
                return True
                
        except sqlite3.IntegrityError:
            if not is_migration:
                logger.warning(f"User {username} already exists")
            return False
    
    def update_user(self, username: str, **kwargs) -> bool:
        """Update a user's data
        
        Args:
            username: The username to update
            **kwargs: Fields to update (role, expires_at, last_login, is_active, metadata)
            
        Returns:
            True if updated successfully, False if user not found
        """
        if not self.get_user(username):
            return False
        
        # Build the update query dynamically
        update_fields = []
        values = []
        
        for field in ['role', 'expires_at', 'last_login']:
            if field in kwargs:
                update_fields.append(f"{field} = ?")
                values.append(kwargs[field])
        
        if 'is_active' in kwargs:
            update_fields.append("is_active = ?")
            values.append(int(kwargs['is_active']))
        
        if 'metadata' in kwargs:
            update_fields.append("metadata = ?")
            values.append(json.dumps(kwargs['metadata']))
        
        if not update_fields:
            return True  # Nothing to update
        
        values.append(username)  # For the WHERE clause
        
        with sqlite3.connect(self.db_path) as conn:
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE username = ?"
            conn.execute(query, values)
            conn.commit()
            
            logger.info(f"Updated user: {username}")
            return True
    
    def update_password(self, username: str, password_hash: str) -> bool:
        """Update a user's password hash
        
        Args:
            username: The username
            password_hash: New password hash
            
        Returns:
            True if updated successfully, False if user not found
        """
        if not self.get_user(username):
            return False
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute(
                "UPDATE users SET password_hash = ? WHERE username = ?",
                (password_hash, username)
            )
            conn.commit()
            
            logger.info(f"Updated password for user: {username}")
            return True
    
    def delete_user(self, username: str) -> bool:
        """Delete a user
        
        Args:
            username: The username to delete
            
        Returns:
            True if deleted successfully, False if user not found
        """
        if not self.get_user(username):
            return False
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute("DELETE FROM users WHERE username = ?", (username,))
            conn.commit()
            
            logger.info(f"Deleted user: {username}")
            return True
    
    def user_exists(self, username: str) -> bool:
        """Check if a user exists
        
        Args:
            username: The username to check
            
        Returns:
            True if user exists, False otherwise
        """
        return self.get_user(username) is not None
    
    def get_users_dict(self) -> Dict[str, Dict[str, Any]]:
        """Get all users as a dictionary (for backward compatibility)
        
        Returns:
            Dictionary with usernames as keys and user data as values
        """
        users = self.get_all_users()
        return {user['username']: user for user in users}
    
    def backup_database(self, backup_path: str) -> bool:
        """Create a backup of the database
        
        Args:
            backup_path: Path where to save the backup
            
        Returns:
            True if backup was successful
        """
        try:
            import shutil
            shutil.copy2(self.db_path, backup_path)
            logger.info(f"Database backed up to: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to backup database: {e}")
            return False
    
    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics
        
        Returns:
            Dictionary with database statistics
        """
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.execute("SELECT COUNT(*) FROM users")
            total_users = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT COUNT(*) FROM users WHERE is_active = 1")
            active_users = cursor.fetchone()[0]
            
            cursor = conn.execute("SELECT role, COUNT(*) FROM users GROUP BY role")
            role_counts = dict(cursor.fetchall())
            
            # Get database file size
            db_size = os.path.getsize(self.db_path) if os.path.exists(self.db_path) else 0
            
            return {
                'total_users': total_users,
                'active_users': active_users,
                'inactive_users': total_users - active_users,
                'role_counts': role_counts,
                'database_size_bytes': db_size,
                'database_path': self.db_path
            }


# Global database instance (will be initialized when the module is imported)
user_db = None

def init_user_database(db_path: str = "/app/data/users.db") -> UserDatabase:
    """Initialize the global user database instance
    
    Args:
        db_path: Path to the SQLite database file
        
    Returns:
        UserDatabase instance
    """
    global user_db
    user_db = UserDatabase(db_path)
    return user_db

def get_user_database() -> UserDatabase:
    """Get the global user database instance
    
    Returns:
        UserDatabase instance
        
    Raises:
        RuntimeError: If database hasn't been initialized
    """
    global user_db
    if user_db is None:
        raise RuntimeError("User database not initialized. Call init_user_database() first.")
    return user_db
