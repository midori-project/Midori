/**
 * Orchestrator Core Runner Tests
 * Comprehensive test suite for testing orchestrator in isolation
 * 
 * การทดสอบครอบคลุม:
 * 🧪 Unit Tests: ทดสอบฟังก์ชันแต่ละส่วนแยกกัน
 * 🔄 Integration Tests: ทดสอบการทำงานแบบ end-to-end
 * ⚡ Performance Tests: ทดสอบประสิทธิภาพและความเร็ว
 */

import { run, CommandType, TaskType } from '../runners/run';
import type { Command, Task, ExecutionPlan, OrchestratorResult } from '../runners/run';

// ============================================================================
// TEST DATA & MOCKS
// ============================================================================

const mockCommand: Command = {
  commandId: crypto.randomUUID(),
  commandType: CommandType.CREATE_COMPONENT,
  payload: {
    componentName: 'UserCard',
    styling: 'tailwind'
  },
  priority: 'medium',
  metadata: {
    userId: 'user123',
    projectId: 'project456',
    timestamp: new Date().toISOString()
  }
};

const mockComplexCommand: Command = {
  commandId: crypto.randomUUID(),
  commandType: CommandType.CREATE_AUTH_SYSTEM,
  payload: {
    authMethod: 'jwt',
    database: 'postgresql'
  },
  priority: 'high',
  metadata: {
    timestamp: new Date().toISOString()
  }
};

const mockFullStackCommand: Command = {
  commandId: crypto.randomUUID(),
  commandType: CommandType.CREATE_COMPLETE_WEBSITE,
  payload: {
    websiteType: 'e-commerce',
    features: ['auth', 'payment', 'inventory']
  },
  priority: 'critical',
  metadata: {
    timestamp: new Date().toISOString()
  }
};

// ============================================================================
// TEST HELPER FUNCTIONS
// ============================================================================

function runTest(testName: string, testFn: () => Promise<void> | void): void {
  console.log(`\n🧪 Testing: ${testName}`);
  const startTime = performance.now();
  
  try {
    const result = testFn();
    if (result instanceof Promise) {
      result
        .then(() => {
          const duration = (performance.now() - startTime).toFixed(2);
          console.log(`✅ PASS (${duration}ms): ${testName}`);
        })
        .catch((error) => {
          const duration = (performance.now() - startTime).toFixed(2);
          console.error(`❌ FAIL (${duration}ms): ${testName}`);
          console.error(`   Error: ${error.message}`);
        });
    } else {
      const duration = (performance.now() - startTime).toFixed(2);
      console.log(`✅ PASS (${duration}ms): ${testName}`);
    }
  } catch (error) {
    const duration = (performance.now() - startTime).toFixed(2);
    console.error(`❌ FAIL (${duration}ms): ${testName}`);
    console.error(`   Error: ${(error as Error).message}`);
  }
}

function assertEqual(actual: any, expected: any, message: string = ''): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Assertion failed${message ? ': ' + message : ''}\n  Expected: ${JSON.stringify(expected)}\n  Actual: ${JSON.stringify(actual)}`);
  }
}

function assertTrue(condition: boolean, message: string = ''): void {
  if (!condition) {
    throw new Error(`Assertion failed${message ? ': ' + message : ''}`);
  }
}

function assertGreaterThan(actual: number, expected: number, message: string = ''): void {
  if (actual <= expected) {
    throw new Error(`Assertion failed${message ? ': ' + message : ''}\n  Expected ${actual} > ${expected}`);
  }
}

// ============================================================================
// UNIT TESTS
// ============================================================================

async function testValidCommandProcessing(): Promise<void> {
  const result = await run(mockCommand);
  
  assertTrue(result.success, 'Result should be successful');
  assertTrue(result.plan !== undefined, 'Plan should be defined');
  assertEqual(result.plan!.commandId, mockCommand.commandId, 'Command IDs should match');
  assertTrue(result.plan!.tasks.length > 0, 'Should have at least one task');
  assertGreaterThan(result.plan!.estimatedTotalDuration, 0, 'Duration should be positive');
}

async function testInvalidCommandValidation(): Promise<void> {
  const invalidCommand = {
    commandId: 'invalid-uuid',
    commandType: 'invalid_type',
    payload: {},
    priority: 'invalid_priority'
  };
  
  const result = await run(invalidCommand);
  
  assertTrue(!result.success, 'Invalid command should fail');
  assertTrue(result.error !== undefined, 'Error message should be provided');
  assertTrue(result.plan === undefined, 'Plan should not be created for invalid command');
}

async function testSimpleCommandClassification(): Promise<void> {
  const result = await run(mockCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertEqual(result.plan!.metadata.complexity, 'simple', 'CREATE_COMPONENT should be simple');
  assertEqual(result.plan!.metadata.requiredAgents, [TaskType.FRONTEND], 'Should only require frontend agent');
}

async function testMediumComplexityCommand(): Promise<void> {
  const result = await run(mockComplexCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertEqual(result.plan!.metadata.complexity, 'medium', 'CREATE_AUTH_SYSTEM should be medium complexity');
  assertTrue(
    result.plan!.metadata.requiredAgents.includes(TaskType.FRONTEND) &&
    result.plan!.metadata.requiredAgents.includes(TaskType.BACKEND),
    'Should require both frontend and backend agents'
  );
}

async function testComplexCommandClassification(): Promise<void> {
  const result = await run(mockFullStackCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertEqual(result.plan!.metadata.complexity, 'complex', 'CREATE_COMPLETE_WEBSITE should be complex');
  assertEqual(result.plan!.metadata.requiredAgents.length, 3, 'Should require all three agents');
}

async function testTaskDependencies(): Promise<void> {
  const result = await run(mockComplexCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  
  const tasks = result.plan!.tasks;
  const frontendTask = tasks.find(task => task.agent === TaskType.FRONTEND);
  const backendTask = tasks.find(task => task.agent === TaskType.BACKEND);
  
  assertTrue(frontendTask !== undefined, 'Should have frontend task');
  assertTrue(backendTask !== undefined, 'Should have backend task');
  
  // Frontend task should depend on backend task for auth system
  assertTrue(
    frontendTask!.dependencies.includes(backendTask!.taskId),
    'Frontend auth forms should depend on backend auth API'
  );
}

async function testExecutionStages(): Promise<void> {
  const result = await run(mockComplexCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertTrue(result.plan!.executionStages.length > 0, 'Should have execution stages');
  
  const stages = result.plan!.executionStages;
  
  // First stage should have backend task (no dependencies)
  assertTrue(stages[0].parallelTasks.length > 0, 'First stage should have tasks');
  
  // Last stage should have frontend task (depends on backend)
  if (stages.length > 1) {
    assertTrue(stages[stages.length - 1].parallelTasks.length > 0, 'Last stage should have tasks');
  }
}

async function testStageDurationCalculation(): Promise<void> {
  const result = await run(mockComplexCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  
  const stages = result.plan!.executionStages;
  const calculatedDuration = stages.reduce((total, stage) => total + stage.estimatedDuration, 0);
  
  assertEqual(
    result.plan!.estimatedTotalDuration,
    calculatedDuration,
    'Total duration should equal sum of stage durations'
  );
}

async function testQualityGatesAssignment(): Promise<void> {
  const result = await run(mockFullStackCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertTrue(result.plan!.qualityGates.length > 0, 'Should have quality gates');
  
  const gates = result.plan!.qualityGates;
  const hasSecurityScan = gates.some(gate => gate.gate === 'security_scan');
  const hasAccessibility = gates.some(gate => gate.gate === 'accessibility');
  
  assertTrue(hasSecurityScan, 'Should have security scan for deployment');
  assertTrue(hasAccessibility, 'Should have accessibility check for frontend tasks');
}

async function testResourceCalculation(): Promise<void> {
  const result = await run(mockComplexCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  
  const resources = result.plan!.totalResourceRequirements;
  
  assertGreaterThan(resources.maxParallelTasks, 0, 'Should have positive max parallel tasks');
  assertGreaterThan(resources.totalCpuUnits, 0, 'Should have positive CPU units');
  assertGreaterThan(resources.totalMemoryUnits, 0, 'Should have positive memory units');
}

async function testMetadataGeneration(): Promise<void> {
  const result = await run(mockCommand);
  
  assertTrue(result.success, 'Command should be processed successfully');
  assertTrue(result.metadata.processingTimeMs > 0, 'Should have positive processing time');
  assertTrue(Array.isArray(result.metadata.validationErrors), 'Should have validation errors array');
  assertTrue(Array.isArray(result.warnings), 'Should have warnings array');
}

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

async function testFullOrchestrationWorkflow(): Promise<void> {
  console.log('\n📋 Testing Full Orchestration Workflow:');
  
  const commands = [
    { name: 'Simple Component', command: mockCommand },
    { name: 'Auth System', command: mockComplexCommand },
    { name: 'Complete Website', command: mockFullStackCommand }
  ];
  
  for (const { name, command } of commands) {
    console.log(`\n  🔄 Processing: ${name}`);
    const result = await run(command);
    
    assertTrue(result.success, `${name} should be processed successfully`);
    console.log(`    ✅ Plan ID: ${result.plan!.planId}`);
    console.log(`    📊 Complexity: ${result.plan!.metadata.complexity}`);
    console.log(`    🔧 Agents: ${result.plan!.metadata.requiredAgents.join(', ')}`);
    console.log(`    📋 Tasks: ${result.plan!.tasks.length}`);
    console.log(`    🏗️ Stages: ${result.plan!.executionStages.length}`);
    console.log(`    ⏱️ Duration: ${result.plan!.estimatedTotalDuration} minutes`);
    console.log(`    🛡️ Quality Gates: ${result.plan!.qualityGates.length}`);
    console.log(`    ⚡ Processing Time: ${result.metadata.processingTimeMs.toFixed(2)}ms`);
  }
}

async function testPerformanceBenchmark(): Promise<void> {
  console.log('\n⚡ Performance Benchmark:');
  
  const iterations = 100;
  const results: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await run(mockCommand);
    const duration = performance.now() - startTime;
    results.push(duration);
  }
  
  const avgTime = results.reduce((sum, time) => sum + time, 0) / iterations;
  const minTime = Math.min(...results);
  const maxTime = Math.max(...results);
  
  console.log(`  📊 ${iterations} iterations completed`);
  console.log(`  ⚡ Average: ${avgTime.toFixed(2)}ms`);
  console.log(`  🚀 Fastest: ${minTime.toFixed(2)}ms`);
  console.log(`  🐌 Slowest: ${maxTime.toFixed(2)}ms`);
  
  assertTrue(avgTime < 100, 'Average processing time should be under 100ms');
}

// ============================================================================
// TEST RUNNER
// ============================================================================

export async function runAllTests(): Promise<void> {
  console.log('🧪 Starting Orchestrator Tests...\n');
  console.log('=' .repeat(60));
  
  // Unit Tests
  console.log('\n📋 UNIT TESTS');
  console.log('-'.repeat(40));
  
  runTest('Valid Command Processing', testValidCommandProcessing);
  runTest('Invalid Command Validation', testInvalidCommandValidation);
  runTest('Simple Command Classification', testSimpleCommandClassification);
  runTest('Medium Complexity Command', testMediumComplexityCommand);
  runTest('Complex Command Classification', testComplexCommandClassification);
  runTest('Task Dependencies', testTaskDependencies);
  runTest('Execution Stages', testExecutionStages);
  runTest('Stage Duration Calculation', testStageDurationCalculation);
  runTest('Quality Gates Assignment', testQualityGatesAssignment);
  runTest('Resource Calculation', testResourceCalculation);
  runTest('Metadata Generation', testMetadataGeneration);
  
  // Integration Tests
  console.log('\n📋 INTEGRATION TESTS');
  console.log('-'.repeat(40));
  
  await testFullOrchestrationWorkflow();
  await testPerformanceBenchmark();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 All tests completed!');
}

// ============================================================================
// QUICK TEST FUNCTION FOR DEVELOPMENT
// ============================================================================

export async function quickTest(): Promise<void> {
  console.log('🚀 Quick Orchestrator Test\n');
  
  try {
    const result = await run(mockCommand);
    
    if (result.success) {
      console.log('✅ Orchestrator is working!');
      console.log(`📋 Plan created with ${result.plan!.tasks.length} tasks`);
      console.log(`⏱️ Estimated duration: ${result.plan!.estimatedTotalDuration} minutes`);
      console.log(`🔧 Required agents: ${result.plan!.metadata.requiredAgents.join(', ')}`);
    } else {
      console.log('❌ Orchestrator failed:');
      console.log(`   Error: ${result.error}`);
    }
  } catch (error) {
    console.error('💥 Test failed with exception:');
    console.error(error);
  }
}

// Auto-run quick test if this file is executed directly (CommonJS)
if (require.main === module) {
  quickTest();
}