/**
 * SSOT Test Runner Script
 * Run all SSOT tests and generate comprehensive report
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passed: number;
  failed: number;
  skipped: number;
}

class SSOTTestRunner {
  private results: TestSuite[] = [];
  private startTime: number = 0;

  /**
   * Run all SSOT tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting SSOT Test Suite');
    this.startTime = Date.now();

    const testSuites = [
      'src/tests/ssot.test.ts',
      'src/tests/integration/ssot-integration.test.ts'
    ];

    for (const testSuite of testSuites) {
      await this.runTestSuite(testSuite);
    }

    this.generateReport();
  }

  /**
   * Run individual test suite
   */
  private async runTestSuite(testFile: string): Promise<void> {
    console.log(`\n📋 Running test suite: ${testFile}`);
    
    const suiteStartTime = Date.now();
    const suite: TestSuite = {
      name: testFile,
      tests: [],
      totalDuration: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };

    try {
      // Run Jest test
      const command = `npx jest ${testFile} --verbose --json`;
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe'
      });

      // Parse Jest JSON output
      const jestResult = JSON.parse(output);
      
      // Process test results
      for (const testResult of jestResult.testResults) {
        for (const assertionResult of testResult.assertionResults) {
          const result: TestResult = {
            testName: assertionResult.title,
            status: assertionResult.status === 'passed' ? 'passed' : 
                   assertionResult.status === 'failed' ? 'failed' : 'skipped',
            duration: assertionResult.duration || 0,
            error: assertionResult.failureMessages?.[0]
          };

          suite.tests.push(result);

          if (result.status === 'passed') {
            suite.passed++;
          } else if (result.status === 'failed') {
            suite.failed++;
          } else {
            suite.skipped++;
          }
        }
      }

      suite.totalDuration = Date.now() - suiteStartTime;
      console.log(`✅ Test suite completed: ${suite.passed} passed, ${suite.failed} failed, ${suite.skipped} skipped`);

    } catch (error) {
      console.error(`❌ Test suite failed: ${error}`);
      suite.totalDuration = Date.now() - suiteStartTime;
      suite.failed = 1;
      suite.tests.push({
        testName: 'Test Suite Execution',
        status: 'failed',
        duration: suite.totalDuration,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    this.results.push(suite);
  }

  /**
   * Generate comprehensive test report
   */
  private generateReport(): void {
    const totalDuration = Date.now() - this.startTime;
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const totalSkipped = this.results.reduce((sum, suite) => sum + suite.skipped, 0);

    const report = {
      summary: {
        totalSuites: this.results.length,
        totalTests,
        totalPassed,
        totalFailed,
        totalSkipped,
        totalDuration,
        successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
      },
      suites: this.results,
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    // Save JSON report
    const reportPath = join(process.cwd(), 'test-results', 'ssot-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Generate HTML report
    this.generateHTMLReport(report);

    // Print summary
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Suites: ${report.summary.totalSuites}`);
    console.log(`Total Tests: ${report.summary.totalTests}`);
    console.log(`Passed: ${report.summary.totalPassed}`);
    console.log(`Failed: ${report.summary.totalFailed}`);
    console.log(`Skipped: ${report.summary.totalSkipped}`);
    console.log(`Success Rate: ${report.summary.successRate.toFixed(2)}%`);
    console.log(`Total Duration: ${report.summary.totalDuration}ms`);
    console.log(`\n📄 Reports saved to: ${reportPath}`);

    // Print failed tests
    if (totalFailed > 0) {
      console.log('\n❌ Failed Tests:');
      for (const suite of this.results) {
        for (const test of suite.tests) {
          if (test.status === 'failed') {
            console.log(`  - ${suite.name}: ${test.testName}`);
            if (test.error) {
              console.log(`    Error: ${test.error}`);
            }
          }
        }
      }
    }
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(report: any): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>SSOT Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .suite { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 5px; }
        .suite-header { background: #f9f9f9; padding: 10px; font-weight: bold; }
        .test { padding: 5px 10px; border-bottom: 1px solid #eee; }
        .test.passed { background: #d4edda; }
        .test.failed { background: #f8d7da; }
        .test.skipped { background: #fff3cd; }
        .error { color: #721c24; font-size: 12px; margin-top: 5px; }
        .stats { display: flex; gap: 20px; }
        .stat { text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <h1>SSOT Test Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="stats">
            <div class="stat">
                <div class="stat-value">${report.summary.totalTests}</div>
                <div class="stat-label">Total Tests</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #28a745;">${report.summary.totalPassed}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #dc3545;">${report.summary.totalFailed}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: #ffc107;">${report.summary.totalSkipped}</div>
                <div class="stat-label">Skipped</div>
            </div>
            <div class="stat">
                <div class="stat-value">${report.summary.successRate.toFixed(2)}%</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>
        <p><strong>Total Duration:</strong> ${report.summary.totalDuration}ms</p>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
    </div>

    ${report.suites.map((suite: any) => `
        <div class="suite">
            <div class="suite-header">
                ${suite.name} (${suite.passed} passed, ${suite.failed} failed, ${suite.skipped} skipped)
            </div>
            ${suite.tests.map((test: any) => `
                <div class="test ${test.status}">
                    <strong>${test.testName}</strong>
                    <span style="float: right;">${test.duration}ms</span>
                    ${test.error ? `<div class="error">${test.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;

    const htmlPath = join(process.cwd(), 'test-results', 'ssot-test-report.html');
    writeFileSync(htmlPath, html);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new SSOTTestRunner();
  runner.runAllTests().catch(console.error);
}

export { SSOTTestRunner };
