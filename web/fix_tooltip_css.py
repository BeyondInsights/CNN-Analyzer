#!/usr/bin/env python3

# First, update the CSS file to make tooltips bigger
with open('src/components/MarketFactorsModal.module.css', 'r') as f:
    css_content = f.read()

# Update the tooltip content to be wider and wrap text
tooltip_css_updates = '''/* Tooltip */
.tooltip {
  position: relative;
  display: inline-flex;
}

.tooltipIcon {
  background: #666;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: help;
}

.tooltipContent {
  display: none;
  position: absolute;
  background: #333;
  color: white;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 13px;
  width: 300px;  /* Fixed width for consistency */
  max-width: 300px;
  white-space: normal;  /* Allow text wrapping */
  line-height: 1.4;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

/* Arrow pointing down */
.tooltipContent::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 5px;
  border-style: solid;
  border-color: #333 transparent transparent transparent;
}

.tooltip:hover .tooltipContent {
  display: block;
}'''

# Replace the existing tooltip CSS
import re
pattern = r'/\* Tooltip \*/.*?\.tooltip:hover \.tooltipContent \{[^}]*\}'
if re.search(pattern, css_content, re.DOTALL):
    css_content = re.sub(pattern, tooltip_css_updates, css_content, flags=re.DOTALL)
else:
    # If not found, append it
    css_content += '\n\n' + tooltip_css_updates

with open('src/components/MarketFactorsModal.module.css', 'w') as f:
    f.write(css_content)

print("✓ Updated tooltip CSS for bigger boxes")

# Now add comprehensive Price Sensitivity tooltips in page.tsx
with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Add tooltip after "Enable Price Sensitivity Analysis" with full guide
price_sensitivity_tooltip = '''
                <div className={marketModalStyles.tooltip} style={{ display: 'inline-block', marginLeft: '8px' }}>
                  <span className={marketModalStyles.tooltipIcon}>?</span>
                  <div className={marketModalStyles.tooltipContent} style={{ width: '350px' }}>
                    <strong>Price Sensitivity Settings:</strong><br/><br/>
                    <strong>Threshold:</strong> The psychological "expensive" barrier<br/>
                    • $10: Entertainment benchmark (Netflix)<br/>
                    • $12: Standard news (recommended)<br/>
                    • $15: Premium news (NYT/WSJ)<br/><br/>
                    <strong>Low Price Boost:</strong> Extra adoption below threshold<br/>
                    • 1.1x = 10% boost (price insensitive)<br/>
                    • 1.3x = 30% boost (standard)<br/>
                    • 1.5x = 50% boost (very price sensitive)<br/><br/>
                    <strong>High Price Penalty:</strong> Lost adoption above threshold<br/>
                    • 0.9x = 10% penalty (loyal audience)<br/>
                    • 0.8x = 20% penalty (standard)<br/>
                    • 0.7x = 30% penalty (price sensitive)
                  </div>
                </div>'''

# Insert after "Enable Price Sensitivity Analysis"
pattern = r'(Enable Price Sensitivity Analysis\s*</label>)'
content = re.sub(pattern, r'Enable Price Sensitivity Analysis' + price_sensitivity_tooltip + r'</label>', content)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)

print("✓ Added comprehensive Price Sensitivity tooltip")
