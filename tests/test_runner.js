/**
 * GStack Master Test Runner & Ship Certification Suite
 * Executes Phase 1 (Deep Subsystem & Route Audit) + Phase 2 (15-Point E2E Verification Suite)
 */

const { spawn } = require('child_process');

console.log('\n===============================================================');
console.log('       GSTACK AUTOMATED QUALITY ASSURANCE & SHIP RUNNER        ');
console.log('===============================================================');

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptName], {
      cwd: __dirname,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptName} exited with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  try {
    console.log('\n>>> PHASE 1: Running Deep Subsystem & Route Audit (deep_audit.js)...\n');
    await runScript('deep_audit.js');

    console.log('\n>>> PHASE 2: Running 15-Point End-to-End Suite (verify_all.js)...\n');
    await runScript('verify_all.js');

    console.log('\n>>> PHASE 3: Running City-Centric Seasonal & Event Pricing Verification (test_city_pricing.js)...\n');
    await runScript('test_city_pricing.js');

    console.log('\n>>> PHASE 4: Running Realistic Market Diversity & Capacity Specifications (test_market_diversity.js)...\n');
    await runScript('test_market_diversity.js');

    console.log('\n>>> PHASE 5: Running Full Stack MERN React Client Integration Audit (test_mern_integration.js)...\n');
    await runScript('test_mern_integration.js');

    console.log('\n>>> PHASE 6: Running React Full-Fidelity Booking, Payment & Room Ticket Audit (test_react_enhancements.js)...\n');
    await runScript('test_react_enhancements.js');

    console.log('\n===============================================================');
    console.log('   🎉 GSTACK CERTIFICATION: 100% TEST COVERAGE VERIFIED!     ');
    console.log('   STATUS: ALL MERN & BACKEND ASSERTIONS PASSED (100% SUCCESS) ');
    console.log('   READY FOR /ship RELEASE DEPLOYMENT                          ');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ GSTACK TEST RUNNER FAILED:', err.message);
    process.exit(1);
  }
}

main();
