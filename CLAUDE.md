# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **template-based funnel system** for Mike's Remote Sales Academy. The repository uses a **Python template engine** that generates static HTML files from templates + JSON configuration. The output is deployed to Vercel as static files.

**Current client:** Mike's Remote Sales Academy
**Primary funnel:** VSL (Video Sales Letter) → Education Page → Call Booking

## Key Architecture Concepts

### Template System
- **Templates** (`templates/`) contain HTML with `{{variable.name}}` placeholders
- **Configs** (`config/`) contain JSON with client branding, content, and media
- **Build scripts** replace template variables with config values
- **Output** (`output/`) contains generated static HTML ready for deployment

### Current Funnel Structure (Post "Brokie Bait" Implementation)
1. **index.html** - VSL landing page with Vidalytics video and iClosed booking widget
2. **education-page.html** - For **qualified** leads (high intent, proper budget)
3. **education-page-unqualified.html** - For **unqualified** leads (tire kickers, low budget)

The "brokie bait" strategy segments leads by routing them to different education pages based on qualification criteria determined upstream (e.g., via Make automation or quiz).

### Meta Pixel Tracking Implementation
All pages have Meta Pixel ID **804390962586900** installed in the `<head>` section for tracking:
- **PageView** - Automatic tracking on page load (already installed on all pages)
- **Lead** - Tracked via Make automation when iClosed form is submitted
- **Schedule** - Tracked via Make automation when booking is confirmed
- **Purchase** - To be tracked via Make automation for purchases

The pixel code is directly embedded in templates, NOT in config files. When editing pixel tracking, modify the `<script>` tag in the template HTML files.

### Third-Party Integrations
- **Vidalytics** - Video player with engagement tracking (embedId configured in JSON)
- **iClosed** - Call booking widget embedded in index.html
- **Meta Pixel** - Conversion tracking for Facebook/Meta ads
- **Make.com** - Automations for Lead and Schedule event tracking

## Common Commands

### Development
```bash
# Start local dev server (serves output/)
npm run serve
# or
python3 -m http.server 8000 -d output

# Build from default config
npm run build
# or
python3 build-template.py

# Build with custom config
python3 build-template.py config/mike-config.json

# Build and serve in one command
npm run dev
```

### Deployment
- **Automatic**: Push to `main` branch → GitHub → Vercel auto-deploys
- **Manual**: Use `./deploy.sh config/your-config.json`
- Vercel serves from `output/` directory (configured in `vercel.json`)

### Git Workflow
```bash
# Standard workflow
git add -A
git commit -m "Description"
git push origin main

# Vercel deploys automatically on push
```

## Important File Locations

### Templates (Source Files)
- `templates/index.html` - VSL landing page template
- `templates/education-page.html` - Qualified leads education page
- `templates/education-page-unqualified.html` - Unqualified leads page

### Configuration
- `config/mike-config.json` - Mike's current config (branding, content, videos)
- `config/client-config.json` - Default template config
- `config/sample-client.json` - Example for new clients

### Build Scripts
- `build-simple.py` - Lightweight builder (currently used)
- `build-template.py` - Full-featured builder with more options

### Output (Generated Files)
- `output/` - Production-ready static files served by Vercel
- `output/assets/` - Images, media files

## Template Variable System

Templates use `{{variable.path}}` syntax that gets replaced during build:

### Common Variables
```
{{client.name}}
{{client.businessName}}
{{client.email}}
{{client.website}}

{{branding.primaryColor}}
{{branding.secondaryColor}}
{{branding.accentColor}}

{{content.heroTitle}}
{{content.heroSubtitle}}
{{content.ctaButtonText}}

{{media.heroVideo.embedId}}
{{media.favicon}}
```

### Special Variables
- `{{forms.applicationForm}}` - Generates form HTML from config
- `{{media.testimonials}}` - Generates testimonial grid from array
- `{{content.pillars}}` - Generates pillar cards from array

## Meta Pixel Conversion Events Strategy

### Current Setup
- **index.html** tracks PageView automatically
- **education-page.html** tracks PageView automatically
- **education-page-unqualified.html** tracks PageView automatically

### Conversion Events (via Make)
The Lead and Schedule events are NOT tracked in the HTML. They are fired server-side via Make.com automations:
1. User submits iClosed form → Make webhook → Fire `fbq('track', 'Lead')`
2. User books call → Make webhook → Fire `fbq('track', 'Schedule')`

When adding custom event tracking to HTML, use this format:
```javascript
fbq('track', 'EventName', {
  content_name: 'Description',
  content_category: 'category'
});
```

## Brokie Bait Implementation Notes

The funnel uses lead segmentation via separate education pages:
- Qualified leads see `education-page.html` with strong CTAs and booking prompts
- Unqualified leads see `education-page-unqualified.html` with educational content

**Routing logic** (where leads get directed) is handled OUTSIDE this repository:
- Make.com automations
- Quiz/form conditional logic
- URL parameters
- Email links

Both pages have identical structure but can have different:
- Content tone (aggressive vs nurturing)
- CTAs (book call vs download resource)
- Follow-up sequences

## Working with Vidalytics Videos

Vidalytics video embeds use this pattern:
```html
<div id="vidalytics_embed_{{media.heroVideo.embedId}}"></div>
<script src="https://vidalytics.com/embed/{{media.heroVideo.embedId}}"></script>
```

To change the video:
1. Update `embedId` in `config/mike-config.json`
2. Rebuild: `npm run build`

## Working with iClosed Widget

The iClosed booking widget is embedded directly in index.html. Changes to the widget:
1. Edit `templates/index.html` directly (not in config)
2. Widget styling is in `<style>` section with `.iclosed-widget` classes
3. Rebuild after changes

## Debugging Tips

### Template Variables Not Replacing
- Check JSON syntax in config file
- Ensure variable path matches exactly: `{{client.name}}` not `{{client.Name}}`
- Rebuild after config changes

### Meta Pixel Not Firing
- Check browser console for `fbq is not defined` errors
- Verify pixel ID: 804390962586900
- Use Meta Pixel Helper browser extension
- Check that script is in `<head>`, not `<body>`

### Local Preview Issues
- Ensure serving from `output/` directory, not root
- Rebuild templates before previewing: `npm run build`
- Check console for CORS or loading errors

### Vercel Deployment Issues
- Verify `output/` directory exists and has files
- Check `vercel.json` configuration
- Ensure git push succeeded before expecting deployment
- Vercel builds from `output/`, not from templates

## Design System

### Color Scheme (Mike's Branding)
- **Primary**: Black (#000000)
- **Secondary**: Dark gray (#1a1a1a)
- **Accent**: Red (#ff0000)
- **Text**: White (#ffffff)

### Typography
- **Headings**: 'Bebas Neue' (uppercase, bold)
- **Subheadings**: 'Merriweather' (serif, elegant)
- **Body**: 'Inter' (sans-serif, clean)

### Responsive Breakpoints
- Mobile: < 768px (simplified layout, stacked components)
- Tablet: 768px - 1024px
- Desktop: > 1024px

Mobile behavior:
- Mission, About, and Pillars sections are hidden on mobile
- CTA buttons move to bottom sticky position
- Video player maintains 16:9 aspect ratio

## Notes on Deleted Files

**confirmation-page.html was removed** to reduce funnel friction. Previously, users would land on a confirmation page after booking. Now they go directly to their calendar or the education page. This decision was made to streamline the user flow.

If you need to recreate a confirmation page:
1. Check git history: `git log --all --full-history -- "*confirmation-page*"`
2. Restore from commit: `git checkout <commit-hash> -- templates/confirmation-page.html`
3. Add Meta Pixel to the restored file
4. Rebuild and test
