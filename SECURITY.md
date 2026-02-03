# Bloody Roar Platform - Environment Setup

## 🔐 Admin Configuration

The admin credentials are stored in environment variables for security.

### Setup Instructions

1. **Copy the example environment file:**
   ```bash
   cd client
   cp .env.example .env
   ```

2. **Update the `.env` file with your admin credentials:**
   ```env
   VITE_ADMIN_USERNAME=your_custom_admin_username
   VITE_ADMIN_PASSWORD=your_secure_password
   ```

3. **⚠️ IMPORTANT for Production:**
   - Never commit the `.env` file to GitHub
   - Use strong, unique passwords
   - Consider using environment variable services (Vercel, Netlify, etc.)
   - Rotate credentials regularly

### Default Credentials (Development Only)

If you don't set custom credentials, the system will use:
- Username: `admin`
- Password: `admin123`

**⚠️ WARNING:** These default credentials should NEVER be used in production!

## 📁 Files to Keep Safe

The following files contain sensitive information and are automatically ignored by Git:

- `.env` - Your actual environment variables
- `node_modules/` - Dependencies
- `uploads/` - User uploaded files

## 🔄 Rotation Best Practices

1. Change admin credentials monthly
2. Use password managers to generate strong passwords
3. Enable 2FA if implementing in future
4. Monitor admin access logs

## 🚀 Deployment Checklist

- [ ] Set strong admin credentials in deployment platform
- [ ] Verify `.env` is not in repository
- [ ] Test admin login with new credentials
- [ ] Document credential storage location for team
- [ ] Set up alerts for unauthorized access attempts

---

**Need Help?** Contact the system administrator.
