/**
 * Component Renderer Examples
 * Demonstrates how to use the Renderer System
 */

import { ComponentRenderer } from '../component-renderer';
import { TemplateEngine } from '../template-engine';
import { ComponentRegistryManager } from '../../component-library/registry';
import { ThemePackGenerator } from '../../theme-pack';
import type { RenderInput, RenderBatchInput } from '../types';
import type { Component } from '../../component-library/types';

/**
 * Example 1: Render a single hero component
 */
export function exampleRenderHeroComponent() {
  console.log('\n=== Example 1: Render Hero Component ===\n');
  
  // Get hero component from registry
  const registry = ComponentRegistryManager.getInstance();
  const heroComponent = registry.getComponent('hero');
  
  if (!heroComponent) {
    console.log('Hero component not found');
    return;
  }
  
  // Generate theme pack
  const themePack = ThemePackGenerator.generate({
    businessCategory: 'restaurant',
    keywords: ['modern', 'orange'],
    userInput: 'ร้านอาหาร โทนส้ม',
    style: 'modern',
    tone: 'friendly'
  });
  
  // Render input
  const renderInput: RenderInput = {
    component: heroComponent,
    variant: heroComponent.variants?.[0], // Use first variant
    props: {
      heading: 'ยินดีต้อนรับสู่ร้านอาหารของเรา',
      subheading: 'อาหารไทยรสชาติดั้งเดิม บรรยากาศอบอุ่น',
      ctaLabel: 'ดูเมนู',
      ctaLink: '#menu',
      image: 'https://example.com/hero.jpg',
      imageAlt: 'ร้านอาหาร'
    },
    themePack
  };
  
  // Render
  const output = ComponentRenderer.render(renderInput);
  
  console.log('File Name:', output.fileName);
  console.log('Language:', output.language);
  console.log('Lines of Code:', output.metadata.linesOfCode);
  console.log('Size:', output.metadata.estimatedSize, 'bytes');
  console.log('\nImports:');
  output.imports.forEach(imp => console.log('  -', imp));
  console.log('\nRendered Code (first 500 chars):');
  console.log(output.code.substring(0, 500) + '...');
}

/**
 * Example 2: Render navbar component
 */
export function exampleRenderNavbarComponent() {
  console.log('\n=== Example 2: Render Navbar Component ===\n');
  
  const registry = ComponentRegistryManager.getInstance();
  const navbarComponent = registry.getComponent('navbar');
  
  if (!navbarComponent) {
    console.log('Navbar component not found');
    return;
  }
  
  const themePack = ThemePackGenerator.generate({
    businessCategory: 'restaurant',
    keywords: ['blue', 'modern'],
    userInput: 'ร้านอาหาร โทนน้ำเงิน',
    style: 'modern',
    tone: 'friendly'
  });
  
  const renderInput: RenderInput = {
    component: navbarComponent,
    props: {
      brandName: 'ร้านอาหารเรา',
      logo: '/logo.png',
      logoAlt: 'โลโก้',
      menuItems: [
        { label: 'หน้าแรก', href: '#home' },
        { label: 'เกี่ยวกับ', href: '#about' },
        { label: 'เมนู', href: '#menu' },
        { label: 'ติดต่อ', href: '#contact' }
      ],
      ctaLabel: 'สั่งอาหาร',
      ctaLink: '#order'
    },
    themePack
  };
  
  const output = ComponentRenderer.render(renderInput);
  
  console.log('✅ Rendered:', output.fileName);
  console.log('Metadata:', output.metadata);
}

/**
 * Example 3: Batch render multiple components
 */
export function exampleBatchRender() {
  console.log('\n=== Example 3: Batch Render Components ===\n');
  
  const registry = ComponentRegistryManager.getInstance();
  const themePack = ThemePackGenerator.generate({
    businessCategory: 'restaurant',
    keywords: ['green', 'natural'],
    userInput: 'ร้านอาหาร โทนเขียว ธรรมชาติ',
    style: 'modern',
    tone: 'friendly'
  });
  
  // Prepare multiple components
  const components: RenderInput[] = [
    {
      component: registry.getComponent('navbar')!,
      props: {
        brandName: 'Green Restaurant',
        menuItems: [
          { label: 'Home', href: '#home' },
          { label: 'Menu', href: '#menu' }
        ]
      },
      themePack
    },
    {
      component: registry.getComponent('hero')!,
      props: {
        heading: 'Organic & Fresh',
        subheading: 'Farm to table dining experience',
        ctaLabel: 'Explore Menu',
        ctaLink: '#menu'
      },
      themePack
    },
    {
      component: registry.getComponent('footer')!,
      props: {
        brandName: 'Green Restaurant',
        description: 'Serving organic food since 2020',
        socialLinks: [
          { platform: 'facebook', url: 'https://facebook.com/greenrestaurant' },
          { platform: 'instagram', url: 'https://instagram.com/greenrestaurant' }
        ]
      },
      themePack
    }
  ];
  
  // Batch render
  const batchInput: RenderBatchInput = {
    components,
    themePack,
    projectType: 'vite-react-typescript'
  };
  
  const batchOutput = ComponentRenderer.renderBatch(batchInput);
  
  console.log('Total Components:', batchOutput.totalComponents);
  console.log('Total Size:', batchOutput.totalSize, 'bytes');
  console.log('\nComponent Files:');
  batchOutput.files.forEach(file => {
    console.log(`  - ${file.fileName} (${file.metadata.linesOfCode} lines)`);
  });
  console.log('\nGlobal Files:');
  batchOutput.globalFiles.forEach(file => {
    console.log(`  - ${file.fileName} (${file.language})`);
  });
}

/**
 * Example 4: Template Engine - placeholder extraction
 */
export function exampleExtractPlaceholders() {
  console.log('\n=== Example 4: Extract Placeholders ===\n');
  
  const template = `
    <section className="hero">
      <h1>{heading}</h1>
      <p>{subheading}</p>
      <a href="{ctaLink}" style="background: {theme.primary}">
        {ctaLabel}
      </a>
      {#if showImage}
        <img src="{image}" alt="{imageAlt}" />
      {/if}
    </section>
  `;
  
  const placeholders = TemplateEngine.extractPlaceholders(template);
  
  console.log('Found placeholders:');
  placeholders.forEach(ph => console.log('  -', ph));
}

/**
 * Example 5: Template Engine - validation
 */
export function exampleValidateProps() {
  console.log('\n=== Example 5: Validate Props ===\n');
  
  const template = `
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <a href="{link}">{linkText}</a>
    </div>
  `;
  
  const props = {
    title: 'Welcome',
    description: 'This is a test',
    // Missing: link, linkText
  };
  
  const validation = TemplateEngine.validateProps(template, props);
  
  console.log('Is Valid:', validation.isValid);
  console.log('Missing Props:', validation.missing);
}

/**
 * Example 6: Template Engine - complex placeholders
 */
export function exampleComplexPlaceholders() {
  console.log('\n=== Example 6: Complex Placeholders (Arrays) ===\n');
  
  const template = `
    <ul>
      {#each menuItems}
        <li>
          <a href="{item.href}">{item.label}</a>
        </li>
      {/each}
    </ul>
  `;
  
  const props = {
    menuItems: [
      { label: 'Home', href: '#home' },
      { label: 'About', href: '#about' },
      { label: 'Contact', href: '#contact' }
    ]
  };
  
  const rendered = TemplateEngine.render(template, props);
  
  console.log('Rendered HTML:');
  console.log(rendered);
}

/**
 * Example 7: Render with different variants
 */
export function exampleRenderVariants() {
  console.log('\n=== Example 7: Render Different Variants ===\n');
  
  const registry = ComponentRegistryManager.getInstance();
  const heroComponent = registry.getComponent('hero');
  
  if (!heroComponent || !heroComponent.variants) {
    console.log('Hero component or variants not found');
    return;
  }
  
  const themePack = ThemePackGenerator.generate({
    businessCategory: 'portfolio',
    keywords: ['minimal', 'clean'],
    userInput: 'portfolio minimal',
    style: 'minimal',
    tone: 'professional'
  });
  
  const props = {
    heading: 'John Doe',
    subheading: 'Full Stack Developer',
    ctaLabel: 'View Work',
    ctaLink: '#portfolio',
    image: '/hero.jpg',
    imageAlt: 'Hero image'
  };
  
  console.log(`Found ${heroComponent.variants.length} variants:\n`);
  
  // Render each variant
  heroComponent.variants.forEach((variant, index) => {
    const renderInput: RenderInput = {
      component: heroComponent,
      variant,
      props,
      themePack
    };
    
    const output = ComponentRenderer.render(renderInput);
    
    console.log(`${index + 1}. ${variant.name} (${variant.id})`);
    console.log(`   File: ${output.fileName}`);
    console.log(`   Lines: ${output.metadata.linesOfCode}`);
    console.log('');
  });
}

/**
 * Run all renderer examples
 */
export function runAllRendererExamples() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   Component Renderer Examples             ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  exampleRenderHeroComponent();
  exampleRenderNavbarComponent();
  exampleBatchRender();
  exampleExtractPlaceholders();
  exampleValidateProps();
  exampleComplexPlaceholders();
  exampleRenderVariants();
  
  console.log('\n✅ All renderer examples completed!\n');
}

export default {
  exampleRenderHeroComponent,
  exampleRenderNavbarComponent,
  exampleBatchRender,
  exampleExtractPlaceholders,
  exampleValidateProps,
  exampleComplexPlaceholders,
  exampleRenderVariants,
  runAllRendererExamples
};

