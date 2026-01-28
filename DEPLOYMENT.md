# Deployment Guide for Vercel

## 🚀 Quick Deploy

### Option 1: Vercel CLI (Recommended for developers)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project directory**
   ```bash
   cd caliquest
   vercel --prod
   ```

### Option 2: GitHub Integration (Recommended for teams)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a static site

3. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

## 🔧 Configuration Files

### `vercel.json`
- Static site configuration
- Routing rules
- Security headers
- Cache settings

### `package.json`
- Build scripts
- Dependencies
- Node.js version requirement

## 📋 Pre-Deployment Checklist

- [ ] Update Supabase configuration
- [ ] Test all authentication flows
- [ ] Verify responsive design
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Validate HTML/CSS
- [ ] Optimize images
- [ ] Set up custom domain (optional)

## 🌍 Custom Domain Setup

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., caliquest.com)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate (usually 5-10 minutes)

## 📊 Analytics and Monitoring

Vercel provides built-in:
- Real-time analytics
- Performance metrics
- Error tracking
- Web Vitals

## 🔄 Automatic Deployments

With GitHub integration:
- Every push to main branch → Production
- Every push to other branches → Preview
- Pull requests get preview URLs

## 🚨 Troubleshooting

### Common Issues:

1. **Build fails**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed

2. **Supabase connection errors**
   - Verify environment variables
   - Check Supabase project settings

3. **Routing issues**
   - Check `vercel.json` configuration
   - Verify file structure

4. **CORS errors**
   - Configure CORS in Supabase
   - Add domain to allowed origins

### Getting Help:

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Supabase Documentation: [supabase.com/docs](https://supabase.com/docs)
- Vercel Support: support@vercel.com

## 🎯 Performance Optimization

Vercel automatically:
- Minifies HTML/CSS/JS
- Optimizes images
- Enables Gzip compression
- Provides CDN globally
- Caches static assets

Expected performance:
- Lighthouse score: 90+
- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s

## 📱 Mobile Optimization

The site is fully responsive and optimized for:
- iOS Safari 14+
- Chrome Mobile 90+
- Samsung Internet 14+

## 🔒 Security Features

- HTTPS enforced
- Security headers configured
- XSS protection enabled
- Content type validation
- Frame protection

## 💰 Pricing

Vercel Free Tier includes:
- 100GB bandwidth/month
- Static site hosting
- Custom domains
- SSL certificates
- Analytics

For high-traffic sites, consider Pro plan ($20/month).
