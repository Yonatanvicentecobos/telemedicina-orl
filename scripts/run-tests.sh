#!/bin/bash
# Run test suite for telemedicina-orl

echo "================================================"
echo "  Telemedicina ORL - Test Suite Executor"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "[*] Installing dependencies..."
  npm install
  echo "[OK] Dependencies installed"
  echo ""
fi

# Run tests based on argument
case "$1" in
  "watch")
    echo "[*] Running tests in watch mode..."
    npm run test:watch
    ;;
  "coverage")
    echo "[*] Running tests with coverage report..."
    npm run test:coverage
    echo "[OK] Coverage report generated in coverage/"
    ;;
  "api")
    echo "[*] Running API tests only..."
    npm test -- src/__tests__/api
    ;;
  "components")
    echo "[*] Running component tests only..."
    npm test -- src/__tests__/components
    ;;
  "integration")
    echo "[*] Running integration tests only..."
    npm test -- src/__tests__/integration
    ;;
  "verbose")
    echo "[*] Running tests with verbose output..."
    npm test -- --verbose
    ;;
  *)
    echo "[*] Running all tests..."
    npm test
    echo ""
    echo "Usage: ./scripts/run-tests.sh [option]"
    echo "Options:"
    echo "  watch         - Run tests in watch mode"
    echo "  coverage      - Generate coverage report"
    echo "  api           - Run API tests only"
    echo "  components    - Run component tests only"
    echo "  integration   - Run integration tests only"
    echo "  verbose       - Run tests with verbose output"
    echo ""
    ;;
esac
