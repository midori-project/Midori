# Site Generator - Refactored Architecture

## Overview

This directory contains the refactored site generator modules, breaking down the original monolithic `site-generator.ts` file into smaller, more manageable and focused modules.

## Architecture

### Core Modules

#### 1. `config.ts`
- **Purpose**: Centralized configuration management
- **Contains**: 
  - OpenAI client initialization
  - Model configurations
  - Temperature settings
  - Default generation options
- **Benefits**: Single source of truth for all configuration

#### 2. `types.ts`
- **Purpose**: TypeScript type definitions
- **Contains**: 
  - User intent interfaces
  - Business context types
  - File configuration types
  - Project structure interfaces
  - OpenAI request parameters
- **Benefits**: Type safety and better IDE support

#### 3. `user-intent-analyzer.ts`
- **Purpose**: Analyze user intent from conversation data
- **Contains**:
  - `UserIntentAnalyzer` class with static methods
  - Visual style analysis
  - Color scheme detection
  - Feature and page extraction
  - Business context analysis
- **Benefits**: Separated concerns for intent analysis

#### 4. `openai-service.ts`
- **Purpose**: Handle all OpenAI API interactions
- **Contains**:
  - `OpenAIService` class with retry logic
  - Request timeout handling
  - Response parsing and cleaning
  - Temperature management
- **Benefits**: Centralized API handling with error recovery

#### 5. `project-structure-generator.ts`
- **Purpose**: Generate high-level project structure
- **Contains**:
  - `ProjectStructureGenerator` class
  - Project name and description extraction
  - Feature and page detection
  - Business-specific component generation
  - Fallback structure creation
- **Benefits**: Focused on structure generation logic

#### 6. `file-generator.ts`
- **Purpose**: Generate individual files
- **Contains**:
  - `FileGenerator` class
  - Essential file generation
  - Template-based fallbacks
  - Import path validation
  - React structure enforcement
- **Benefits**: Dedicated file generation with proper React patterns

#### 7. `index.ts`
- **Purpose**: Main entry point and orchestration
- **Contains**:
  - `SiteGeneratorService` class
  - Main generation workflow
  - Timeout handling
  - Re-exports for convenience
- **Benefits**: Clean API and proper orchestration

## Benefits of Refactoring

### 1. **Separation of Concerns**
- Each module has a single, well-defined responsibility
- Easier to understand and maintain
- Reduced cognitive load when working on specific features

### 2. **Maintainability**
- Smaller files are easier to navigate and modify
- Changes to one aspect don't affect others
- Better code organization and structure

### 3. **Reusability**
- Individual modules can be imported and used independently
- Easier to test individual components
- Better modularity for future extensions

### 4. **Readability**
- Clear file names indicate purpose
- Logical grouping of related functionality
- Easier onboarding for new developers

### 5. **Type Safety**
- Centralized type definitions
- Better IDE support and autocomplete
- Reduced runtime errors

## Usage

### Basic Usage
```typescript
import { SiteGeneratorService } from './site-generator';

const result = await SiteGeneratorService.generateSite(finalJson, options);
```

### Advanced Usage
```typescript
import { 
  UserIntentAnalyzer, 
  ProjectStructureGenerator, 
  FileGenerator 
} from './site-generator';

// Analyze user intent
const userIntent = UserIntentAnalyzer.analyzeUserIntent(finalJson);

// Generate project structure
const structure = await ProjectStructureGenerator.createProjectStructure(finalJson, options);

// Generate files
const files = await FileGenerator.generateEssentialFilesOnly(finalJson, structure, options);
```

## Migration Guide

### From Old Monolithic File
The original `site-generator.ts` file now serves as a backward-compatible entry point:

```typescript
// Old way (still works)
import { SiteGeneratorService } from './site-generator';

// New way (recommended)
import { SiteGeneratorService } from './site-generator/index';
```

### Breaking Changes
- No breaking changes in the public API
- All existing imports continue to work
- Internal implementation is now modular

## Development Guidelines

### Adding New Features
1. **Identify the appropriate module** for your feature
2. **Add types** to `types.ts` if needed
3. **Implement the feature** in the relevant module
4. **Update exports** in `index.ts` if necessary
5. **Add tests** for the new functionality

### Modifying Existing Features
1. **Locate the relevant module** using the architecture guide above
2. **Make changes** within the module's scope
3. **Update types** if the interface changes
4. **Test** the changes thoroughly

### Testing
- Each module can be tested independently
- Mock dependencies between modules
- Focus on unit tests for individual modules
- Integration tests for the main service

## File Structure
```
site-generator/
├── config.ts                    # Configuration management
├── types.ts                     # TypeScript type definitions
├── user-intent-analyzer.ts      # User intent analysis
├── openai-service.ts           # OpenAI API handling
├── project-structure-generator.ts # Project structure generation
├── file-generator.ts           # File generation
├── index.ts                    # Main entry point
└── README.md                   # This file
```

## Future Enhancements

### Planned Improvements
1. **Plugin System**: Allow custom file generators
2. **Template Engine**: More flexible template system
3. **Validation**: Enhanced input validation
4. **Caching**: Response caching for better performance
5. **Monitoring**: Better logging and metrics

### Extension Points
- Custom user intent analyzers
- Alternative AI providers
- Custom file generators
- Template customization
- Validation rules

---

*This refactoring improves code organization, maintainability, and developer experience while preserving all existing functionality.*

