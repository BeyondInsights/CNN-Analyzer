const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧹 Cleaning build artifacts...");

const dirsToClean = [".next", "out", "dist", "build"];

dirsToClean.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed ${dir}`);
    } catch (error) {
      console.error(`❌ Failed to remove ${dir}:`, error.message);
    }
  }
});

console.log("�� Clean complete!");
