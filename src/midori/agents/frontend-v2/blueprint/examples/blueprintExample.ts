/**
 * Blueprint System Examples
 * Demonstrates how to use the Blueprint System
 */

import { BlueprintSelector } from '../selector';
import { ONEPAGER_BLUEPRINTS } from '../layouts/onepager';
import type { SelectBlueprintInput } from '../types';

/**
 * Example 1: Select a blueprint for a restaurant
 */
export function exampleRestaurantBlueprint() {
  console.log('\n=== Example 1: Restaurant Blueprint ===\n');
  
  const input: SelectBlueprintInput = {
    businessCategory: 'restaurant',
    features: ['menu', 'about', 'contact'],
    complexity: 'moderate'
  };
  
  const blueprint = BlueprintSelector.select(input);
  
  console.log('Blueprint Selected:', blueprint.name);
  console.log('Blueprint ID:', blueprint.id);
  console.log('Pages:', blueprint.pages.length);
  console.log('Sections:', blueprint.pages[0].sections.map(s => s.name).join(', '));
  console.log('\nSection Details:');
  blueprint.pages[0].sections.forEach(section => {
    console.log(`  - ${section.name} (${section.componentId})`);
    console.log(`    Variants: ${section.variantPreference?.join(', ')}`);
    console.log(`    Required: ${section.required}`);
  });
}

/**
 * Example 2: Select a blueprint for e-commerce
 */
export function exampleEcommerceBlueprint() {
  console.log('\n=== Example 2: E-commerce Blueprint ===\n');
  
  const input: SelectBlueprintInput = {
    businessCategory: 'ecommerce',
    features: ['products', 'cart', 'about', 'contact'],
    complexity: 'moderate'
  };
  
  const blueprint = BlueprintSelector.select(input);
  
  console.log('Blueprint Selected:', blueprint.name);
  console.log('Category:', blueprint.category);
  console.log('Type:', blueprint.type);
  console.log('Complexity:', blueprint.metadata.complexity);
  console.log('Estimated Components:', blueprint.metadata.estimatedComponents);
  console.log('\nLayout Configuration:');
  console.log('  Type:', blueprint.layout.type);
  console.log('  Sections:', blueprint.layout.sections.join(', '));
  console.log('  Navigation:', blueprint.layout.navigation?.type);
}

/**
 * Example 3: Select a blueprint for portfolio
 */
export function examplePortfolioBlueprint() {
  console.log('\n=== Example 3: Portfolio Blueprint ===\n');
  
  const input: SelectBlueprintInput = {
    businessCategory: 'portfolio',
    features: ['about', 'contact'],
    complexity: 'simple'
  };
  
  const blueprint = BlueprintSelector.select(input);
  
  console.log('Blueprint Selected:', blueprint.name);
  console.log('Description:', blueprint.description);
  console.log('Features:', blueprint.metadata.features.join(', '));
  console.log('Target Devices:', blueprint.metadata.targetDevices.join(', '));
  console.log('\nComponent Requirements:');
  blueprint.components.forEach(comp => {
    console.log(`  - ${comp.category}: Required=${comp.required}, Min=${comp.min}, Max=${comp.max}`);
  });
}

/**
 * Example 4: Get blueprint by ID
 */
export function exampleGetBlueprintById() {
  console.log('\n=== Example 4: Get Blueprint by ID ===\n');
  
  const blueprintId = 'restaurant-onepager-v1';
  const blueprint = BlueprintSelector.getById(blueprintId);
  
  if (blueprint) {
    console.log('Found Blueprint:', blueprint.name);
    console.log('Total Sections:', blueprint.pages[0].sections.length);
    console.log('Required Sections:', blueprint.pages[0].sections.filter(s => s.required).length);
    console.log('Optional Sections:', blueprint.pages[0].sections.filter(s => !s.required).length);
  } else {
    console.log('Blueprint not found');
  }
}

/**
 * Example 5: Get all blueprints for a category
 */
export function exampleGetBlueprintsByCategory() {
  console.log('\n=== Example 5: Get Blueprints by Category ===\n');
  
  const category = 'restaurant';
  const blueprints = BlueprintSelector.getByCategory(category);
  
  console.log(`Found ${blueprints.length} blueprint(s) for category: ${category}`);
  blueprints.forEach(bp => {
    console.log(`  - ${bp.name} (${bp.id})`);
    console.log(`    Type: ${bp.type}, Complexity: ${bp.metadata.complexity}`);
  });
}

/**
 * Example 6: List all available blueprints
 */
export function exampleListAllBlueprints() {
  console.log('\n=== Example 6: List All Blueprints ===\n');
  
  const allBlueprints = BlueprintSelector.listAll();
  
  console.log(`Total Blueprints: ${allBlueprints.length}\n`);
  allBlueprints.forEach(bp => {
    console.log(`${bp.name} (${bp.id})`);
    console.log(`  Category: ${bp.category}`);
    console.log(`  Type: ${bp.type}`);
    console.log(`  Complexity: ${bp.metadata.complexity}`);
    console.log(`  Components: ${bp.metadata.estimatedComponents}`);
    console.log('');
  });
}

/**
 * Example 7: Direct access to onepager blueprints
 */
export function exampleDirectAccess() {
  console.log('\n=== Example 7: Direct Access to Blueprints ===\n');
  
  console.log('Restaurant Onepager:');
  console.log('  ID:', ONEPAGER_BLUEPRINTS.restaurant.id);
  console.log('  Sections:', ONEPAGER_BLUEPRINTS.restaurant.pages[0].sections.length);
  
  console.log('\nE-commerce Onepager:');
  console.log('  ID:', ONEPAGER_BLUEPRINTS.ecommerce.id);
  console.log('  Sections:', ONEPAGER_BLUEPRINTS.ecommerce.pages[0].sections.length);
  
  console.log('\nPortfolio Onepager:');
  console.log('  ID:', ONEPAGER_BLUEPRINTS.portfolio.id);
  console.log('  Sections:', ONEPAGER_BLUEPRINTS.portfolio.pages[0].sections.length);
}

/**
 * Example 8: Customized blueprint selection
 */
export function exampleCustomizedSelection() {
  console.log('\n=== Example 8: Customized Blueprint Selection ===\n');
  
  // Scenario: Restaurant with only menu and contact (no about section)
  const input: SelectBlueprintInput = {
    businessCategory: 'restaurant',
    features: ['menu', 'contact'], // No 'about'
    complexity: 'simple',
    customRequirements: ['minimal', 'fast-loading']
  };
  
  const blueprint = BlueprintSelector.select(input);
  
  console.log('Blueprint Selected:', blueprint.name);
  console.log('Sections included:');
  blueprint.pages[0].sections.forEach(section => {
    const status = section.required ? 'Required' : 'Optional';
    console.log(`  - ${section.name} [${status}]`);
  });
}

/**
 * Run all examples
 */
export function runAllBlueprintExamples() {
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   Blueprint System Examples               ║');
  console.log('╚═══════════════════════════════════════════╝');
  
  exampleRestaurantBlueprint();
  exampleEcommerceBlueprint();
  examplePortfolioBlueprint();
  exampleGetBlueprintById();
  exampleGetBlueprintsByCategory();
  exampleListAllBlueprints();
  exampleDirectAccess();
  exampleCustomizedSelection();
  
  console.log('\n✅ All examples completed!\n');
}

// Export all examples
export default {
  exampleRestaurantBlueprint,
  exampleEcommerceBlueprint,
  examplePortfolioBlueprint,
  exampleGetBlueprintById,
  exampleGetBlueprintsByCategory,
  exampleListAllBlueprints,
  exampleDirectAccess,
  exampleCustomizedSelection,
  runAllBlueprintExamples
};

