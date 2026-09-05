const axios = require('axios');

async function testThemeAndTax() {
  const res = await axios.get('http://localhost:8080/listings');
  console.log('=== VERIFYING DARK MODE & TAX DISPLAY ===\n');
  console.log('✅ Has theme toggle button in navbar:', res.data.includes('themeToggleBtn'));
  console.log('✅ Has theme toggle in dropdown:', res.data.includes('dropdown-theme-toggle'));
  console.log('✅ Has pre-load theme script in <head>:', res.data.includes('fairstay_theme'));
  console.log('✅ Has Display total after taxes button:', res.data.includes('Display total after taxes'));
  console.log('✅ Has tax toggle switch:', res.data.includes('taxToggleSwitch'));
  console.log('✅ Tax toggle box has flex-shrink-0:', res.data.includes('tax-toggle-box d-flex align-items-center border rounded-pill px-3 py-2 shadow-xs flex-shrink-0 text-nowrap'));
}

testThemeAndTax();
