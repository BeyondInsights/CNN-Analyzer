# Netlify Deployment Guide

## Quick Deploy to Netlify

### Step 1: Connect Repository
1. Go to https://netlify.com and sign in
2. Click "New site from Git"
3. Choose "GitHub" as your Git provider
4. Select the `BeyondInsights/CNN-Analyzer` repository
5. Click "Deploy site"

### Step 2: Configure Build Settings

In the Netlify dashboard for your site:

**Build Settings:**
- Base directory: `(leave empty)`
- Build command: `npm run build:netlify`
- Publish directory: `.next`
- Functions directory: `netlify/functions` (if using)

**Node.js Version:**
- Go to Site settings → Environment variables
- Add: `NODE_VERSION` = `18.17.0`

### Step 3: Environment Variables

Add these in Site settings → Environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Step 4: Deploy

1. Click "Deploy site" or trigger a new deploy
2. Monitor the build logs for any issues
3. Once deployed, test your site functionality

## Troubleshooting

### Build Failures
- Check the build logs in Netlify dashboard
- Error logs are saved to files for detailed debugging
- Run `./check-build.sh` locally to preview issues

### Environment Issues
- Ensure all Firebase environment variables are set
- Check that variable names match exactly (case-sensitive)
- Verify Firebase project settings

### Performance Optimization
- Enable Netlify's Asset Optimization
- Use Netlify Analytics for monitoring
- Consider enabling Branch deploys for testing

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Authentication works
- [ ] Firebase data loading functions
- [ ] All modals and features operational
- [ ] Mobile responsiveness
- [ ] Performance acceptable (< 3s load time)

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add custom domain
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

Your CNN Analyzer is now live! 🎉
