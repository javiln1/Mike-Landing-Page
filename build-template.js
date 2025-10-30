#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Funnel Template Builder
 * Processes HTML templates and replaces variables with client configuration
 */

class FunnelTemplateBuilder {
    constructor(configPath) {
        this.config = this.loadConfig(configPath);
        this.templateDir = path.join(__dirname, 'templates');
        this.outputDir = path.join(__dirname, 'output');
    }

    loadConfig(configPath) {
        try {
            const configData = fs.readFileSync(configPath, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('Error loading config:', error.message);
            process.exit(1);
        }
    }

    createOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    replaceVariables(content) {
        let processedContent = content;

        // Replace client information
        processedContent = processedContent.replace(/\{\{client\.name\}\}/g, this.config.client.name);
        processedContent = processedContent.replace(/\{\{client\.businessName\}\}/g, this.config.client.businessName);
        processedContent = processedContent.replace(/\{\{client\.website\}\}/g, this.config.client.website);
        processedContent = processedContent.replace(/\{\{client\.email\}\}/g, this.config.client.email);
        processedContent = processedContent.replace(/\{\{client\.phone\}\}/g, this.config.client.phone);

        // Replace branding colors
        processedContent = processedContent.replace(/\{\{branding\.primaryColor\}\}/g, this.config.branding.primaryColor);
        processedContent = processedContent.replace(/\{\{branding\.secondaryColor\}\}/g, this.config.branding.secondaryColor);
        processedContent = processedContent.replace(/\{\{branding\.accentColor\}\}/g, this.config.branding.accentColor);
        processedContent = processedContent.replace(/\{\{branding\.textColor\}\}/g, this.config.branding.textColor);
        processedContent = processedContent.replace(/\{\{branding\.backgroundColor\}\}/g, this.config.branding.backgroundColor);
        processedContent = processedContent.replace(/\{\{branding\.buttonColor\}\}/g, this.config.branding.buttonColor);
        processedContent = processedContent.replace(/\{\{branding\.buttonTextColor\}\}/g, this.config.branding.buttonTextColor);

        // Replace content
        processedContent = processedContent.replace(/\{\{content\.heroTitle\}\}/g, this.config.content.heroTitle);
        processedContent = processedContent.replace(/\{\{content\.heroSubtitle\}\}/g, this.config.content.heroSubtitle);
        processedContent = processedContent.replace(/\{\{content\.heroDescription\}\}/g, this.config.content.heroDescription);
        processedContent = processedContent.replace(/\{\{content\.missionTitle\}\}/g, this.config.content.missionTitle);
        processedContent = processedContent.replace(/\{\{content\.missionText\}\}/g, this.config.content.missionText);
        processedContent = processedContent.replace(/\{\{content\.aboutTitle\}\}/g, this.config.content.aboutTitle);
        processedContent = processedContent.replace(/\{\{content\.aboutText\}\}/g, this.config.content.aboutText);
        processedContent = processedContent.replace(/\{\{content\.ctaTitle\}\}/g, this.config.content.ctaTitle);
        processedContent = processedContent.replace(/\{\{content\.ctaSubtitle\}\}/g, this.config.content.ctaSubtitle);
        processedContent = processedContent.replace(/\{\{content\.ctaButtonText\}\}/g, this.config.content.ctaButtonText);
        processedContent = processedContent.replace(/\{\{content\.ctaButtonUrl\}\}/g, this.config.content.ctaButtonUrl);

        // Replace media
        processedContent = processedContent.replace(/\{\{media\.heroVideo\.embedId\}\}/g, this.config.media.heroVideo.embedId);
        processedContent = processedContent.replace(/\{\{media\.logo\}\}/g, this.config.media.logo);
        processedContent = processedContent.replace(/\{\{media\.favicon\}\}/g, this.config.media.favicon);

        // Replace SEO
        processedContent = processedContent.replace(/\{\{seo\.title\}\}/g, this.config.seo.title);
        processedContent = processedContent.replace(/\{\{seo\.description\}\}/g, this.config.seo.description);
        processedContent = processedContent.replace(/\{\{seo\.keywords\}\}/g, this.config.seo.keywords);
        processedContent = processedContent.replace(/\{\{seo\.ogImage\}\}/g, this.config.seo.ogImage);

        // Replace pillars
        if (this.config.content.pillars) {
            const pillarsHtml = this.config.content.pillars.map(pillar => 
                `<div class="pillar">
                    <h3>${pillar.title}</h3>
                    <p>${pillar.description}</p>
                </div>`
            ).join('\n');
            processedContent = processedContent.replace(/\{\{content\.pillars\}\}/g, pillarsHtml);
        }

        // Replace testimonials
        if (this.config.media.testimonials) {
            const testimonialsHtml = this.config.media.testimonials.map(testimonial => 
                `<div class="testimonial-picture-card">
                    <img src="${testimonial.image}" alt="${testimonial.name}" class="result-img" loading="lazy">
                    <div class="testimonial-info">
                        <h4>${testimonial.name}</h4>
                        <p class="result">${testimonial.result}</p>
                        <p class="description">${testimonial.description}</p>
                    </div>
                </div>`
            ).join('\n');
            processedContent = processedContent.replace(/\{\{media\.testimonials\}\}/g, testimonialsHtml);
        }

        // Replace form
        if (this.config.forms.applicationForm) {
            const form = this.config.forms.applicationForm;
            const formFields = form.fields.map(field => {
                if (field.type === 'select') {
                    const options = field.options.map(option => 
                        `<option value="${option.value}">${option.text}</option>`
                    ).join('\n');
                    return `
                        <div class="form-group">
                            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                            <select name="${field.name}" id="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">Select ${field.label}</option>
                                ${options}
                            </select>
                        </div>`;
                } else if (field.type === 'textarea') {
                    return `
                        <div class="form-group">
                            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                            <textarea name="${field.name}" id="${field.name}" placeholder="${field.placeholder}" rows="${field.rows || 3}" ${field.required ? 'required' : ''}></textarea>
                        </div>`;
                } else {
                    return `
                        <div class="form-group">
                            <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                            <input type="${field.type}" name="${field.name}" id="${field.name}" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>
                        </div>`;
                }
            }).join('\n');

            const formHtml = `
                <form action="${form.action}" method="${form.method}" class="application-form" id="application-form">
                    ${formFields}
                    <button type="submit" class="cta-button">${this.config.content.ctaButtonText}</button>
                </form>`;
            
            processedContent = processedContent.replace(/\{\{forms\.applicationForm\}\}/g, formHtml);
        }

        return processedContent;
    }

    processTemplate(templateFile, outputFile) {
        try {
            const templatePath = path.join(this.templateDir, templateFile);
            const content = fs.readFileSync(templatePath, 'utf8');
            const processedContent = this.replaceVariables(content);
            
            const outputPath = path.join(this.outputDir, outputFile);
            fs.writeFileSync(outputPath, processedContent);
            
            console.log(`✅ Processed ${templateFile} → ${outputFile}`);
        } catch (error) {
            console.error(`❌ Error processing ${templateFile}:`, error.message);
        }
    }

    build() {
        console.log('🚀 Building funnel template...');
        console.log(`📁 Client: ${this.config.client.name}`);
        console.log(`🎨 Primary Color: ${this.config.branding.primaryColor}`);
        
        this.createOutputDir();
        
        // Process all template files
        const templates = [
            { template: 'index.html', output: 'index.html' },
            { template: 'education-page.html', output: 'education-page.html' },
            { template: 'confirmation-page.html', output: 'confirmation-page.html' }
        ];

        templates.forEach(({ template, output }) => {
            this.processTemplate(template, output);
        });

        // Copy assets
        this.copyAssets();
        
        console.log('✨ Template build complete!');
        console.log(`📂 Output directory: ${this.outputDir}`);
    }

    copyAssets() {
        const assetsDir = path.join(__dirname, 'assets');
        const outputAssetsDir = path.join(this.outputDir, 'assets');
        
        if (fs.existsSync(assetsDir)) {
            if (!fs.existsSync(outputAssetsDir)) {
                fs.mkdirSync(outputAssetsDir, { recursive: true });
            }
            
            // Copy all files from assets to output/assets
            const files = fs.readdirSync(assetsDir);
            files.forEach(file => {
                const srcPath = path.join(assetsDir, file);
                const destPath = path.join(outputAssetsDir, file);
                
                if (fs.statSync(srcPath).isFile()) {
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`📄 Copied asset: ${file}`);
                }
            });
        }
    }
}

// Main execution
if (require.main === module) {
    const configPath = process.argv[2] || path.join(__dirname, 'config', 'client-config.json');
    const builder = new FunnelTemplateBuilder(configPath);
    builder.build();
}

module.exports = FunnelTemplateBuilder;
