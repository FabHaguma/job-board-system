// Test runner script
const { spawn } = require('child_process');
const path = require('path');

const runTests = () => {
  console.log('🧪 Running Job Board Backend Tests...\n');

  const jest = spawn('npx', ['jest', '--verbose', '--coverage'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  jest.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed successfully!');
    } else {
      console.log('\n❌ Some tests failed. Please check the output above.');
    }
    process.exit(code);
  });

  jest.on('error', (err) => {
    console.error('Failed to start test runner:', err);
    process.exit(1);
  });
};

// Allow running this script directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
