# Security Policy

## Overview

Quick Notes takes security seriously. This document outlines the security practices, data handling, and vulnerability reporting procedures.

## Data Security

### Local Storage
- **Notes, categories, and quick actions** are stored in browser localStorage for offline access
- localStorage is **not encrypted** by default
- Users should not store sensitive personal information (passwords, credit cards, etc.)
- localStorage is cleared when browser data is cleared

### Cloud Storage (Firebase)
- All data is encrypted in transit using HTTPS/TLS
- Firebase Firestore provides server-side encryption at rest
- User authentication is required to access data
- Each user can only access their own data via Firestore security rules

### Authentication
- **Google OAuth**: Handled by Firebase Authentication
- **Email/Password**: Hashed and salted by Firebase Authentication
- **Passwords are never stored locally** - only email is remembered if "Remember Me" is checked
- Session persistence can be configured (local or session-based)

## Input Validation & Sanitization

### Email Validation
- Client-side regex validation before submission
- Firebase performs additional server-side validation
- Invalid emails are rejected with user-friendly error messages

### User Input
- Note content, category names, and quick action text are sanitized
- HTML tags are stripped to prevent XSS attacks
- Maximum length limits are enforced:
  - Category names: 50 characters
  - Quick actions: 100 characters
  - Notes: 10,000 characters

### Content Security Policy (CSP)
- CSP headers are configured in `index.html`
- Restricts script execution to trusted sources
- Prevents inline script injection
- Allows Firebase and Google Auth domains

## Network Security

### HTTPS/TLS
- All communication with Firebase is encrypted
- CSP enforces HTTPS for external resources
- No sensitive data is transmitted in URLs

### CORS
- Firebase handles CORS automatically
- Only authorized domains can access the API

## Authentication Security

### Session Management
- Firebase handles session tokens securely
- Sessions can be persistent (localStorage) or temporary (sessionStorage)
- Users can sign out to clear session data
- Automatic logout on browser close (if session persistence is disabled)

### Password Reset
- Password reset emails are sent by Firebase
- Reset links expire after a set time
- Users must verify their email before resetting password

## Firestore Security Rules

### Recommended Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## Vulnerability Reporting

If you discover a security vulnerability, please email security@quicknotes.app with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

**Do not** open a public issue for security vulnerabilities.

## Best Practices for Users

1. **Use Strong Passwords**: Create unique, complex passwords for your account
2. **Enable 2FA**: Use two-factor authentication if available
3. **Keep Browser Updated**: Ensure your browser has the latest security patches
4. **Clear Browser Data**: Periodically clear localStorage and cookies
5. **Don't Share Credentials**: Never share your login credentials
6. **Use HTTPS**: Always access the app over HTTPS
7. **Logout on Shared Devices**: Always logout when using shared computers

## Known Limitations

- localStorage is not encrypted (browser limitation)
- XSS attacks could potentially access localStorage data
- Offline data is not encrypted locally
- Browser extensions could potentially access data

## Future Improvements

- [ ] Implement localStorage encryption using crypto-js
- [ ] Add end-to-end encryption for notes
- [ ] Implement two-factor authentication
- [ ] Add audit logging for sensitive operations
- [ ] Regular security audits and penetration testing

## Compliance

- GDPR: User data can be exported and deleted
- CCPA: Users have rights to access and delete their data
- Firebase complies with SOC 2, ISO 27001, and other standards

## Contact

For security questions or concerns, contact: security@quicknotes.app
