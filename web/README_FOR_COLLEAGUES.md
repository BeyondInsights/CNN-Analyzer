
## Demographic Calibration Logic

Based on CNN audience insights:

### Age Groups
- **18-34**: 0.85x - Most price sensitive, prefer free content
- **35-54**: 1.15x - Sweet spot (disposable income + digital natives)
- **55-74**: 0.90x - Prefer linear TV, harder to convert to digital

### CNN Viewership
- **Regular Viewers**: 0.95x - Already getting CNN free, why pay?
- **Occasional Viewers**: 1.10x - Most convertible, want more content
- **Rare Viewers**: 0.85x - Low brand affinity

### Linear TV Status
- **Have Cable**: 0.85x - Already get CNN through cable package
- **Cord-Cutters**: 1.20x - Digital-first, seeking alternatives

### Key Insights Reflected
1. Older viewers (55+) are harder to convert despite being core audience
2. Regular free users are paradoxically harder to convert ("why pay now?")
3. 35-54 age group is the conversion sweet spot
4. Cord-cutters are prime targets
5. Standalone verticals reduced to 0.20x (were overestimating)

## Testing These Assumptions
1. Run simulation with only 55+ viewers - should show lower take rates
2. Compare "Occasional CNN" vs "Regular CNN" segments
3. Check "No Linear TV" segment - should show highest conversion
