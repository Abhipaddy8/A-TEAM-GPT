/**
 * End-to-End Test for A-Team Trades Pipeline Diagnostic
 * Tests the complete flow: diagnostic -> email with PDF -> SMS
 */

const API_BASE = 'http://localhost:5000';

// Test data
const testData = {
  email: 'abhipaddy8@gmail.com',
  firstName: 'Abhishek',
  lastName: 'Padmanabhan',
  phone: '+919591205303',
  sessionId: `test-${Date.now()}`,
  diagnosticData: {
    email: 'abhipaddy8@gmail.com',
    builderName: 'Abhishek Padmanabhan',
    overallScore: 65,
    scoreColor: 'amber',
    sectionScores: {
      tradingCapacity: {
        score: 7,
        color: 'green',
        commentary: 'Running 8+ projects - strong capacity'
      },
      reliability: {
        score: 5,
        color: 'amber',
        commentary: '30-70% reliability - some issues'
      },
      recruitment: {
        score: 5,
        color: 'amber',
        commentary: 'Sometimes struggling to find skilled labour'
      },
      systems: {
        score: 6,
        color: 'amber',
        commentary: 'Using basic spreadsheets for management'
      },
      profitability: {
        score: 8,
        color: 'green',
        commentary: 'Spending less than 5 hours per week on labour issues'
      },
      onboarding: {
        score: 5,
        color: 'amber',
        commentary: 'Biggest challenge is finding workers'
      },
      culture: {
        score: 8,
        color: 'green',
        commentary: 'Good team morale and culture'
      }
    },
    topRecommendations: [
      {
        title: 'Strengthen Labour Systems',
        explanation: 'Formalize your labour management processes',
        impact: '£20K-£40K per year'
      },
      {
        title: 'Optimize Current Systems',
        explanation: 'Fine-tune your existing systems for better efficiency',
        impact: '£15K-£30K per year'
      },
      {
        title: 'Maintain Strong Pipeline',
        explanation: 'Continue nurturing your existing recruitment channels',
        impact: '£25K-£50K per year'
      }
    ],
    riskProfile: {
      color: 'amber',
      explanation: 'Moderate risk - improvements needed'
    },
    labourLeakProjection: {
      annualLeak: '£35K-£75K',
      improvementRange: '£20K-£50K',
      timeHorizon: '60-90 days'
    }
  }
};

console.log('\n🧪 A-TEAM TRADES PIPELINE - END-TO-END TEST\n');
console.log('=' .repeat(60));

// Test Step 1: Submit Email and Generate PDF
async function testEmailSubmission() {
  console.log('\n📧 STEP 1: Testing Email Submission & PDF Generation');
  console.log('-'.repeat(60));

  try {
    const response = await fetch(`${API_BASE}/api/submit-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testData.email,
        firstName: testData.firstName,
        lastName: testData.lastName,
        diagnosticData: testData.diagnosticData,
        sessionId: testData.sessionId,
        utmSource: 'e2e-test',
        utmMedium: 'automated-test',
        utmCampaign: 'verification'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Email submission successful');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}`);
      console.log(`   Email will be sent to: ${testData.email}`);
      return true;
    } else {
      console.log('❌ Email submission failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
      console.log(`   Details: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Email submission error:', error.message);
    return false;
  }
}

// Test Step 2: Submit Phone and Send SMS
async function testPhoneSubmission() {
  console.log('\n📱 STEP 2: Testing Phone Submission & SMS Delivery');
  console.log('-'.repeat(60));

  // Wait 2 seconds to ensure email session is created
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const response = await fetch(`${API_BASE}/api/submit-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testData.phone,
        email: testData.email,
        sessionId: testData.sessionId,
        utmSource: 'e2e-test',
        utmMedium: 'automated-test',
        utmCampaign: 'verification'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Phone submission successful');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${data.message}`);
      console.log(`   SMS will be sent to: ${testData.phone}`);
      return true;
    } else {
      console.log('❌ Phone submission failed');
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${data.error}`);
      console.log(`   Details: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Phone submission error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('\n🚀 Starting End-to-End Test...');
  console.log(`   Target Email: ${testData.email}`);
  console.log(`   Target Phone: ${testData.phone}`);
  console.log(`   Session ID: ${testData.sessionId}`);
  console.log(`   Server: ${API_BASE}`);

  const emailOk = await testEmailSubmission();

  console.log('\n⏳ Waiting 5 seconds for email to be sent...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  const phoneOk = await testPhoneSubmission();

  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Email + PDF:  ${emailOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`SMS Delivery: ${phoneOk ? '✅ PASS' : '❌ FAIL'}`);

  console.log('\n📝 MANUAL VERIFICATION REQUIRED:');
  console.log(`   1. Check email at: ${testData.email}`);
  console.log(`   2. Verify PDF link in email works`);
  console.log(`   3. Check SMS at: ${testData.phone}`);
  console.log(`   4. Verify Quick Win Pack content in SMS`);

  console.log('\n💡 Check server logs above for detailed execution trace');
  console.log('   Look for:');
  console.log('   - [API] Generating PDF report...');
  console.log('   - [OpenAI] Calling GPT-4o-mini API...');
  console.log('   - [API] ✅ SMS sent successfully to: ...');

  const allPassed = emailOk && phoneOk;

  if (allPassed) {
    console.log('\n🎉 All automated tests PASSED!');
    console.log('   Please verify email and SMS manually.');
  } else {
    console.log('\n⚠️  Some tests FAILED. Check logs above for details.');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Fatal error running tests:', error);
  process.exit(1);
});
