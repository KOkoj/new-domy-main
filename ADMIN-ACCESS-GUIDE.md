# How to Access the Admin Panel

## Quick Access Methods

### Method 1: Navigation Link (Easiest)
1. **Login** to your account on the website
2. Once logged in, you'll see an **"Admin"** button in the top navigation bar (next to your name)
3. Click the **"Admin"** button to access the admin panel
4. The admin panel is located at: `https://yourdomain.com/admin`

### Method 2: Direct URL
1. **Login** to your account first
2. Navigate directly to: `https://yourdomain.com/admin`
3. The admin panel will check your authentication and grant access

### Method 3: From Dashboard
1. Login to your account
2. Go to `/dashboard` (user dashboard)
3. You can navigate to admin from the navigation bar

## Admin Panel Features

Once you access `/admin`, you'll have access to:

### Main Dashboard (`/admin`)
- Overview statistics (users, inquiries, favorites, searches)
- Recent users and inquiries
- Quick action links
- System status

### User Management (`/admin/users`)
- View all registered users
- Filter and search users
- Update user roles (admin/user)
- View user activity statistics

### Inquiry Management (`/admin/inquiries`)
- View all property inquiries
- Respond to inquiries
- Filter by status (pending/responded)
- Search inquiries

### Content Management (`/admin/content`)
- **Properties Tab:**
  - View all properties from Sanity CMS
  - Create new properties
  - Edit existing properties
  - Delete properties
  - View property statistics
  
- **Regions Tab:**
  - View all regions from Sanity CMS
  - (Future: Edit/create regions)

- **Settings Tab:**
  - Site configuration
  - Email templates

### Email Testing (`/admin/email-test`)
- Test email notifications
- Verify email service configuration

## Authentication Requirements

**Current Setup:**
- Any authenticated user can access the admin panel (demo mode)
- In production, you may want to restrict this to users with `role: 'admin'` in their profile

**To Restrict Admin Access:**
1. Update `app/admin/layout.js`
2. Change the role check from allowing all authenticated users to requiring `role === 'admin'`

## Troubleshooting

### "Access Denied" Error
- Make sure you're logged in
- Check if your user profile has the correct role
- Try logging out and logging back in

### Admin Panel Not Loading
- Check browser console for errors
- Verify you're logged in
- Try clearing browser cache

### Can't See Properties in Content Management
- Verify Sanity CMS is configured (check environment variables)
- Check that you have properties in your Sanity dataset
- Look for error messages in the admin panel

## URL Structure

```
/admin                    → Admin Dashboard
/admin/users              → User Management
/admin/inquiries           → Inquiry Management
/admin/content             → Content Management (Sanity CMS)
/admin/email-test          → Email Testing
```

## Next Steps After Accessing Admin

1. **Configure Sanity CMS** - Add your Sanity credentials to enable content management
2. **Test Content Management** - Try creating a test property
3. **Review User Management** - Check registered users and their roles
4. **Check Inquiries** - Respond to any pending inquiries
5. **Test Email System** - Verify email notifications are working

## Security Notes

⚠️ **Important:** The current setup allows any authenticated user to access admin. For production:
- Implement proper role-based access control
- Restrict admin access to verified administrators only
- Consider adding 2FA for admin accounts
- Log admin actions for audit purposes

