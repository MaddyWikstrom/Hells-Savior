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

### Recent Fixes (Commit 8778b4f):
- **FIXED LOADING SCREEN**: Updated to gothic/emo theme with crosses (†), barbed wire, purple accents
- **FIXED BLANK PAGE**: Resolved main content not appearing after loading screen
- Added purple (#8a2be2) as third accent color for gothic aesthetic
- Cross symbol with rotation animations and multi-color glow effects
- Barbed wire elements (╫═══╫) with purple glow animations
- Added "EMBRACE THE DARKNESS" tagline to match brand vibe
- Enhanced progress bar with purple gradient
- Updated JavaScript to work with cross element instead of star

### Previous Fixes (Commit 56104f2):
- Changed to mostly black (#000000) background
- Red (#ff0000) and blue (#0066ff) as accent colors only
- Replaced complex ASCII star with simple ✰ character
- Simplified loading screen animation
- Improved visual design based on logo reference

### Shopify Setup:
When ready: `SiteConfig.setShopifyCredentials(domain, token)`

### Status: Complete & Production Ready