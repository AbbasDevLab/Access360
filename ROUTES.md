# Access360 - Available Routes

## Main Application Routes (with header/footer)
These routes are wrapped in the main layout with navigation:

- **Home Page**: `http://localhost:5177/` or `http://localhost:5177/`
- **Enroll**: `http://localhost:5177/enroll`
- **Verify**: `http://localhost:5177/verify`
- **Reports/Passes**: `http://localhost:5177/passes`
- **Departments**: `http://localhost:5177/departments`
- **Guests**: `http://localhost:5177/guests`
- **Guest Visits**: `http://localhost:5177/guest-visits`
- **Locations**: `http://localhost:5177/locations`
- **Visitor Types**: `http://localhost:5177/visitor-types`
- **Admin**: `http://localhost:5177/admin`

## Guard Routes (standalone, no header/footer)
These routes are for the guard counter interface:

- **Guard Login**: `http://localhost:5177/guard/login`
- **Guard Dashboard**: `http://localhost:5177/guard/dashboard`

## Testing Routes
Try these URLs in your browser (replace `5177` with your actual port if different):

1. **Start with Home**: `http://localhost:5177/`
2. **Guard Login** (simplest): `http://localhost:5177/guard/login`
3. **Admin Panel**: `http://localhost:5177/admin`

## Note
If pages are blank, check:
- Browser console (F12) for errors
- Network tab to see if files are loading
- Terminal for compilation errors


