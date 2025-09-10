#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

/**
 * แก้ไข path references ใน agent config files
 */

const AGENTS_DIR = path.join(__dirname, '..', 'src', 'ai', 'config', 'agents');

async function fixAgentConfig(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const config = JSON.parse(content);
  
  // Skip profiles.json ซึ่งมีโครงสร้างต่าง
  if (path.basename(filePath) === 'profiles.json') {
    return false;
  }
  
  // แก้ไข model name
  if (config.model && config.model.includes('gpt-5')) {
    config.model = 'gpt-4o-mini';
  }
  
  // แก้ไข schema paths
  if (config.schemas) {
    for (const [key, schemaPath] of Object.entries(config.schemas)) {
      if (schemaPath.startsWith('./config/schemas/')) {
        config.schemas[key] = schemaPath.replace('./config/schemas/', '../schemas/');
      }
    }
  }
  
  // แก้ไข policy paths
  if (config.policies) {
    for (const [key, policyPath] of Object.entries(config.policies)) {
      if (policyPath.startsWith('./config/policies/')) {
        config.policies[key] = policyPath.replace('./config/policies/', '../policies/');
      }
    }
  }
  
  await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n');
  return true;
}

async function main() {
  console.log('🔧 Fixing AI agent configuration paths...');
  
  const files = await fs.readdir(AGENTS_DIR);
  let fixed = 0;
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(AGENTS_DIR, file);
      
      try {
        const wasFixed = await fixAgentConfig(filePath);
        if (wasFixed) {
          console.log(`✅ Fixed: ${file}`);
          fixed++;
        } else {
          console.log(`⏭️  Skipped: ${file}`);
        }
      } catch (error) {
        console.error(`❌ Error fixing ${file}:`, error.message);
      }
    }
  }
  
  console.log(`\n🎉 Fixed ${fixed} agent configuration files!`);
}

if (require.main === module) {
  main().catch(console.error);
}
