/**
 * Unsplash Service
 * บริการสำหรับดึงรูปภาพจาก Unsplash API แบบ dynamic
 */

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
    username: string;
  };
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

export class UnsplashService {
  private accessKey: string;
  private baseUrl = 'https://api.unsplash.com';
  private cache: Map<string, UnsplashImage[]> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.accessKey = process.env.UNSPLASH_ACCESS_KEY || '';
    if (!this.accessKey) {
      console.warn('⚠️ UNSPLASH_ACCESS_KEY not found, using fallback images');
    }
  }

  /**
   * Search for images based on keywords
   */
  async searchImages(
    query: string, 
    options: {
      perPage?: number;
      orientation?: 'landscape' | 'portrait' | 'squarish';
      color?: 'black_and_white' | 'black' | 'white' | 'yellow' | 'orange' | 'red' | 'purple' | 'magenta' | 'green' | 'teal' | 'blue';
      orderBy?: 'relevant' | 'latest';
    } = {}
  ): Promise<UnsplashImage[]> {
    const {
      perPage = 10,
      orientation = 'landscape',
      color,
      orderBy = 'relevant'
    } = options;

    // Check cache first
    const cacheKey = `${query}-${perPage}-${orientation}-${color || 'any'}-${orderBy}`;
    if (this.isCacheValid(cacheKey)) {
      console.log(`📸 Using cached images for: ${query}`);
      return this.cache.get(cacheKey) || [];
    }

    if (!this.accessKey) {
      return this.getFallbackImages(query);
    }

    try {
      const params = new URLSearchParams({
        query,
        per_page: perPage.toString(),
        orientation,
        order_by: orderBy,
        ...(color && { color })
      });

      const response = await fetch(`${this.baseUrl}/search/photos?${params}`, {
        headers: {
          'Authorization': `Client-ID ${this.accessKey}`,
          'Accept-Version': 'v1'
        }
      });

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status}`);
      }

      const data: UnsplashSearchResponse = await response.json();
      const images = data.results || [];

      // Cache the results
      this.cache.set(cacheKey, images);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      console.log(`📸 Found ${images.length} images for: ${query}`);
      return images;

    } catch (error) {
      console.error('❌ Unsplash API error:', error);
      return this.getFallbackImages(query);
    }
  }

  /**
   * Get a single image for a specific menu item
   */
  async getImageForMenuItem(
    itemName: string, 
    category: string, 
    businessCategory: string
  ): Promise<UnsplashImage> {
    // Create intelligent search query
    const searchQuery = this.buildSearchQuery(itemName, category, businessCategory);
    
    try {
      const images = await this.searchImages(searchQuery, {
        perPage: 5,
        orientation: 'landscape',
        orderBy: 'relevant'
      });

      if (images.length > 0) {
        // Return a random image from the results
        const randomIndex = Math.floor(Math.random() * images.length);
        const selectedImage = images[randomIndex];
        if (selectedImage) {
          return selectedImage;
        }
      }

      // Fallback to category-based search
      const categoryImages = await this.searchImages(category, {
        perPage: 3,
        orientation: 'landscape'
      });

      if (categoryImages.length > 0) {
        const randomIndex = Math.floor(Math.random() * categoryImages.length);
        const selectedImage = categoryImages[randomIndex];
        if (selectedImage) {
          return selectedImage;
        }
      }

      // Final fallback
      return this.getFallbackImage(itemName, category);

    } catch (error) {
      console.error('❌ Error getting image for menu item:', error);
      return this.getFallbackImage(itemName, category);
    }
  }

  /**
   * Build intelligent search query based on context
   */
  private buildSearchQuery(itemName: string, category: string, businessCategory: string): string {
    const businessKeywords: Record<string, string[]> = {
      restaurant: [
        'food', 'delicious', 'tasty', 'cooking', 'cuisine',
        'thai food', 'asian cuisine', 'street food', 'fine dining',
        'restaurant food', 'chef', 'culinary', 'gourmet', 'appetizing'
      ],
      ecommerce: [
        'product', 'shopping', 'store', 'retail', 'commercial',
        'online shopping', 'ecommerce', 'marketplace', 'consumer goods',
        'retail product', 'shopping experience', 'product display'
      ],
      healthcare: [
        'health', 'medical', 'wellness', 'care', 'medicine',
        'healthcare', 'medical care', 'health products', 'wellness',
        'medical equipment', 'healthcare professional', 'patient care'
      ],
      pharmacy: [
        'medicine', 'health', 'pharmaceutical', 'medical', 'drugs',
        'pharmacy', 'medication', 'healthcare', 'medical supplies',
        'pharmaceutical care', 'medicine cabinet', 'health products'
      ],
      portfolio: [
        'design', 'creative', 'art', 'professional', 'work',
        'creative work', 'design studio', 'artistic', 'professional work',
        'creative design', 'art portfolio', 'design work'
      ]
    };

    const categoryKeywords: Record<string, string[]> = {
      rice: ['rice', 'fried rice', 'thai rice', 'grain', 'jasmine rice', 'sticky rice'],
      noodles: ['noodles', 'pasta', 'thai noodles', 'stir fry', 'pad thai', 'ramen'],
      soup: ['soup', 'broth', 'thai soup', 'hot soup', 'tom yum', 'clear soup'],
      curry: ['curry', 'thai curry', 'coconut curry', 'spicy', 'green curry', 'red curry'],
      book: ['book', 'reading', 'literature', 'education', 'textbook', 'novel'],
      stationery: ['stationery', 'office', 'writing', 'pen', 'pencil', 'notebook'],
      toy: ['toy', 'children', 'play', 'fun', 'game', 'educational toy'],
      medicine: ['medicine', 'health', 'medical', 'pharmaceutical', 'pills', 'capsules'],
      design: ['design', 'creative', 'art', 'graphic', 'professional', 'visual']
    };

    // Randomize keywords for variety
    const shuffledBusinessKeywords = this.shuffleArray(businessKeywords[businessCategory] || []);
    const shuffledCategoryKeywords = this.shuffleArray(categoryKeywords[category] || []);
    
    // Prioritize item name (AI translation) for most specific results
    const queries = [
      // Strategy 1: Just item name (most specific)
      itemName,
      
      // Strategy 2: Item name + business context
      `${itemName} ${shuffledBusinessKeywords.slice(0, 2).join(' ')}`,
      
      // Strategy 3: Item name + category context
      `${itemName} ${shuffledCategoryKeywords.slice(0, 2).join(' ')}`,
      
      // Strategy 4: Item name + both contexts
      `${itemName} ${shuffledBusinessKeywords.slice(0, 1).join(' ')} ${shuffledCategoryKeywords.slice(0, 1).join(' ')}`,
      
      // Fallback: Category + business context (only if itemName is too generic)
      `${category} ${shuffledBusinessKeywords.slice(0, 2).join(' ')}`
    ];

    // Prefer specific queries, fallback to generic ones
    const validQueries = queries.filter(q => q.trim().length > 0);
    const randomQuery = validQueries[0]; // Always use the most specific query first
    
    return randomQuery || 'food';
  }


  /**
   * Shuffle array for randomization
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    return shuffled;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(cacheKey);
      this.cacheExpiry.delete(cacheKey);
      return false;
    }
    return this.cache.has(cacheKey);
  }

  /**
   * Get fallback images when API is not available
   */
  private getFallbackImages(query: string): UnsplashImage[] {
    const fallbackImages: Record<string, UnsplashImage[]> = {
      restaurant: [
        {
          id: 'fallback-restaurant-1',
          urls: {
            small: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center',
            regular: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
            full: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&h=1080&fit=crop&crop=center'
          },
          alt_description: 'Restaurant interior with elegant dining setup',
          description: 'Beautiful restaurant ambiance',
          user: { name: 'Unsplash', username: 'unsplash' }
        }
      ],
      food: [
        {
          id: 'fallback-food-1',
          urls: {
            small: 'https://images.unsplash.com/photo-1555939594-58d7cb5614a6?w=400&h=300&fit=crop&crop=center',
            regular: 'https://images.unsplash.com/photo-1555939594-58d7cb5614a6?w=800&h=600&fit=crop&crop=center',
            full: 'https://images.unsplash.com/photo-1555939594-58d7cb5614a6?w=1920&h=1080&fit=crop&crop=center'
          },
          alt_description: 'Delicious food',
          description: 'Appetizing food photography',
          user: { name: 'Unsplash', username: 'unsplash' }
        }
      ],
      product: [
        {
          id: 'fallback-product-1',
          urls: {
            small: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop&crop=center',
            regular: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop&crop=center',
            full: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&h=1080&fit=crop&crop=center'
          },
          alt_description: 'Product showcase',
          description: 'Professional product photography',
          user: { name: 'Unsplash', username: 'unsplash' }
        }
      ],
      medicine: [
        {
          id: 'fallback-medicine-1',
          urls: {
            small: 'https://images.unsplash.com/photo-1576091160395-1125e5b7b9c5?w=400&h=300&fit=crop&crop=center',
            regular: 'https://images.unsplash.com/photo-1576091160395-1125e5b7b9c5?w=800&h=600&fit=crop&crop=center',
            full: 'https://images.unsplash.com/photo-1576091160395-1125e5b7b9c5?w=1920&h=1080&fit=crop&crop=center'
          },
          alt_description: 'Medical supplies',
          description: 'Healthcare and medical products',
          user: { name: 'Unsplash', username: 'unsplash' }
        }
      ]
    };

    // Find appropriate fallback based on query
    const queryLower = query.toLowerCase();
    
    // Restaurant/cafe/dining related
    if (queryLower.includes('restaurant') || queryLower.includes('cafe') || 
        queryLower.includes('dining') || queryLower.includes('luxury') ||
        queryLower.includes('cat') || queryLower.includes('bistro')) {
      console.log(`📸 Using restaurant fallback for query: ${query}`);
      return fallbackImages.restaurant || fallbackImages.food || [];
    }
    
    // Food related
    if (queryLower.includes('food') || queryLower.includes('rice') || queryLower.includes('noodle')) {
      return fallbackImages.food || [];
    }
    
    // Product related
    if (queryLower.includes('book') || queryLower.includes('product') || queryLower.includes('toy')) {
      return fallbackImages.product || [];
    }
    
    // Medical related
    if (queryLower.includes('medicine') || queryLower.includes('health') || queryLower.includes('medical')) {
      return fallbackImages.medicine || [];
    }

    // Default fallback to restaurant for business-like queries
    console.log(`📸 Using default restaurant fallback for query: ${query}`);
    return fallbackImages.restaurant || fallbackImages.food || [];
  }

  /**
   * Get a single fallback image
   */
  private getFallbackImage(itemName: string, category: string): UnsplashImage {
    const fallbackImages = this.getFallbackImages(category);
    const foodImages = this.getFallbackImages('food');
    return fallbackImages[0] || foodImages[0] || {
      id: 'default-fallback',
      urls: {
        small: 'https://via.placeholder.com/400x300?text=Image',
        regular: 'https://via.placeholder.com/800x600?text=Image',
        full: 'https://via.placeholder.com/1920x1080?text=Image'
      },
      alt_description: 'Default image',
      description: 'Default fallback image',
      user: { name: 'System', username: 'system' }
    };
  }

  /**
   * Generate optimized image URL
   */
  generateImageUrl(image: UnsplashImage, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): string {
    const { width = 400, height = 300, quality = 80 } = options;
    
    // Use the regular URL and add parameters
    const baseUrl = image.urls.regular;
    const url = new URL(baseUrl);
    
    url.searchParams.set('w', width.toString());
    url.searchParams.set('h', height.toString());
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('crop', 'center');
    url.searchParams.set('q', quality.toString());
    
    return url.toString();
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
    console.log('🗑️ Unsplash cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}
