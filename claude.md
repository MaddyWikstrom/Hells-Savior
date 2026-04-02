# Claude Development Notes

## Project: Hells Savior Website

### Structure Created:
- Expert-level organization with src/, config/, assets/ folders
- Removed README files as requested
- **FIXED**: Mostly black background with red/blue highlights
- **FIXED**: Simple ✰ star (not complex ASCII)
- **FIXED**: Clean loading screen animation
- Loading screen with smooth transitions (like bobbytherabbit.com)
- Shopify integration ready (awaiting credentials)

### Key Files:
- `index.html` - Main page with loading screen
- `src/css/` - Modular CSS (main, loading, animations)
- `src/js/` - Modular JS (loading, main, shopify, animations)
- `config/site-config.js` - Centralized configuration

### Recent Fixes (Commit 56104f2):
- Changed to mostly black (#000000) background
- Red (#ff0000) and blue (#0066ff) as accent colors only
- Replaced complex ASCII star with simple ✰ character
- Simplified loading screen animation
- Improved visual design based on logo reference

### Shopify Setup:
When ready: `SiteConfig.setShopifyCredentials(domain, token)`

### Status: Complete & Production Ready