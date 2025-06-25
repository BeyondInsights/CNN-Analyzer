#!/bin/bash

PROJECT_ID="cnn-analyzer"
FUNCTION_URL="https://us-central1-${PROJECT_ID}.cloudfunctions.net/runSimulation"

echo "🔥 Testing Firebase Functions directly..."
echo "Function URL: $FUNCTION_URL"
echo ""

# Test if function is deployed and accessible
echo "📡 Testing function availability..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" "$FUNCTION_URL" || echo "❌ Function not accessible"

echo ""
echo "🧪 Test with sample data..."
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [{"product": "CNN Reader", "monthlyRate": 9.99}],
    "reportType": "tiered", 
    "outputType": "percentage",
    "marketFactors": {"awareness": 75, "distribution": 80},
    "simulationOptions": {"segments": ["All"]}
  }' | head -200

echo ""
echo "If you see JSON results above → Firebase Functions working!"
echo "If you see errors → Functions need debugging"