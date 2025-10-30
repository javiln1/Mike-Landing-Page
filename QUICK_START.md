# 🚀 Quick Start Guide

## Get Your Funnel Template Running in 5 Minutes

### 1. Choose Your Config
```bash
# Use the sample client (already configured)
python3 build-template.py config/sample-client.json

# Or use the default config
python3 build-template.py
```

### 2. Preview Your Site
```bash
# Start local server
python3 -m http.server 8000 -d output

# Open in browser
open http://localhost:8000
```

### 3. Customize for Your Client
Edit `config/client-config.json` with your client's:
- Business name and contact info
- Brand colors
- Content and messaging
- Video embed IDs
- Form settings

### 4. Deploy
```bash
# Use the deployment script
./deploy.sh config/your-client-config.json
```

## 🎨 Quick Customization

### Change Colors
Edit the `branding` section in your config:
```json
"branding": {
  "primaryColor": "#your-color",
  "secondaryColor": "#your-color", 
  "accentColor": "#your-color"
}
```

### Update Content
Edit the `content` section:
```json
"content": {
  "heroTitle": "Your Headline",
  "heroSubtitle": "Your Subheadline",
  "ctaButtonText": "Your CTA"
}
```

### Add Testimonials
Add to the `media.testimonials` array:
```json
"testimonials": [
  {
    "image": "assets/testimonial-1.jpg",
    "name": "Client Name",
    "result": "Amazing Result",
    "description": "Testimonial text"
  }
]
```

## 📁 File Structure
```
funnel-template/
├── config/
│   ├── client-config.json      # Default config
│   └── sample-client.json      # Sample client
├── templates/
│   ├── index.html              # Main funnel page
│   ├── education-page.html     # Education page
│   └── confirmation-page.html  # Confirmation page
├── assets/                     # Client assets go here
├── output/                     # Generated site (auto-created)
├── build-template.py           # Template engine
├── deploy.sh                   # Deployment script
└── README.md                   # Full documentation
```

## 🔧 Available Commands
```bash
# Build with default config
python3 build-template.py

# Build with custom config
python3 build-template.py config/your-config.json

# Preview locally
python3 -m http.server 8000 -d output

# Deploy (interactive)
./deploy.sh config/your-config.json
```

## 🎯 Next Steps
1. **Add your client's assets** to the `assets/` folder
2. **Update the config** with client-specific information
3. **Test the form** by updating the form action URL
4. **Deploy** to your preferred hosting platform
5. **Customize further** by editing the HTML templates

## 🆘 Need Help?
- Check the full `README.md` for detailed documentation
- Look at `config/sample-client.json` for examples
- The template system is designed to be simple and intuitive!

---

**Happy Funnel Building! 🚀**
