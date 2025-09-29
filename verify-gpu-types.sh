#!/bin/bash

echo "🔍 Verifying GPU Types Integration..."
echo ""

# Check current commit
echo "📋 Current commit:"
git log --oneline -1
echo ""

# Check if new GPU types are in the code
echo "🔍 Checking for new GPU types in code..."
if grep -q "mi355x\|rtx6000-blackwell" sesterce-dashboard/src/components/tabs/CalculatorTabEnhanced.tsx; then
    echo "✅ New GPU types found in CalculatorTabEnhanced.tsx"
else
    echo "❌ New GPU types NOT found in CalculatorTabEnhanced.tsx"
fi

if grep -q "mi355x\|rtx6000-blackwell" sesterce-dashboard/src/data/gpuSpecs.ts; then
    echo "✅ New GPU types found in gpuSpecs.ts"
else
    echo "❌ New GPU types NOT found in gpuSpecs.ts"
fi

# Check if optgroups are present
if grep -q "optgroup.*AMD\|optgroup.*Professional" sesterce-dashboard/src/components/tabs/CalculatorTabEnhanced.tsx; then
    echo "✅ Vendor optgroups found in dropdown"
else
    echo "❌ Vendor optgroups NOT found in dropdown"
fi

echo ""
echo "🔧 If new GPU types are missing, run:"
echo "   git fetch origin"
echo "   git reset --hard origin/main"
echo "   ./start-nginx.sh"
echo ""

# Check build directory age
if [ -d "sesterce-dashboard/build" ]; then
    echo "📦 Build directory last modified:"
    ls -la sesterce-dashboard/build/static/js/main.*.js | head -1
    echo ""
fi

echo "🎯 Expected GPU types to see:"
echo "   🚀 NVIDIA Data Center: GB200, GB300, H100 SXM, H200 SXM"
echo "   💼 NVIDIA Professional: H100 PCIe, H200 PCIe, RTX 6000 Blackwell"
echo "   🔴 AMD Instinct: MI355X, MI300X"
