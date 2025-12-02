/**
 * Template System Validation Tests
 * ตรวจสอบว่า Shared Blocks, Business Categories, และ Override System ทำงานถูกต้อง
 */

import { SHARED_BLOCKS } from '../template-system/shared-blocks';
import { BUSINESS_CATEGORIES } from '../template-system/business-categories';
import { createOverrideSystem } from '../template-system/override-system';

describe('Template System Validation', () => {
  
  describe('Shared Blocks', () => {
    it('should have hero-basic block with 5 variants', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.variants).toBeDefined();
      expect(heroBlock?.variants?.length).toBe(5);
      
      const variantIds = heroBlock?.variants?.map(v => v.id);
      expect(variantIds).toContain('hero-stats');
      expect(variantIds).toContain('hero-split');
      expect(variantIds).toContain('hero-fullscreen');
      expect(variantIds).toContain('hero-minimal');
      expect(variantIds).toContain('hero-cards');
    });

    it('hero-stats variant should have stat overrides', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      const statsVariant = heroBlock?.variants?.find(v => v.id === 'hero-stats');
      
      expect(statsVariant).toBeDefined();
      expect(statsVariant?.overrides).toBeDefined();
      expect(statsVariant?.overrides).toHaveProperty('stat1');
      expect(statsVariant?.overrides).toHaveProperty('stat2');
      expect(statsVariant?.overrides).toHaveProperty('stat3');
      expect(statsVariant?.overrides.stat1.required).toBe(true);
    });

    it('hero-cards variant should have stat overrides', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      const cardsVariant = heroBlock?.variants?.find(v => v.id === 'hero-cards');
      
      expect(cardsVariant).toBeDefined();
      expect(cardsVariant?.overrides).toBeDefined();
      expect(cardsVariant?.overrides).toHaveProperty('stat1');
      expect(cardsVariant?.overrides).toHaveProperty('stat2');
      expect(cardsVariant?.overrides).toHaveProperty('stat3');
    });

    it('hero-split variant should NOT have stat overrides', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      const splitVariant = heroBlock?.variants?.find(v => v.id === 'hero-split');
      
      expect(splitVariant).toBeDefined();
      expect(splitVariant?.overrides).toEqual({});
    });

    it('hero-fullscreen variant should NOT have stat overrides', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      const fullscreenVariant = heroBlock?.variants?.find(v => v.id === 'hero-fullscreen');
      
      expect(fullscreenVariant).toBeDefined();
      expect(fullscreenVariant?.overrides).toEqual({});
    });

    it('hero-minimal variant should NOT have stat overrides', () => {
      const heroBlock = SHARED_BLOCKS.find(b => b.id === 'hero-basic');
      const minimalVariant = heroBlock?.variants?.find(v => v.id === 'hero-minimal');
      
      expect(minimalVariant).toBeDefined();
      expect(minimalVariant?.overrides).toEqual({});
    });
  });

  describe('Business Categories', () => {
    it('should have 4 restaurant sub-categories', () => {
      const restaurantCategories = BUSINESS_CATEGORIES.filter(c => 
        c.id.startsWith('restaurant')
      );
      
      expect(restaurantCategories.length).toBeGreaterThanOrEqual(5); // restaurant + 4 sub-categories
      
      const categoryIds = restaurantCategories.map(c => c.id);
      expect(categoryIds).toContain('restaurant');
      expect(categoryIds).toContain('restaurant-modern');
      expect(categoryIds).toContain('restaurant-luxury');
      expect(categoryIds).toContain('restaurant-minimal');
      expect(categoryIds).toContain('restaurant-casual');
    });

    it('restaurant-modern should use hero-split variant', () => {
      const modernCat = BUSINESS_CATEGORIES.find(c => c.id === 'restaurant-modern');
      
      expect(modernCat).toBeDefined();
      
      const heroBlock = modernCat?.blocks.find(b => b.blockId === 'hero-basic');
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.variantId).toBe('hero-split');
    });

    it('restaurant-luxury should use hero-fullscreen variant', () => {
      const luxuryCat = BUSINESS_CATEGORIES.find(c => c.id === 'restaurant-luxury');
      
      expect(luxuryCat).toBeDefined();
      
      const heroBlock = luxuryCat?.blocks.find(b => b.blockId === 'hero-basic');
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.variantId).toBe('hero-fullscreen');
    });

    it('restaurant-minimal should use hero-minimal variant', () => {
      const minimalCat = BUSINESS_CATEGORIES.find(c => c.id === 'restaurant-minimal');
      
      expect(minimalCat).toBeDefined();
      
      const heroBlock = minimalCat?.blocks.find(b => b.blockId === 'hero-basic');
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.variantId).toBe('hero-minimal');
    });

    it('restaurant-casual should use hero-cards variant', () => {
      const casualCat = BUSINESS_CATEGORIES.find(c => c.id === 'restaurant-casual');
      
      expect(casualCat).toBeDefined();
      
      const heroBlock = casualCat?.blocks.find(b => b.blockId === 'hero-basic');
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.variantId).toBe('hero-cards');
    });

    it('restaurant-casual hero should have stat customizations', () => {
      const casualCat = BUSINESS_CATEGORIES.find(c => c.id === 'restaurant-casual');
      const heroBlock = casualCat?.blocks.find(b => b.blockId === 'hero-basic');
      
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.customizations).toBeDefined();
      expect(heroBlock?.customizations).toHaveProperty('stat1');
      expect(heroBlock?.customizations).toHaveProperty('stat1Label');
      expect(heroBlock?.customizations).toHaveProperty('stat2');
      expect(heroBlock?.customizations).toHaveProperty('stat2Label');
      expect(heroBlock?.customizations).toHaveProperty('stat3');
      expect(heroBlock?.customizations).toHaveProperty('stat3Label');
    });
  });

  describe('Override System', () => {
    const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);

    it('should resolve restaurant-modern manifest correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-modern', []);
      
      expect(result.concreteManifest).toBeDefined();
      expect(result.concreteManifest.businessCategory.id).toBe('restaurant-modern');
      
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      expect(heroBlock).toBeDefined();
      expect(heroBlock?.metadata.variantId).toBe('hero-split');
      
      // hero-split ไม่ควรมี stat placeholders
      expect(heroBlock?.placeholders).not.toHaveProperty('stat1');
      expect(heroBlock?.placeholders).not.toHaveProperty('stat2');
      expect(heroBlock?.placeholders).not.toHaveProperty('stat3');
    });

    it('should resolve restaurant-luxury manifest correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-luxury', []);
      
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      expect(heroBlock?.metadata.variantId).toBe('hero-fullscreen');
      
      // hero-fullscreen ไม่ควรมี stat placeholders
      expect(heroBlock?.placeholders).not.toHaveProperty('stat1');
    });

    it('should resolve restaurant-minimal manifest correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-minimal', []);
      
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      expect(heroBlock?.metadata.variantId).toBe('hero-minimal');
      
      // hero-minimal ไม่ควรมี stat placeholders
      expect(heroBlock?.placeholders).not.toHaveProperty('stat1');
    });

    it('should resolve restaurant-casual manifest correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-casual', []);
      
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      expect(heroBlock?.metadata.variantId).toBe('hero-cards');
      
      // hero-cards ควรมี stat placeholders
      expect(heroBlock?.placeholders).toHaveProperty('stat1');
      expect(heroBlock?.placeholders).toHaveProperty('stat1Label');
      expect(heroBlock?.placeholders).toHaveProperty('stat2');
      expect(heroBlock?.placeholders).toHaveProperty('stat2Label');
      expect(heroBlock?.placeholders).toHaveProperty('stat3');
      expect(heroBlock?.placeholders).toHaveProperty('stat3Label');
    });

    it('should resolve restaurant (standard) manifest correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant', []);
      
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      expect(heroBlock?.metadata.variantId).toBe('hero-stats');
      
      // hero-stats ควรมี stat placeholders
      expect(heroBlock?.placeholders).toHaveProperty('stat1');
      expect(heroBlock?.placeholders).toHaveProperty('stat2');
      expect(heroBlock?.placeholders).toHaveProperty('stat3');
    });

    it('should apply variant template correctly', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-modern', []);
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      
      expect(heroBlock?.template).toBeDefined();
      expect(heroBlock?.template).toContain('hero-split'); // อาจจะไม่มี แต่ควร contain split layout elements
      expect(heroBlock?.template).toContain('lg:grid-cols-2'); // Split layout characteristic
    });
  });

  describe('Variant Flow Integration', () => {
    const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);

    it('should generate full website with restaurant-modern', async () => {
      const mockUserData = {
        global: {
          palette: { primary: 'blue', secondary: 'indigo', bgTone: '50' },
          tokens: { radius: '12px', spacing: '1rem' }
        },
        Hero: {
          badge: 'Modern Restaurant',
          heading: 'Contemporary Dining',
          subheading: 'Experience modern cuisine',
          ctaLabel: 'View Menu',
          secondaryCta: 'Book Now',
          heroImage: 'https://via.placeholder.com/1920x1080',
          heroImageAlt: 'Restaurant interior'
        },
        Navbar: {
          brand: 'Modern Cafe',
          brandFirstChar: 'M',
          ctaButton: 'Reserve',
          menuItems: [
            { label: 'Home', href: '/' },
            { label: 'Menu', href: '/menu' }
          ]
        },
        'About-basic': {
          title: 'About Us',
          description: 'Modern restaurant',
          features: [{ title: 'Fresh', description: 'Daily fresh ingredients' }],
          stats: [{ number: '10+', label: 'Years' }]
        },
        'Menu-basic': {
          title: 'Our Menu',
          menuItems: [
            { name: 'Pasta', price: '150', description: 'Italian pasta', image: 'https://via.placeholder.com/400x300', imageAlt: 'Pasta', category: 'food' }
          ]
        },
        'Contact-basic': {
          title: 'Contact',
          subtitle: 'Get in touch',
          address: '123 Street',
          phone: '02-123-4567',
          email: 'info@modern.com',
          businessHours: '10:00-22:00'
        },
        'Footer-basic': {
          companyName: 'Modern Cafe',
          description: 'Modern restaurant',
          socialLinks: [{ name: 'Facebook', url: 'https://facebook.com', icon: '📘' }],
          quickLinks: [{ label: 'Home', href: '/' }],
          address: '123 Street',
          phone: '02-123-4567',
          email: 'info@modern.com'
        }
      };

      const result = await overrideSystem.generateWebsite(
        'restaurant-modern',
        mockUserData,
        [],
        false // disable validation สำหรับการทดสอบ
      );

      expect(result.files).toBeDefined();
      expect(Object.keys(result.files).length).toBeGreaterThan(0);
      expect(result.concreteManifest.businessCategory.id).toBe('restaurant-modern');
      
      // เช็คว่า Hero file ถูกสร้าง
      const heroFile = result.files['hero-basic.tsx'] || result.files['Hero.tsx'];
      expect(heroFile).toBeDefined();
      
      // hero-split ไม่ควรมี stat ใน template
      expect(heroFile).not.toContain('{stat1}');
      expect(heroFile).not.toContain('{stat2}');
      expect(heroFile).not.toContain('{stat3}');
    });

    it('should generate full website with restaurant-casual (with stats)', async () => {
      const mockUserData = {
        global: {
          palette: { primary: 'orange', secondary: 'yellow', bgTone: '100' },
          tokens: { radius: '8px', spacing: '1rem' }
        },
        Hero: {
          badge: 'Casual Restaurant',
          heading: 'Friendly Dining',
          subheading: 'Family atmosphere',
          ctaLabel: 'View Menu',
          secondaryCta: 'Promotions',
          heroImage: 'https://via.placeholder.com/1920x1080',
          heroImageAlt: 'Restaurant',
          stat1: '15+',
          stat1Label: 'Years',
          stat2: '1000+',
          stat2Label: 'Happy Customers',
          stat3: '50+',
          stat3Label: 'Dishes'
        },
        Navbar: {
          brand: 'Casual Cafe',
          brandFirstChar: 'C',
          ctaButton: 'Order',
          menuItems: [{ label: 'Home', href: '/' }]
        },
        'About-basic': {
          title: 'About',
          description: 'Casual dining',
          features: [{ title: 'Friendly', description: 'Warm service' }],
          stats: [{ number: '15+', label: 'Years' }]
        },
        'Menu-basic': {
          title: 'Menu',
          menuItems: [
            { name: 'Burger', price: '60', description: 'Tasty burger', image: 'https://via.placeholder.com/400x300', imageAlt: 'Burger', category: 'food' }
          ]
        },
        'Contact-basic': {
          title: 'Contact',
          subtitle: 'Reach us',
          address: '321 Street',
          phone: '02-234-5678',
          email: 'info@casual.com',
          businessHours: '10:00-22:00'
        },
        'Footer-basic': {
          companyName: 'Casual Cafe',
          description: 'Casual restaurant',
          socialLinks: [{ name: 'Facebook', url: 'https://facebook.com', icon: '📘' }],
          quickLinks: [{ label: 'Home', href: '/' }],
          address: '321 Street',
          phone: '02-234-5678',
          email: 'info@casual.com'
        }
      };

      const result = await overrideSystem.generateWebsite(
        'restaurant-casual',
        mockUserData,
        [],
        false
      );

      expect(result.files).toBeDefined();
      expect(result.concreteManifest.businessCategory.id).toBe('restaurant-casual');
      
      const heroFile = result.files['hero-basic.tsx'] || result.files['Hero.tsx'];
      expect(heroFile).toBeDefined();
      
      // hero-cards ควรมี stats ใน template
      expect(heroFile).toContain('15+'); // stat1 value
      expect(heroFile).toContain('Years'); // stat1Label value
    });
  });

  describe('Variant Detection Flow', () => {
    const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);

    it('should correctly identify variant from manifest', async () => {
      const testCases = [
        { category: 'restaurant', expectedVariant: 'hero-stats' },
        { category: 'restaurant-modern', expectedVariant: 'hero-split' },
        { category: 'restaurant-luxury', expectedVariant: 'hero-fullscreen' },
        { category: 'restaurant-minimal', expectedVariant: 'hero-minimal' },
        { category: 'restaurant-casual', expectedVariant: 'hero-cards' },
      ];

      for (const testCase of testCases) {
        const result = await overrideSystem.resolveManifest(testCase.category, []);
        const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
        
        expect(heroBlock?.metadata.variantId).toBe(testCase.expectedVariant);
        console.log(`✅ ${testCase.category} → ${testCase.expectedVariant}`);
      }
    });

    it('should include correct placeholders based on variant', async () => {
      // Variants without stats
      const variantsWithoutStats = ['hero-split', 'hero-fullscreen', 'hero-minimal'];
      const categoriesWithoutStats = ['restaurant-modern', 'restaurant-luxury', 'restaurant-minimal'];

      for (let i = 0; i < categoriesWithoutStats.length; i++) {
        const result = await overrideSystem.resolveManifest(categoriesWithoutStats[i], []);
        const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
        
        expect(heroBlock?.metadata.variantId).toBe(variantsWithoutStats[i]);
        expect(heroBlock?.placeholders.stat1).toBeUndefined();
        expect(heroBlock?.placeholders.stat2).toBeUndefined();
        expect(heroBlock?.placeholders.stat3).toBeUndefined();
      }

      // Variants with stats
      const variantsWithStats = ['hero-stats', 'hero-cards'];
      const categoriesWithStats = ['restaurant', 'restaurant-casual'];

      for (let i = 0; i < categoriesWithStats.length; i++) {
        const result = await overrideSystem.resolveManifest(categoriesWithStats[i], []);
        const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
        
        expect(heroBlock?.metadata.variantId).toBe(variantsWithStats[i]);
        expect(heroBlock?.placeholders.stat1).toBeDefined();
        expect(heroBlock?.placeholders.stat2).toBeDefined();
        expect(heroBlock?.placeholders.stat3).toBeDefined();
        expect(heroBlock?.placeholders.stat1.required).toBe(true);
      }
    });
  });

  describe('Applied Overrides Tracking', () => {
    const overrideSystem = createOverrideSystem(SHARED_BLOCKS, BUSINESS_CATEGORIES);

    it('should track variant application in appliedOverrides', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-modern', []);
      const heroBlock = result.concreteManifest.blocks.find(b => b.id === 'hero-basic');
      
      expect(heroBlock?.appliedOverrides).toBeDefined();
      expect(heroBlock?.appliedOverrides).toContain('variant-hero-split');
    });

    it('should track all applied overrides', async () => {
      const result = await overrideSystem.resolveManifest('restaurant-luxury', []);
      
      expect(result.appliedOverrides).toBeDefined();
      expect(result.appliedOverrides.length).toBeGreaterThan(0);
      expect(result.appliedOverrides).toContain('variant-hero-fullscreen');
    });
  });
});

