#!/usr/bin/env python3
"""
Funnel Template Builder
Processes HTML templates and replaces variables with client configuration
"""

import json
import os
import shutil
import sys
from pathlib import Path

class FunnelTemplateBuilder:
    def __init__(self, config_path):
        self.config = self.load_config(config_path)
        self.template_dir = Path(__file__).parent / 'templates'
        self.output_dir = Path(__file__).parent / 'output'
        self.assets_dir = Path(__file__).parent / 'assets'
        self.output_assets_dir = self.output_dir / 'assets'

    def load_config(self, config_path):
        """Load client configuration from JSON file"""
        try:
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
            sys.exit(1)

    def create_output_dir(self):
        """Create output directory if it doesn't exist"""
        self.output_dir.mkdir(exist_ok=True)
        self.output_assets_dir.mkdir(exist_ok=True)

    def replace_variables(self, content):
        """Replace template variables with config values"""
        processed_content = content

        # Replace client information
        processed_content = processed_content.replace('{{client.name}}', self.config['client']['name'])
        processed_content = processed_content.replace('{{client.businessName}}', self.config['client']['businessName'])
        processed_content = processed_content.replace('{{client.website}}', self.config['client']['website'])
        processed_content = processed_content.replace('{{client.email}}', self.config['client']['email'])
        processed_content = processed_content.replace('{{client.phone}}', self.config['client']['phone'])

        # Replace branding colors
        branding = self.config['branding']
        processed_content = processed_content.replace('{{branding.primaryColor}}', branding['primaryColor'])
        processed_content = processed_content.replace('{{branding.secondaryColor}}', branding['secondaryColor'])
        processed_content = processed_content.replace('{{branding.accentColor}}', branding['accentColor'])
        processed_content = processed_content.replace('{{branding.textColor}}', branding['textColor'])
        processed_content = processed_content.replace('{{branding.backgroundColor}}', branding['backgroundColor'])
        processed_content = processed_content.replace('{{branding.buttonColor}}', branding['buttonColor'])
        processed_content = processed_content.replace('{{branding.buttonTextColor}}', branding['buttonTextColor'])

        # Replace content
        content_config = self.config['content']
        processed_content = processed_content.replace('{{content.heroTitle}}', content_config['heroTitle'])
        processed_content = processed_content.replace('{{content.heroSubtitle}}', content_config['heroSubtitle'])
        processed_content = processed_content.replace('{{content.heroDescription}}', content_config['heroDescription'])
        processed_content = processed_content.replace('{{content.missionTitle}}', content_config['missionTitle'])
        processed_content = processed_content.replace('{{content.missionText}}', content_config['missionText'])
        processed_content = processed_content.replace('{{content.aboutTitle}}', content_config['aboutTitle'])
        processed_content = processed_content.replace('{{content.aboutText}}', content_config['aboutText'])
        processed_content = processed_content.replace('{{content.ctaTitle}}', content_config['ctaTitle'])
        processed_content = processed_content.replace('{{content.ctaSubtitle}}', content_config['ctaSubtitle'])
        processed_content = processed_content.replace('{{content.ctaButtonText}}', content_config['ctaButtonText'])
        processed_content = processed_content.replace('{{content.ctaButtonUrl}}', content_config['ctaButtonUrl'])

        # Replace media
        media = self.config['media']
        processed_content = processed_content.replace('{{media.heroVideo.embedId}}', media['heroVideo']['embedId'])
        processed_content = processed_content.replace('{{media.logo}}', media['logo'])
        processed_content = processed_content.replace('{{media.favicon}}', media['favicon'])

        # Replace SEO
        seo = self.config['seo']
        processed_content = processed_content.replace('{{seo.title}}', seo['title'])
        processed_content = processed_content.replace('{{seo.description}}', seo['description'])
        processed_content = processed_content.replace('{{seo.keywords}}', seo['keywords'])
        processed_content = processed_content.replace('{{seo.ogImage}}', seo['ogImage'])

        # Replace pillars
        if 'pillars' in content_config:
            pillars_html = ''
            for pillar in content_config['pillars']:
                pillars_html += f'''
                <div class="pillar">
                    <h3>{pillar['title']}</h3>
                    <p>{pillar['description']}</p>
                </div>'''
            processed_content = processed_content.replace('{{content.pillars}}', pillars_html)

        # Replace testimonials
        if 'testimonials' in media:
            testimonials_html = ''
            for testimonial in media['testimonials']:
                testimonials_html += f'''
                <div class="testimonial-picture-card">
                    <img src="{testimonial['image']}" alt="{testimonial['name']}" class="result-img" loading="lazy">
                    <div class="testimonial-info">
                        <h4>{testimonial['name']}</h4>
                        <p class="result">{testimonial['result']}</p>
                        <p class="description">{testimonial['description']}</p>
                    </div>
                </div>'''
            processed_content = processed_content.replace('{{media.testimonials}}', testimonials_html)

        # Replace form
        if 'forms' in self.config and 'applicationForm' in self.config['forms']:
            form = self.config['forms']['applicationForm']
            form_fields = ''
            
            for field in form['fields']:
                if field['type'] == 'select':
                    options = ''
                    for option in field['options']:
                        options += f'<option value="{option["value"]}">{option["text"]}</option>'
                    form_fields += f'''
                    <div class="form-group">
                        <label for="{field['name']}">{field['label']}{" *" if field['required'] else ""}</label>
                        <select name="{field['name']}" id="{field['name']}" {"required" if field['required'] else ""}>
                            <option value="">Select {field['label']}</option>
                            {options}
                        </select>
                    </div>'''
                elif field['type'] == 'textarea':
                    form_fields += f'''
                    <div class="form-group">
                        <label for="{field['name']}">{field['label']}{" *" if field['required'] else ""}</label>
                        <textarea name="{field['name']}" id="{field['name']}" placeholder="{field['placeholder']}" rows="{field.get('rows', 3)}" {"required" if field['required'] else ""}></textarea>
                    </div>'''
                else:
                    form_fields += f'''
                    <div class="form-group">
                        <label for="{field['name']}">{field['label']}{" *" if field['required'] else ""}</label>
                        <input type="{field['type']}" name="{field['name']}" id="{field['name']}" placeholder="{field['placeholder']}" {"required" if field['required'] else ""}>
                    </div>'''

            form_html = f'''
            <form action="{form['action']}" method="{form['method']}" class="application-form" id="application-form">
                {form_fields}
                <button type="submit" class="cta-button">{content_config['ctaButtonText']}</button>
            </form>'''
            
            processed_content = processed_content.replace('{{forms.applicationForm}}', form_html)

        # Replace education page content
        if 'pages' in self.config and 'education' in self.config['pages']:
            education = self.config['pages']['education']
            processed_content = processed_content.replace('{{pages.education.title}}', education['title'])
            
            # Replace education sections
            sections_html = ''
            for section in education['sections']:
                sections_html += f'''
                <section class="education-section">
                    <h2 class="section-title">{section['title']}</h2>
                    <p class="section-text">{section['content']}</p>
                </section>'''
            processed_content = processed_content.replace('{{#each pages.education.sections}}', sections_html)

        # Replace confirmation page content
        if 'pages' in self.config and 'confirmation' in self.config['pages']:
            confirmation = self.config['pages']['confirmation']
            processed_content = processed_content.replace('{{pages.confirmation.title}}', confirmation['title'])
            processed_content = processed_content.replace('{{pages.confirmation.subtitle}}', confirmation['subtitle'])
            processed_content = processed_content.replace('{{pages.confirmation.message}}', confirmation['message'])
            
            # Replace next steps
            next_steps_html = ''
            for step in confirmation['nextSteps']:
                next_steps_html += f'<li>{step}</li>'
            processed_content = processed_content.replace('{{#each pages.confirmation.nextSteps}}', next_steps_html)

        return processed_content

    def process_template(self, template_file, output_file):
        """Process a single template file"""
        try:
            template_path = self.template_dir / template_file
            with open(template_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            processed_content = self.replace_variables(content)
            
            output_path = self.output_dir / output_file
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(processed_content)
            
            print(f"✅ Processed {template_file} → {output_file}")
        except Exception as e:
            print(f"❌ Error processing {template_file}: {e}")

    def copy_assets(self):
        """Copy assets to output directory"""
        if self.assets_dir.exists():
            for item in self.assets_dir.iterdir():
                if item.is_file():
                    shutil.copy2(item, self.output_assets_dir)
                    print(f"📄 Copied asset: {item.name}")
        else:
            print("⚠️  No assets directory found - creating placeholder assets")
            # Create placeholder assets
            placeholder_files = [
                'logo.png',
                'favicon.ico',
                'hero-video-fallback.jpg',
                'testimonial-1.jpg',
                'testimonial-2.jpg',
                'testimonial-3.jpg',
                'testimonial-4.jpg',
                'og-image.jpg'
            ]
            
            for filename in placeholder_files:
                placeholder_path = self.output_assets_dir / filename
                with open(placeholder_path, 'w') as f:
                    f.write(f"# Placeholder for {filename}\n# Replace with actual asset")
                print(f"📄 Created placeholder: {filename}")

    def build(self):
        """Build the complete funnel template"""
        print("🚀 Building funnel template...")
        print(f"📁 Client: {self.config['client']['name']}")
        print(f"🎨 Primary Color: {self.config['branding']['primaryColor']}")
        
        self.create_output_dir()
        
        # Process all template files
        templates = [
            {'template': 'index.html', 'output': 'index.html'},
            {'template': 'education-page.html', 'output': 'education-page.html'},
            {'template': 'confirmation-page.html', 'output': 'confirmation-page.html'}
        ]

        for template_info in templates:
            self.process_template(template_info['template'], template_info['output'])

        # Copy assets
        self.copy_assets()
        
        print("✨ Template build complete!")
        print(f"📂 Output directory: {self.output_dir}")
        print(f"🌐 To preview: python -m http.server 8000 -d {self.output_dir}")

def main():
    """Main execution function"""
    if len(sys.argv) > 1:
        config_path = sys.argv[1]
    else:
        config_path = 'config/client-config.json'
    
    if not os.path.exists(config_path):
        print(f"❌ Config file not found: {config_path}")
        print("Available config files:")
        config_dir = Path('config')
        if config_dir.exists():
            for config_file in config_dir.glob('*.json'):
                print(f"  - {config_file}")
        sys.exit(1)
    
    builder = FunnelTemplateBuilder(config_path)
    builder.build()

if __name__ == '__main__':
    main()
