#!/usr/bin/env node

/**
 * Diagnostic Flow Verification Test
 *
 * Verifies that the diagnostic scoring system is working correctly:
 * 1. Scores are NOT hardcoded to 5
 * 2. Data accumulates across diagnostic responses
 * 3. Final report contains varied scores
 *
 * Run with: node test-diagnostic-flow.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, level = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('Z')[0];
  const prefix = `[${timestamp}]`;

  switch (level) {
    case 'success':
      console.log(`${colors.green}${prefix} ✅ ${message}${colors.reset}`);
      break;
    case 'error':
      console.log(`${colors.red}${prefix} ❌ ${message}${colors.reset}`);
      break;
    case 'warning':
      console.log(`${colors.yellow}${prefix} ⚠️  ${message}${colors.reset}`);
      break;
    case 'info':
      console.log(`${colors.blue}${prefix} ℹ️  ${message}${colors.reset}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

async function testDiagnosticFlow() {
  log('Starting Diagnostic Flow Test...', 'info');
  log(`API Base: ${API_BASE}`, 'info');

  const conversationHistory = [];
  let diagnosticState = {
    isActive: false,
    questionsAsked: 0,
    collectedData: {}
  };

  const testAnswers = [
    'start',                                    // Q1: Turnover
    '£250,000 annually, doing fairly well',    // Q2: Projects
    'Running 3-4 projects at once',             // Q3: Reliability
    'Major issue - subbies constantly no-showing',
    'Very difficult, takes weeks to find people',
    '15+ hours dealing with labour firefighting',
    'Team morale is low',                       // Q7: Culture
  ];

  try {
    // Test 1: Start diagnostic
    log('Test 1: Starting diagnostic...', 'info');

    for (let i = 0; i < testAnswers.length; i++) {
      const userMessage = testAnswers[i];
      log(`Sending message: "${userMessage.substring(0, 50)}..."`, 'info');

      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Update diagnostic state when starting
      if (i === 0 && userMessage.toLowerCase() === 'start') {
        diagnosticState.isActive = true;
      }

      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
          diagnosticState
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage = data.message;

      conversationHistory.push({
        role: 'assistant',
        content: aiMessage
      });

      // Check for diagnostic data
      if (data.diagnosticUpdate) {
        diagnosticState = {
          isActive: true,
          questionsAsked: data.diagnosticUpdate.questionsAsked,
          collectedData: {
            ...diagnosticState.collectedData,
            ...data.diagnosticUpdate.collectedData
          }
        };

        // Verify scores aren't hardcoded to 5
        const collectedData = data.diagnosticUpdate.collectedData;
        Object.entries(collectedData).forEach(([key, value]) => {
          if (value?.score === undefined) {
            log(`Q${i + 1}: ${key} - no score extracted`, 'warning');
          } else if (value.score === 5) {
            log(`Q${i + 1}: ${key} - score: ${value.score} ⚠️  (might be default)`, 'warning');
          } else {
            log(`Q${i + 1}: ${key} - score: ${value.score} ✓`, 'success');
          }
        });
      }

      // Check for completion
      if (data.isComplete) {
        log('Diagnostic completed!', 'success');
        break;
      }
    }

    // Test 2: Verify accumulated data has varied scores
    log('\nTest 2: Verifying score variation...', 'info');

    const collectedData = diagnosticState.collectedData;
    const scores = Object.entries(collectedData)
      .filter(([, value]) => value?.score !== undefined)
      .map(([key, value]) => ({ key, score: value.score }));

    if (scores.length === 0) {
      log('❌ CRITICAL: No scores were collected!', 'error');
      return false;
    }

    log(`Collected ${scores.length} scores:`, 'info');
    scores.forEach(({ key, score }) => {
      console.log(`  ${key}: ${score}`);
    });

    // Check for score variation
    const scoreValues = scores.map(s => s.score);
    const minScore = Math.min(...scoreValues);
    const maxScore = Math.max(...scoreValues);
    const allSameScore = minScore === maxScore;

    if (allSameScore && minScore === 5) {
      log(`❌ FAILED: All scores are hardcoded to 5 (min=${minScore}, max=${maxScore})`, 'error');
      return false;
    } else if (allSameScore) {
      log(`⚠️  WARNING: All scores are the same (${minScore}), but not hardcoded to 5`, 'warning');
    } else {
      log(`✅ PASS: Scores vary properly (min=${minScore}, max=${maxScore})`, 'success');
    }

    // Test 3: Simulate score calculation
    log('\nTest 3: Simulating score calculation...', 'info');

    const calculateScores = (data) => {
      const scores = {
        tradingCapacity: data.turnover?.score || 5,
        reliability: data.reliability?.score || 5,
        recruitment: data.recruitment?.score || 5,
        systems: data.systems?.score || 5,
        profitability: data.timeSpent?.score || 5,
        onboarding: data.projects?.score || 5,
        culture: data.culture?.score || 5,
      };

      const values = Object.values(scores);
      const average = values.reduce((sum, s) => sum + s, 0) / values.length;
      const overallScore = Math.round(average * 10);

      return { scores, overallScore };
    };

    const { scores: calculated, overallScore } = calculateScores(collectedData);

    log(`Overall Score: ${overallScore}/100`, 'info');
    Object.entries(calculated).forEach(([key, score]) => {
      console.log(`  ${key}: ${score}`);
    });

    if (overallScore === 50) {
      log('⚠️  All section scores appear to be 5 (hardcoded)', 'warning');
    }

    // Summary
    log('\n' + '='.repeat(50), 'info');
    log('Diagnostic Flow Test Summary', 'bold');
    log('='.repeat(50), 'info');

    const testsPassed = !allSameScore || minScore !== 5;
    if (testsPassed) {
      log('✅ Diagnostic flow is working correctly!', 'success');
      log('Scores are dynamically generated from user answers.', 'success');
      return true;
    } else {
      log('❌ Diagnostic flow has issues!', 'error');
      log('Scores appear to be hardcoded to 5.', 'error');
      return false;
    }

  } catch (error) {
    log(`Test failed with error: ${error.message}`, 'error');
    if (error.message.includes('ECONNREFUSED')) {
      log('Make sure the server is running: npm run dev', 'warning');
    }
    return false;
  }
}

// Run the test
testDiagnosticFlow().then(success => {
  process.exit(success ? 0 : 1);
});
