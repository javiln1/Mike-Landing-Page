#!/usr/bin/env python3
"""
Simple Template Builder for Mike's Remote Sales Academy
Builds a clean funnel with Hero + Video + Calendly, 3 Pillars, and Testimonials
"""

import json
import os
import sys
import shutil
from pathlib import Path

def load_config(config_path):
    """Load JSON configuration file"""
    with open(config_path, 'r') as f:
        return json.load(f)

def replace_variables(template, config):
    """Replace {{variable.path}} with actual values"""
    content = template

    # Flatten config for easy replacement
    replacements = {
        # Client
        'client.name': config['client']['name'],
        'client.businessName': config['client']['businessName'],
        'client.website': config['client']['website'],
        'client.email': config['client']['email'],
        'client.phone': config['client']['phone'],

        # Branding
        'branding.primaryColor': config['branding']['primaryColor'],
        'branding.secondaryColor': config['branding']['secondaryColor'],
        'branding.accentColor': config['branding']['accentColor'],
        'branding.textColor': config['branding']['textColor'],
        'branding.backgroundColor': config['branding']['backgroundColor'],
        'branding.buttonColor': config['branding']['buttonColor'],
        'branding.buttonTextColor': config['branding']['buttonTextColor'],

        # Content
        'content.heroTitle': config['content']['heroTitle'],
        'content.heroSubtitle': config['content']['heroSubtitle'],
        'content.heroDescription': config['content'].get('heroDescription', ''),
        'content.calendlyUrl': config['content'].get('calendlyUrl', ''),

        # Media
        'media.heroVideo.embedId': config['media']['heroVideo']['embedId'],
        'media.heroVideo.type': config['media']['heroVideo']['type'],
        'media.favicon': config['media'].get('favicon', 'assets/favicon.ico'),
        'media.logo': config['media'].get('logo', 'assets/logo.png'),

        # SEO
        'seo.title': config['seo']['title'],
        'seo.description': config['seo']['description'],
        'seo.keywords': config['seo']['keywords'],
        'seo.ogImage': config['seo'].get('ogImage', 'assets/og-image.jpg'),
    }

    # Replace all variables
    for key, value in replacements.items():
        content = content.replace(f'{{{{{key}}}}}', str(value))

    return content

def generate_pillars_html(pillars):
    """Generate HTML for 3 pillars section"""
    html = ''
    for pillar in pillars:
        html += f'''
                <div class="pillar-card">
                    <h3>{pillar['title']}</h3>
                    <p>{pillar['description']}</p>
                </div>'''
    return html

def generate_testimonials_html(testimonials):
    """Generate HTML for testimonials section"""
    html = ''
    for testimonial in testimonials:
        html += f'''
                <div class="testimonial-card">
                    <img src="{testimonial['image']}" alt="{testimonial['name']}" loading="lazy">
                    <h4>{testimonial['name']}</h4>
                    <div class="result">{testimonial['result']}</div>
                    <p>{testimonial['description']}</p>
                </div>'''
    return html

def build_template(config_path, output_dir='output'):
    """Main build function"""
    print(f"Loading config from {config_path}...")
    config = load_config(config_path)

    print("Reading template...")
    template_path = 'templates/index-simple.html'
    with open(template_path, 'r') as f:
        template = f.read()

    print("Replacing variables...")
    html = replace_variables(template, config)

    print("Generating pillars section...")
    pillars_html = generate_pillars_html(config['content']['pillars'])
    html = html.replace('{{PILLARS_PLACEHOLDER}}', pillars_html)

    print("Generating testimonials section...")
    testimonials_html = generate_testimonials_html(config['media']['testimonials'])
    html = html.replace('{{TESTIMONIALS_PLACEHOLDER}}', testimonials_html)

    print(f"Creating output directory: {output_dir}")
    os.makedirs(output_dir, exist_ok=True)

    print("Writing output file...")
    output_path = os.path.join(output_dir, 'index.html')
    with open(output_path, 'w') as f:
        f.write(html)

    print("Copying assets...")
    assets_src = 'assets'
    assets_dst = os.path.join(output_dir, 'assets')
    if os.path.exists(assets_src):
        if os.path.exists(assets_dst):
            shutil.rmtree(assets_dst)
        shutil.copytree(assets_src, assets_dst)
        print(f"✓ Assets copied to {assets_dst}")
    else:
        print("! No assets directory found (assets will need to be added)")

    print(f"\n✓ Build complete! Output: {output_path}")
    print(f"\nTo view locally, run:")
    print(f"  python3 -m http.server 8000 -d {output_dir}")
    print(f"  Then visit: http://localhost:8000")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 build-simple.py <config-file.json>")
        print("Example: python3 build-simple.py config/mike-config.json")
        sys.exit(1)

    config_file = sys.argv[1]
    if not os.path.exists(config_file):
        print(f"Error: Config file not found: {config_file}")
        sys.exit(1)

    build_template(config_file)
