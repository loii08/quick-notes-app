# Deployment Guide

This guide covers deploying Quick Notes to production.

## Prerequisites

- Node.js 16+ and npm
- Firebase account with Firestore and Authentication enabled
- Vercel account (recommended) or other hosting provider
- Domain name (optional)

## Environment Setup

### 1. Firebase Configuration

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Enter project name and follow setup wizard
4. Enable Firestore Database
5. Enable Authentication (Google and Email/Password)

#### Get Firebase Credentials
1. Go to Project Settings
2. Copy the Web API credentials
3. Create `.env.local` file with credentials:

```bash
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

#### Configure Firestore Security Rules
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

#### Configure Authentication
1. Go to Authentication > Sign-in method
2. Enable Google provider
3. Enable Email/Password provider
4. Configure authorized domains

## Deployment Options

### Option 1: Vercel (Recommended)

#### Setup
1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - Add all Firebase credentials from `.env.local`
6. Click "Deploy"

#### Environment Variables in Vercel
1. Go to Project Settings > Environment Variables
2. Add each Firebase credential:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - etc.
3. Redeploy after adding variables

#### Custom Domain
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Option 2: Firebase Hosting

#### Setup
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init hosting

# Build the project
npm run build

# Deploy
firebase deploy
```

#### Configuration
Edit `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### Option 3: Netlify

#### Setup
1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variables
7. Deploy

#### Environment Variables
1. Go to Site Settings > Build & Deploy > Environment
2. Add Firebase credentials
3. Trigger redeploy

## Pre-Deployment Checklist

### Code Quality
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] All tests pass
- [ ] Code follows style guide
- [ ] No hardcoded secrets or credentials

### Performance
- [ ] Build size is optimized
- [ ] Images are optimized
- [ ] Lazy loading is implemented
- [ ] No unnecessary dependencies

### Security
- [ ] Environment variables are configured
- [ ] HTTPS is enabled
- [ ] CSP headers are set
- [ ] Firestore rules are restrictive
- [ ] No sensitive data in code

### Testing
- [ ] Tested on desktop browsers
- [ ] Tested on mobile browsers
- [ ] Tested offline functionality
- [ ] Tested authentication flows
- [ ] Tested data sync

## Build and Deploy

### Build for Production
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Preview the build locally
npm run preview
```

### Deploy
```bash
# Using Vercel
vercel

# Using Firebase
firebase deploy

# Using Netlify
netlify deploy --prod
```

## Post-Deployment

### Verification
1. Visit your deployed site
2. Test authentication (Google and Email)
3. Create a test note
4. Verify data appears in Firestore
5. Test offline functionality
6. Test sync when back online

### Monitoring
- Monitor Firebase usage and costs
- Check error logs in Firebase Console
- Monitor performance metrics
- Set up alerts for errors

### Maintenance
- Keep dependencies updated
- Monitor security advisories
- Regular backups of Firestore data
- Monitor and optimize costs

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firestore security rules
- Ensure Firebase project is active
- Check browser console for errors

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist`
- Check Node.js version: `node --version`

### Authentication Issues
- Verify authorized domains in Firebase Console
- Check authentication provider configuration
- Clear browser cookies and localStorage
- Check browser console for errors

### Performance Issues
- Analyze bundle size: `npm run build -- --analyze`
- Check Firestore query performance
- Optimize images and assets
- Enable caching headers

## Rollback

### Vercel
1. Go to Deployments
2. Click on previous deployment
3. Click "Promote to Production"

### Firebase
```bash
# List previous versions
firebase hosting:channel:list

# Rollback to previous version
firebase hosting:clone <source-version> production
```

### Netlify
1. Go to Deploys
2. Click on previous deploy
3. Click "Publish deploy"

## Scaling

### Database
- Monitor Firestore usage
- Optimize queries
- Consider database sharding for large datasets
- Set up automated backups

### Storage
- Monitor storage usage
- Archive old data
- Implement data retention policies

### Performance
- Use CDN for static assets
- Implement caching strategies
- Monitor and optimize Core Web Vitals
- Consider edge functions for optimization

## Cost Optimization

### Firebase
- Use Firestore's free tier for development
- Monitor read/write operations
- Implement efficient queries
- Archive old data

### Hosting
- Use free tier if available
- Monitor bandwidth usage
- Implement caching
- Optimize asset sizes

## Support

For deployment issues:
- Check [Vercel Docs](https://vercel.com/docs)
- Check [Firebase Docs](https://firebase.google.com/docs)
- Check [Netlify Docs](https://docs.netlify.com)
- Open an issue on GitHub
- Email: support@quicknotes.app
