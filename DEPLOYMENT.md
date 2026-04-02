# Hells Savior Website - Deployment Guide

## 🚀 Quick Deployment Checklist

### Pre-Deployment Setup
- [ ] **Shopify Store Setup**
  - [ ] Create Shopify store at [shopify.com](https://shopify.com)
  - [ ] Add products (T-shirts, hoodies, merchandise)
  - [ ] Generate Storefront Access Token
  - [ ] Update [`js/main.js`](js/main.js) with store credentials

- [ ] **Content Updates**
  - [ ] Replace placeholder social media links in [`index.html`](index.html)
  - [ ] Update artist bio in About section
  - [ ] Add real track titles and SoundCloud links
  - [ ] Replace placeholder images with actual photos

### Netlify Deployment Steps

#### 1. Repository Setup
```bash
# If using Git
git init
git add .
git commit -m "Initial commit - Hells Savior website"
git remote add origin https://github.com/yourusername/hells-savior-website.git
git push -u origin main
```

#### 2. Netlify Configuration
1. **Login to Netlify**: [netlify.com](https://netlify.com)
2. **New Site from Git**: Connect your repository
3. **Build Settings**:
   - Build command: `echo 'Static site - no build needed'`
   - Publish directory: `.` (root directory)
   - Node version: `18`

#### 3. Domain Setup
1. **Custom Domain**: Add your domain (e.g., `hellssavior.com`)
2. **DNS Configuration**: Update nameservers to Netlify's
3. **SSL Certificate**: Enable HTTPS (automatic)

#### 4. Environment Variables (Optional)
In Netlify dashboard → Site settings → Environment variables:
```
SHOPIFY_DOMAIN=your-shop-name.myshopify.com
SHOPIFY_TOKEN=your-storefront-access-token
```

### Post-Deployment Testing

#### ✅ Functionality Tests
- [ ] **Navigation**
  - [ ] Mobile menu toggle works
  - [ ] Smooth scrolling to sections
  - [ ] All navigation links functional

- [ ] **Responsive Design**
  - [ ] Test on mobile devices
  - [ ] Test on tablets
  - [ ] Test on desktop screens
  - [ ] Check all breakpoints

- [ ] **Interactive Elements**
  - [ ] Play buttons on music tracks
  - [ ] Social media links open correctly
  - [ ] Hover effects work properly
  - [ ] Scroll animations trigger

- [ ] **Shopify Integration**
  - [ ] Products load correctly
  - [ ] Buy buttons functional
  - [ ] Cart functionality works
  - [ ] Checkout process smooth

- [ ] **SEO & Performance**
  - [ ] Meta tags populated
  - [ ] Sitemap accessible at `/sitemap.xml`
  - [ ] Robots.txt accessible at `/robots.txt`
  - [ ] Page loads under 3 seconds
  - [ ] Images optimized and loading

#### 🔧 Browser Testing
Test on these browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Content Management

#### Social Media Links to Update
Replace these placeholder URLs in [`index.html`](index.html):
```html
<!-- Update these with real URLs -->
<a href="https://soundcloud.com/hellssavior" target="_blank">
<a href="https://instagram.com/hellssavior" target="_blank">
<a href="https://twitter.com/hellssavior" target="_blank">
<a href="https://youtube.com/@hellssavior" target="_blank">
```

#### Shopify Store Configuration
In [`js/main.js`](js/main.js), update:
```javascript
const client = ShopifyBuy.buildClient({
  domain: 'your-actual-store.myshopify.com', // Replace this
  storefrontAccessToken: 'your-actual-token' // Replace this
});

// Add your actual product IDs
const productIds = [
  'gid://shopify/Product/YOUR_PRODUCT_ID_1',
  'gid://shopify/Product/YOUR_PRODUCT_ID_2',
  'gid://shopify/Product/YOUR_PRODUCT_ID_3'
];
```

### Analytics Setup (Optional)

#### Google Analytics 4
Add to [`index.html`](index.html) before closing `</head>`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

#### Facebook Pixel (Optional)
```html
<!-- Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'YOUR_PIXEL_ID');
  fbq('track', 'PageView');
</script>
```

### Troubleshooting

#### Common Issues
1. **Shopify products not loading**
   - Check domain and access token
   - Verify product IDs are correct
   - Ensure Storefront API is enabled

2. **Mobile menu not working**
   - Check JavaScript console for errors
   - Verify all script files are loading

3. **Images not displaying**
   - Check file paths are correct
   - Ensure images are optimized for web
   - Verify CDN links are working

4. **Slow loading**
   - Optimize images (use WebP format)
   - Enable Netlify's asset optimization
   - Check for unused CSS/JS

#### Performance Optimization
- [ ] **Image Optimization**
  - Use WebP format when possible
  - Compress images to under 100KB
  - Use appropriate dimensions

- [ ] **Code Optimization**
  - Minify CSS and JavaScript
  - Remove unused code
  - Enable Gzip compression

### Maintenance

#### Regular Updates
- [ ] **Monthly**: Update social media links
- [ ] **Weekly**: Check for broken links
- [ ] **As needed**: Add new music tracks
- [ ] **Quarterly**: Review and update SEO content

#### Security
- [ ] Keep Shopify store updated
- [ ] Monitor for security vulnerabilities
- [ ] Regular backup of content

### Support Resources

- **Netlify Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Shopify Buy Button SDK**: [shopify.dev/docs/api/storefront](https://shopify.dev/docs/api/storefront)
- **Web Performance**: [web.dev](https://web.dev)

---

## 🎯 Success Metrics

After deployment, monitor these metrics:
- **Page Load Speed**: < 3 seconds
- **Mobile Performance**: > 90 score
- **SEO Score**: > 85
- **Conversion Rate**: Track merchandise sales
- **Social Engagement**: Monitor click-through rates

---

**Ready to go live?** Follow this checklist step by step, and your Hells Savior website will be live and performing optimally! 🔥