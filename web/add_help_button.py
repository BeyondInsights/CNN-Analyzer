#!/usr/bin/env python3
import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add import
content = re.sub(
    r"(import.*from.*'@/components/AboutModelModal';)",
    r"\1\nimport HowToUseGuide from '@/components/HowToUseGuide';",
    content
)

# Add state
content = re.sub(
    r"(const \[showAboutModel, setShowAboutModel\] = useState.*?;)",
    r"\1\n  const [showHowToUse, setShowHowToUse] = useState(false);",
    content
)

# Add button in the header buttons section
help_button = '''          <button
            className={`${styles.headerButton} ${styles.helpButton}`}
            onClick={() => setShowHowToUse(true)}
            style={{ backgroundColor: '#28a745' }}
          >
            <span className={styles.iconSpacing}>❓</span> How to Use
          </button>
          
          '''

content = re.sub(
    r'(\s+<button\s+className={`\$\{styles\.headerButton\}`}\s+onClick=\{handleSensitivityAnalysis\})',
    help_button + r'\1',
    content
)

# Add the modal component at the end with other modals
modal_component = '''
      {/* How to Use Guide */}
      <HowToUseGuide
        isOpen={showHowToUse}
        onClose={() => setShowHowToUse(false)}
      />'''

content = re.sub(
    r'(</div>\s*\);\s*\})',
    modal_component + r'\n\1',
    content
)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added How to Use guide")
