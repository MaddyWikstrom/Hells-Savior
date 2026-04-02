# Hells Savior - Official Website

A modern, responsive website for SoundCloud rapper Hells Savior, featuring music integration, merchandise store, and social media connectivity.

## 🎵 Features

- **Responsive Design**: Mobile-first approach with dark, edgy theme
- **Music Integration**: SoundCloud player integration for latest tracks
- **Shopify Integration**: Built-in merchandise store with Buy Button SDK
- **Social Media Links**: Direct links to all social platforms
- **SEO Optimized**: Meta tags, sitemap, and structured data
- **Performance Optimized**: Fast loading with optimized assets
- **Netlify Ready**: Pre-configured for seamless deployment

## 🚀 Quick Start

### Prerequisites
- Netlify account
- Shopify store (for merchandise)
- Domain name (optional)

### Deployment Steps

#### 1. Netlify Deployment
1. Fork or download this repository
2. Connect your Netlify account to your Git repository
3. Deploy settings:
   - **Build command**: `echo 'No build command needed'`
   - **Publish directory**: `.` (root)
   - **Node version**: 18

#### 2. Domain Setup
1. In Netlify dashboard, go to Domain settings
2. Add your custom domain (e.g., hellssavior.com)
3. Configure DNS settings as provided by Netlify
4. Enable HTTPS (automatic with Netlify)

#### 3. Shopify Integration
1. Create a Shopify store at [shopify.com](https://shopify.com)
2. Generate a Storefront Access Token:
   - Go to Apps → Manage private apps
   - Create private app with Storefront API access
   - Copy the Storefront access token
3. Update [`js/main.js`](js/main.js) with your store details:
   ```javascript
   const client = ShopifyBuy.buildClient({
     domain: 'your-shop-name.myshopify.com',
     storefrontAccessToken: 'your-storefront-access-token'
   });
   ```
4. Add your product IDs to the `productIds` array

#### 4. Content Customization
1. Update social media links in [`index.html`](index.html)
2. Replace placeholder content with actual artist information
3. Add real track information and SoundCloud embeds
4. Upload artist photos and merchandise images

## 📁 Project Structure

```
hells-savior-website/
├── index.html          # Main HTML file
├── styles/
│   └── main.css        # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── netlify.toml        # Netlify configuration
├── robots.txt          # SEO robots file
├── sitemap.xml         # XML sitemap
└── README.md           # This file
```

## 🎨 Customization

### Colors
The site uses a dark theme with red accents. Main colors:
- **Primary**: `#ff0000` (Red)
- **Background**: `#0a0a0a` (Dark)
- **Text**: `#ffffff` (White)
- **Secondary**: `#cccccc` (Light Gray)

### Fonts
- **Headers**: Bebas Neue (Google Fonts)
- **Body**: Inter (Google Fonts)

### Sections
1. **Hero**: Main landing with artist name and call-to-action
2. **Music**: Latest tracks with SoundCloud integration
3. **Merchandise**: Shopify-powered store
4. **About**: Artist biography and photo
5. **Contact**: Social media links and contact info

## 🔧 Configuration

### Environment Variables (Optional)
For advanced setups, you can use Netlify environment variables:
- `SHOPIFY_DOMAIN`: Your Shopify store domain
- `SHOPIFY_TOKEN`: Storefront access token
- `GOOGLE_ANALYTICS_ID`: GA tracking ID

### SEO Configuration
Update the following in [`index.html`](index.html):
- Meta description
- Keywords
- Open Graph tags
- Twitter Card tags
- Structured data (JSON-LD)

## 📱 Social Media Integration

Update these links in the HTML:
- **SoundCloud**: Main music platform
- **Instagram**: Visual content and stories
- **Twitter**: Updates and engagement
- **YouTube**: Music videos and content

## 🛠️ Development

### Local Development
1. Clone the repository
2. Open `index.html` in a web browser
3. Use a local server for testing (e.g., Live Server in VS Code)

### Testing
- Test on multiple devices and browsers
- Verify all links work correctly
- Test Shopify integration with actual products
- Check mobile responsiveness

## 📈 Analytics & Monitoring

### Google Analytics
Add your GA4 tracking code to [`index.html`](index.html):
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

### Performance Monitoring
- Use Netlify Analytics for traffic insights
- Monitor Core Web Vitals with Google PageSpeed Insights
- Set up uptime monitoring

## 🔒 Security

The site includes security headers in [`netlify.toml`](netlify.toml):
- Content Security Policy
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options

## 📞 Support

For technical issues:
1. Check Netlify deployment logs
2. Verify Shopify API credentials
3. Test on different browsers/devices
4. Check browser console for JavaScript errors

## 🎯 Similar Setup Reference

This website follows a similar structure to bobbytherabbit.com:
- Static site hosted on Netlify
- Custom domain configuration
- Shopify integration for merchandise
- Social media integration
- Mobile-responsive design

## 📝 License

This project is created for Hells Savior. All rights reserved.

---

**Ready to deploy?** Follow the steps above and your artist website will be live in minutes! 🚀