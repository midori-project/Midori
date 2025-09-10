#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

/**
 * Validate Midori AI Agent Configurations
 * 
 * ตรวจสอบ:
 * 1. JSON Schemas ใน src/ai/config/schemas/
 * 2. Agent configs ใน src/ai/config/agents/
 * 3. Policy configs ใน src/ai/config/policies/
 * 4. Schema references และ dependencies
 */

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const AI_CONFIG_DIR = path.join(__dirname, '..', 'src', 'ai', 'config');
const SCHEMAS_DIR = path.join(AI_CONFIG_DIR, 'schemas');
const AGENTS_DIR = path.join(AI_CONFIG_DIR, 'agents');
const POLICIES_DIR = path.join(AI_CONFIG_DIR, 'policies');

async function loadJson(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load ${filePath}: ${error.message}`);
  }
}

async function validateSchemas() {
  console.log('🔍 Validating JSON Schemas...');
  
  // โหลด shared definitions ก่อน
  const sharedDefsPath = path.join(SCHEMAS_DIR, 'shared', 'defs.json');
  try {
    const sharedDefs = await loadJson(sharedDefsPath);
    ajv.addSchema(sharedDefs, 'https://midori.dev/schemas/shared/defs.json');
  } catch (error) {
    console.warn('⚠️  Could not load shared definitions:', error.message);
  }
  
  const schemaFiles = await fs.readdir(SCHEMAS_DIR, { withFileTypes: true });
  const results = [];
  
  for (const file of schemaFiles) {
    if (file.isFile() && file.name.endsWith('.schema.json')) {
      const filePath = path.join(SCHEMAS_DIR, file.name);
      
      try {
        const schema = await loadJson(filePath);
        
        // ตรวจสอบ schema structure
        if (!schema.$schema) {
          results.push({ file: file.name, status: 'warning', message: 'Missing $schema property' });
        }
        
        if (!schema.$id) {
          results.push({ file: file.name, status: 'warning', message: 'Missing $id property' });
        }
        
        // ตรวจสอบ envelope reference
        if (schema.properties && schema.properties.envelope) {
          const envelopeRef = schema.properties.envelope.$ref;
          if (envelopeRef && !envelopeRef.includes('#/definitions/envelope')) {
            results.push({ 
              file: file.name, 
              status: 'error', 
              message: `Invalid envelope reference: ${envelopeRef}` 
            });
          }
        }
        
        // พยายาม compile schema
        try {
          ajv.compile(schema);
          results.push({ file: file.name, status: 'success', message: 'Schema compiled successfully' });
        } catch (compileError) {
          results.push({ 
            file: file.name, 
            status: 'error', 
            message: `Schema compilation failed: ${compileError.message}` 
          });
        }
        
      } catch (error) {
        results.push({ file: file.name, status: 'error', message: error.message });
      }
    }
  }
  
  return results;
}

async function validateAgentConfigs() {
  console.log('🤖 Validating Agent Configurations...');
  
  const agentFiles = await fs.readdir(AGENTS_DIR, { withFileTypes: true });
  const results = [];
  
  for (const file of agentFiles) {
    if (file.isFile() && file.name.endsWith('.json')) {
      const filePath = path.join(AGENTS_DIR, file.name);
      
      try {
        const config = await loadJson(filePath);
        
        // Skip profiles.json ซึ่งมีโครงสร้างต่าง
        if (file.name === 'profiles.json') {
          // ตรวจสอบ profiles structure
          if (config.dev && config.prod) {
            results.push({ file: file.name, status: 'success', message: 'Profiles config validated' });
          } else {
            results.push({ file: file.name, status: 'error', message: 'Missing dev or prod profiles' });
          }
          continue;
        }
        
        // ตรวจสอบ required fields สำหรับ agent configs
        const requiredFields = ['model', 'temperature', 'schemas', 'policies'];
        for (const field of requiredFields) {
          if (!config[field]) {
            results.push({ 
              file: file.name, 
              status: 'error', 
              message: `Missing required field: ${field}` 
            });
          }
        }
        
        // ตรวจสอบ schema paths
        if (config.schemas) {
          for (const [schemaName, schemaPath] of Object.entries(config.schemas)) {
            const fullPath = path.resolve(AGENTS_DIR, schemaPath);
            try {
              await fs.access(fullPath);
            } catch {
              results.push({ 
                file: file.name, 
                status: 'error', 
                message: `Schema file not found: ${schemaPath}` 
              });
            }
          }
        }
        
        // ตรวจสอบ policy paths
        if (config.policies) {
          for (const [policyName, policyPath] of Object.entries(config.policies)) {
            const fullPath = path.resolve(AGENTS_DIR, policyPath);
            try {
              await fs.access(fullPath);
            } catch {
              results.push({ 
                file: file.name, 
                status: 'error', 
                message: `Policy file not found: ${policyPath}` 
              });
            }
          }
        }
        
        results.push({ file: file.name, status: 'success', message: 'Agent config validated' });
        
      } catch (error) {
        results.push({ file: file.name, status: 'error', message: error.message });
      }
    }
  }
  
  return results;
}

async function validatePolicies() {
  console.log('📋 Validating Policy Configurations...');
  
  const policyFiles = await fs.readdir(POLICIES_DIR, { withFileTypes: true });
  const results = [];
  
  for (const file of policyFiles) {
    if (file.isFile() && file.name.endsWith('.json')) {
      const filePath = path.join(POLICIES_DIR, file.name);
      
      try {
        const policy = await loadJson(filePath);
        
        // Basic JSON validation
        results.push({ file: file.name, status: 'success', message: 'Policy JSON is valid' });
        
      } catch (error) {
        results.push({ file: file.name, status: 'error', message: error.message });
      }
    }
  }
  
  return results;
}

function printResults(category, results) {
  console.log(`\n📊 ${category} Results:`);
  console.log('─'.repeat(50));
  
  const grouped = results.reduce((acc, result) => {
    acc[result.status] = acc[result.status] || [];
    acc[result.status].push(result);
    return acc;
  }, {});
  
  ['success', 'warning', 'error'].forEach(status => {
    if (grouped[status]) {
      const icon = status === 'success' ? '✅' : status === 'warning' ? '⚠️' : '❌';
      console.log(`\n${icon} ${status.toUpperCase()} (${grouped[status].length}):`);
      
      grouped[status].forEach(result => {
        console.log(`  • ${result.file}: ${result.message}`);
      });
    }
  });
}

async function main() {
  console.log('🚀 Starting Midori AI Configuration Validation...\n');
  
  try {
    // ตรวจสอบ directories
    for (const dir of [SCHEMAS_DIR, AGENTS_DIR, POLICIES_DIR]) {
      try {
        await fs.access(dir);
      } catch {
        console.error(`❌ Directory not found: ${dir}`);
        process.exit(1);
      }
    }
    
    // Run validations
    const schemaResults = await validateSchemas();
    const agentResults = await validateAgentConfigs();
    const policyResults = await validatePolicies();
    
    // Print results
    printResults('Schema Validation', schemaResults);
    printResults('Agent Configuration', agentResults);
    printResults('Policy Configuration', policyResults);
    
    // Summary
    const allResults = [...schemaResults, ...agentResults, ...policyResults];
    const errorCount = allResults.filter(r => r.status === 'error').length;
    const warningCount = allResults.filter(r => r.status === 'warning').length;
    
    console.log('\n🎯 Summary:');
    console.log('─'.repeat(30));
    console.log(`Total files checked: ${allResults.length}`);
    console.log(`✅ Success: ${allResults.filter(r => r.status === 'success').length}`);
    console.log(`⚠️  Warnings: ${warningCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n❌ Validation failed with errors!');
      process.exit(1);
    } else if (warningCount > 0) {
      console.log('\n⚠️  Validation completed with warnings.');
      process.exit(0);
    } else {
      console.log('\n✅ All validations passed!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('❌ Validation script failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSchemas, validateAgentConfigs, validatePolicies };
