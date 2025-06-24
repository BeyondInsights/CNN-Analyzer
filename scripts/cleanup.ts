import fs from 'fs';
import path from 'path';

const DIRECTORIES_TO_CLEAN = [
  'dist',
  'build',
  '.cache',
  'node_modules/.cache'
];

const DIRECTORIES_TO_VERIFY = [
  'src',
  'public',
  'node_modules'
];

export function cleanup() {
  console.log('🧹 Starting cleanup process...');

  // Clean build directories
  DIRECTORIES_TO_CLEAN.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`✔️ Cleaned ${dir}`);
    }
  });

  // Verify critical directories
  DIRECTORIES_TO_VERIFY.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ Missing critical directory: ${dir}`);
    }
  });

  console.log('✨ Cleanup complete');
}

// Run if called directly
if (require.main === module) {
  cleanup();
}
