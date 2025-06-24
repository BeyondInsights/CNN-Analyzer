#!/bin/bash
# Find the start of runSensitivityAnalysis and replace it
awk '
/const runSensitivityAnalysis = async/ {
    print "  const runSensitivityAnalysis = async () => {"
    print "    try {"
    print "      const activeProducts = Array.from(activeProductsState)"
    print "        .map(id => ({ ...cardDataState[id], id, isActive: true, excluded: false } as ProductSetupConfig))"
    print "        .filter(p => p.product);"
    print "      const data = await runPriceSensitivityAnalysis(activeProducts as any, activeProducts[0]?.product || \"CNN Reader\", [0.5, 0.75, 1.0, 1.25, 1.5], reportType, outputType);"
    print "      setSensitivityData(data);"
    print "    } catch (error) {"
    print "      console.error(\"Sensitivity analysis error:\", error);"
    print "      alert(\"Error running sensitivity analysis\");"
    print "    }"
    print "  };"
    # Skip until we find the closing brace
    while (getline && !/^  };/) {}
    next
}
{print}
' src/app/page.tsx > src/app/page.tsx.tmp && mv src/app/page.tsx.tmp src/app/page.tsx
