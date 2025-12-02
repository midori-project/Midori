import { UnsplashService, UnsplashImage } from './unsplash-service';

export interface BatchImageRequest {
  id: string;
  itemName: string;
  category: string;
  businessCategory: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BatchImageResponse {
  id: string;
  image: string;
  imageAlt: string;
  success: boolean;
  error?: string;
}

export class BatchUnsplashService {
  private unsplashService: UnsplashService;
  private batchSize: number = 8; // Process 8 items at a time (optimized for menu items)
  private delayBetweenBatches: number = 50; // 50ms delay between batches (reduced for better performance)

  constructor() {
    this.unsplashService = new UnsplashService();
  }

  /**
   * Process multiple menu items in batches
   * Phase 2: Menu items batch processing
   */
  async getImagesForMenuItems(
    menuItems: Array<{
      name: string;
      category: string;
      businessCategory: string;
    }>
  ): Promise<BatchImageResponse[]> {
    console.log(`🚀 Batch processing ${menuItems.length} menu items...`);
    
    // Convert to batch requests
    const batchRequests: BatchImageRequest[] = menuItems.map((item, index) => ({
      id: `menu-${index}`,
      itemName: item.name,
      category: item.category,
      businessCategory: item.businessCategory,
      priority: 'medium' as const
    }));

    // Process in batches
    const results: BatchImageResponse[] = [];
    const batches = this.createBatches(batchRequests, this.batchSize);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      if (!batch) continue;
      
      console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);
      
      try {
        const batchResults = await this.processBatch(batch);
        results.push(...batchResults);
        
        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.delay(this.delayBetweenBatches);
        }
      } catch (error) {
        console.error(`❌ Error processing batch ${i + 1}:`, error);
        // Add fallback results for failed batch
        const fallbackResults = batch.map(req => ({
          id: req.id,
          image: "https://via.placeholder.com/400x300?text=Image+Not+Available",
          imageAlt: req.itemName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
        results.push(...fallbackResults);
      }
    }

    console.log(`✅ Batch processing completed: ${results.filter(r => r.success).length}/${results.length} successful`);
    return results;
  }

  /**
   * Process a single batch of requests
   */
  private async processBatch(batch: BatchImageRequest[]): Promise<BatchImageResponse[]> {
    // Process all items in the batch concurrently
    const promises = batch.map(async (request) => {
      try {
        const unsplashImage = await this.unsplashService.getImageForMenuItem(
          request.itemName,
          request.category,
          request.businessCategory
        );

        const imageUrl = this.unsplashService.generateImageUrl(unsplashImage, {
          width: 400,
          height: 300,
          quality: 80,
        });

        return {
          id: request.id,
          image: imageUrl,
          imageAlt: unsplashImage.alt_description || request.itemName,
          success: true
        };
      } catch (error) {
        console.error(`❌ Error processing ${request.id}:`, error);
        return {
          id: request.id,
          image: "https://via.placeholder.com/400x300?text=Image+Not+Available",
          imageAlt: request.itemName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    });

    return Promise.all(promises);
  }

  /**
   * Create batches from array of requests
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Phase 3: Extend to other sections
   * Get images for multiple sections in one batch
   */
  async getImagesForSections(requests: {
    hero?: { businessCategory: string; keywords: string[] };
    about?: { businessCategory: string; keywords: string[] };
    menuItems?: Array<{ name: string; category: string; businessCategory: string }>;
  }): Promise<{
    hero?: { heroImage: string; heroImageAlt: string };
    about?: { aboutImage: string; aboutImageAlt: string };
    menuItems?: BatchImageResponse[];
  }> {
    console.log('🚀 Processing multiple sections in batch...');
    
    const results: any = {};

    // Process all sections concurrently
    const promises: Promise<any>[] = [];

    if (requests.hero) {
      promises.push(
        this.unsplashService.searchImages(
          this.buildHeroSearchQuery(requests.hero.businessCategory, requests.hero.keywords),
          { perPage: 5, orientation: "landscape", orderBy: "relevant" }
        ).then(images => {
          if (images.length > 0) {
            const randomIndex = Math.floor(Math.random() * images.length);
            const selectedImage = images[randomIndex];
            if (selectedImage) {
              const imageUrl = this.unsplashService.generateImageUrl(selectedImage, {
                width: 1920,
                height: 1080,
                quality: 85,
              });
              results.hero = {
                heroImage: imageUrl,
                heroImageAlt: selectedImage.alt_description || `${requests.hero!.businessCategory} hero image`
              };
            }
          }
        })
      );
    }

    if (requests.about) {
      promises.push(
        this.unsplashService.searchImages(
          this.buildAboutSearchQuery(requests.about.businessCategory, requests.about.keywords),
          { perPage: 5, orientation: "landscape", orderBy: "relevant" }
        ).then(images => {
          if (images.length > 0) {
            const randomIndex = Math.floor(Math.random() * images.length);
            const selectedImage = images[randomIndex];
            if (selectedImage) {
              const imageUrl = this.unsplashService.generateImageUrl(selectedImage, {
                width: 600,
                height: 400,
                quality: 80,
              });
              results.about = {
                aboutImage: imageUrl,
                aboutImageAlt: selectedImage.alt_description || `${requests.about!.businessCategory} about image`
              };
            }
          }
        })
      );
    }

    if (requests.menuItems && requests.menuItems.length > 0) {
      promises.push(
        this.getImagesForMenuItems(requests.menuItems).then(menuResults => {
          results.menuItems = menuResults;
        })
      );
    }

    await Promise.all(promises);
    console.log('✅ Multi-section batch processing completed');
    return results;
  }

  private buildHeroSearchQuery(businessCategory: string, keywords: string[]): string {
    return `${businessCategory} ${keywords.join(' ')} design hero background`;
  }

  private buildAboutSearchQuery(businessCategory: string, keywords: string[]): string {
    return `${businessCategory} ${keywords.join(' ')} interior about`;
  }
}
