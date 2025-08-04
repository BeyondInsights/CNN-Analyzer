#!/usr/bin/env python3
"""
CNN Analyzer Integration Fixer Script
This script will check and fix integration issues in your CNN Analyzer project
"""

import os
import re
import sys

def check_file_exists(filepath):
    """Check if a file exists"""
    return os.path.exists(filepath)

def read_file(filepath):
    """Read file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return None

def write_file(filepath, content):
    """Write content to file"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error writing {filepath}: {e}")
        return False

def fix_page_tsx():
    """Fix the page.tsx file with all necessary integrations"""
    
    page_path = 'web/src/app/page.tsx'
    
    if not check_file_exists(page_path):
        print(f"❌ {page_path} not found!")
        return False
    
    content = read_file(page_path)
    if not content:
        return False
    
    print("📝 Fixing page.tsx...")
    
    # 1. Add missing import for SimulationPromptModal
    if "import SimulationPromptModal" not in content:
        print("  ✅ Adding SimulationPromptModal import")
        import_insert_point = content.find("import EnhancedProductProfiles")
        if import_insert_point != -1:
            import_line = content[:import_insert_point].rfind('\n')
            content = content[:import_line] + "\nimport SimulationPromptModal from '@/components/SimulationPromptModal';" + content[import_line:]
    
    # 2. Add showSimulationPrompt state if missing
    if "showSimulationPrompt" not in content:
        print("  ✅ Adding showSimulationPrompt state")
        state_insert_point = content.find("const [showNotification, setShowNotification]")
        if state_insert_point != -1:
            next_line = content.find('\n', state_insert_point)
            content = content[:next_line] + "\n  const [showSimulationPrompt, setShowSimulationPrompt] = useState(false);" + content[next_line:]
    
    # 3. Update handleRunSimulationClick function
    print("  ✅ Updating handleRunSimulationClick function")
    func_pattern = r'const handleRunSimulationClick = \(\) => \{[^}]+\};'
    new_function = """const handleRunSimulationClick = () => {
    const activeCount = Array.from(activeProductsState)
      .filter(id => cardDataState[id] && cardDataState[id].product)
      .length;
      
    if (activeCount === 0) {
      showBrandedAlert('Configuration Error', 'Please configure at least one product before running simulation', 'error');
      return;
    }
    
    setShowSimulationPrompt(true);
  };"""
    
    content = re.sub(func_pattern, new_function, content, flags=re.DOTALL)
    
    # 4. Add handleSimulationConfirmed function
    if "handleSimulationConfirmed" not in content:
        print("  ✅ Adding handleSimulationConfirmed function")
        insert_point = content.find("const handleSimulation = async")
        if insert_point != -1:
            content = content[:insert_point] + """const handleSimulationConfirmed = () => {
    setShowSimulationPrompt(false);
    handleSimulation();
  };

  """ + content[insert_point:]
    
    # 5. Add Enhanced Product Profiles section after cards container
    if "Product Profiles & Demographics" not in content and "EnhancedProductProfiles />" not in content:
        print("  ✅ Adding Enhanced Product Profiles section")
        cards_end = content.find("</div>\n\n      {/* All your modals")
        if cards_end == -1:
            cards_end = content.find("</div>\n\n      {/* Feature Selection Modal")
        
        if cards_end != -1:
            profiles_section = """</div>

      {/* Enhanced Product Profiles Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionHeader}>Product Profiles & Demographics</h2>
        <EnhancedProductProfiles />
      </div>

      {/* All your modals"""
            
            content = content[:cards_end] + profiles_section + content[cards_end+6:]
    
    # 6. Add SimulationPromptModal with other modals
    if "SimulationPromptModal" not in content or "onConfirm={handleSimulationConfirmed}" not in content:
        print("  ✅ Adding SimulationPromptModal component")
        # Find the BrandedNotification component
        modal_insert = content.rfind("<BrandedNotification")
        if modal_insert != -1:
            # Find the end of BrandedNotification
            modal_end = content.find("/>", modal_insert) + 2
            simulation_modal = """

      {/* Simulation Prompt Modal */}
      <SimulationPromptModal
        show={showSimulationPrompt}
        onConfirm={handleSimulationConfirmed}
        onCancel={() => setShowSimulationPrompt(false)}
      />"""
            
            content = content[:modal_end] + simulation_modal + content[modal_end:]
    
    # 7. Uncomment EnhancedProductProfiles if it's commented
    content = content.replace("{/* <EnhancedProductProfiles", "<EnhancedProductProfiles")
    content = content.replace("/> */}", "/>")
    
    # Write the fixed content
    if write_file(page_path, content):
        print("✅ page.tsx fixed successfully!")
        return True
    else:
        return False

def check_missing_components():
    """Check for missing component files"""
    
    components_dir = 'web/src/components'
    required_components = [
        'SimulationPromptModal.tsx',
        'BrandedNotification.tsx',
        'EnhancedProductProfiles.tsx'
    ]
    
    print("\n🔍 Checking for required components...")
    missing = []
    
    for component in required_components:
        filepath = os.path.join(components_dir, component)
        if check_file_exists(filepath):
            print(f"  ✅ {component} exists")
        else:
            print(f"  ❌ {component} is MISSING!")
            missing.append(component)
    
    return missing

def create_missing_component(component_name):
    """Create a missing component file"""
    
    components_dir = 'web/src/components'
    filepath = os.path.join(components_dir, f"{component_name}.tsx")
    
    # Component templates
    templates = {
        'SimulationPromptModal': '''import React from 'react';
import styles from './SimulationPromptModal.module.css';

interface SimulationPromptModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function SimulationPromptModal({ show, onConfirm, onCancel }: SimulationPromptModalProps) {
  if (!show) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Run Simulation</h2>
        </div>
        <div className={styles.modalContent}>
          <p>You are about to run a market simulation with your current product configuration.</p>
          <p>This will analyze:</p>
          <ul>
            <li>Market adoption rates across segments</li>
            <li>Revenue projections</li>
            <li>Competitive positioning</li>
          </ul>
          <p>Are you ready to proceed?</p>
        </div>
        <div className={styles.modalButtons}>
          <button className={styles.btnSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button className={styles.btnPrimary} onClick={onConfirm}>
            Run Simulation
          </button>
        </div>
      </div>
    </div>
  );
}'''
    }
    
    if component_name in templates:
        print(f"  📝 Creating {component_name}.tsx...")
        if write_file(filepath, templates[component_name]):
            print(f"  ✅ {component_name}.tsx created!")
            
            # Also create the CSS module
            css_path = os.path.join(components_dir, f"{component_name}.module.css")
            css_content = '''.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
}

.modalHeader {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modalHeader h2 {
  margin: 0;
  color: #333;
}

.modalContent {
  padding: 20px;
}

.modalContent p {
  margin-bottom: 15px;
  line-height: 1.6;
}

.modalContent ul {
  margin-left: 20px;
  margin-bottom: 15px;
}

.modalButtons {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid #e0e0e0;
}

.btnPrimary, .btnSecondary {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.btnPrimary {
  background-color: #cc0000;
  color: white;
}

.btnPrimary:hover {
  background-color: #990000;
}

.btnSecondary {
  background-color: #f0f0f0;
  color: #333;
}

.btnSecondary:hover {
  background-color: #e0e0e0;
}'''
            write_file(css_path, css_content)
            return True
    
    return False

def main():
    """Main function to run all fixes"""
    
    print("🚀 CNN Analyzer Integration Fixer")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('web/src/app/page.tsx'):
        print("❌ Error: Not in the CNN-Analyzer root directory!")
        print("   Please run this script from the project root.")
        return 1
    
    # Check for missing components
    missing = check_missing_components()
    
    # Create missing components
    if missing:
        print("\n📦 Creating missing components...")
        for component in missing:
            create_missing_component(component.replace('.tsx', ''))
    
    # Fix page.tsx
    print("\n🔧 Fixing page.tsx integration...")
    if fix_page_tsx():
        print("\n✅ All fixes applied successfully!")
        print("\n📋 Summary:")
        print("  - Added missing imports")
        print("  - Added simulation prompt state")
        print("  - Updated handleRunSimulationClick")
        print("  - Added handleSimulationConfirmed")
        print("  - Added Enhanced Product Profiles section")
        print("  - Added SimulationPromptModal component")
        
        if missing:
            print(f"  - Created {len(missing)} missing component(s)")
        
        print("\n🎉 Your simulator should now be ready to run!")
        return 0
    else:
        print("\n❌ Some fixes failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
