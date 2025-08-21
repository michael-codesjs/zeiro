#!/bin/bash

# Test script to validate deployment logic
# This script simulates the change detection logic used in the GitHub workflow

set -e

echo "🧪 Testing Zeiro Deployment Logic"
echo "================================="

# Simulate different change scenarios
test_scenarios=(
    "shared/sdk/src/index.ts"
    "services/authentication/package.json"
    "services/chat/src/handler.ts"
    "infrastructure/platform/index.tf"
    "clients/dashboard/src/app/page.tsx"
    "shared/sdk/package.json services/users/serverless.ts"
)

# Function to determine which services should be deployed
determine_services_to_deploy() {
    local changed_files="$1"
    local services=()
    
    echo "Changed files: $changed_files"
    
    # Check if shared SDK changed
    if echo "$changed_files" | grep -q "shared/sdk/"; then
        echo "📦 Shared SDK changed - deploying ALL services"
        services=("authentication" "chat" "credentials" "data-sources" "executions" "users" "websocket")
    else
        # Check individual services
        if echo "$changed_files" | grep -q "services/authentication/"; then
            services+=("authentication")
        fi
        if echo "$changed_files" | grep -q "services/chat/"; then
            services+=("chat")
        fi
        if echo "$changed_files" | grep -q "services/credentials/"; then
            services+=("credentials")
        fi
        if echo "$changed_files" | grep -q "services/data-sources/"; then
            services+=("data-sources")
        fi
        if echo "$changed_files" | grep -q "services/executions/"; then
            services+=("executions")
        fi
        if echo "$changed_files" | grep -q "services/users/"; then
            services+=("users")
        fi
        if echo "$changed_files" | grep -q "services/websocket/"; then
            services+=("websocket")
        fi
    fi
    
    if [ ${#services[@]} -eq 0 ]; then
        echo "🚫 No services to deploy"
    else
        echo "🚀 Services to deploy: ${services[*]}"
    fi
    
    echo "---"
}

# Test each scenario
for scenario in "${test_scenarios[@]}"; do
    echo "Testing scenario: $scenario"
    determine_services_to_deploy "$scenario"
done

echo "✅ All deployment logic tests completed"

# Validate that all services exist
echo ""
echo "🔍 Validating service directories exist..."

services=("authentication" "chat" "credentials" "data-sources" "executions" "users" "websocket")
for service in "${services[@]}"; do
    if [ -d "services/$service" ]; then
        echo "✅ services/$service exists"
        
        # Check for required files
        if [ -f "services/$service/package.json" ]; then
            echo "  ✅ package.json found"
        else
            echo "  ❌ package.json missing"
        fi
        
        if [ -f "services/$service/serverless.ts" ]; then
            echo "  ✅ serverless.ts found"
        else
            echo "  ❌ serverless.ts missing"
        fi
        
        # Check if service depends on SDK
        if grep -q "@zeiro/sdk" "services/$service/package.json" 2>/dev/null; then
            echo "  ✅ depends on @zeiro/sdk"
        else
            echo "  ❌ missing @zeiro/sdk dependency"
        fi
        
    else
        echo "❌ services/$service does not exist"
    fi
    echo ""
done

echo "🎯 Validation complete!"

# Test Turbo configuration
echo ""
echo "🔧 Testing Turbo configuration..."

if [ -f "turbo.json" ]; then
    echo "✅ turbo.json exists"
    
    # Check if build task is configured
    if grep -q '"build"' turbo.json; then
        echo "✅ build task configured"
    else
        echo "❌ build task not configured"
    fi
    
    # Check if test task would work
    if grep -q '"test"' turbo.json; then
        echo "✅ test task configured"
    else
        echo "⚠️  test task not explicitly configured (will use package.json scripts)"
    fi
else
    echo "❌ turbo.json missing"
fi

echo ""
echo "🏁 Test script completed successfully!"
