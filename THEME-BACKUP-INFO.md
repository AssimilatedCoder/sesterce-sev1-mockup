# Theme Backup Information

## Dark Theme Backup Created
**Date**: 2025-09-29
**Purpose**: Backup before implementing Nscale light theme

## Backup Files:
- `sesterce-dashboard/src/styles-backup-dark-theme/` - Complete styles directory backup
- `sesterce-dashboard/src/index-backup-dark-theme.css` - Main CSS backup

## Rollback Instructions:
To restore the dark theme:

```bash
# Remove current styles
rm -rf sesterce-dashboard/src/styles/

# Restore backup
cp -r sesterce-dashboard/src/styles-backup-dark-theme/ sesterce-dashboard/src/styles/

# Restore main CSS
cp sesterce-dashboard/src/index-backup-dark-theme.css sesterce-dashboard/src/index.css

# Restart development server
cd sesterce-dashboard && npm start
```

## Original Theme Characteristics:
- **Background**: Dark blue (#1f1f20)
- **Text**: White/light gray
- **Primary Color**: Null Sector green (#00c896)
- **Cards**: Dark panels with dark borders
- **Overall**: Professional dark theme suitable for technical users

## New Theme Target (Nscale):
- **Background**: White (#ffffff)
- **Text**: Dark blue/gray (#2c3e50)
- **Primary Color**: Nscale blue (#2563eb)
- **Cards**: White cards with subtle shadows
- **Overall**: Clean, modern light theme matching Nscale.com
