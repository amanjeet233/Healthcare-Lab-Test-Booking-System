#!/bin/bash

# Load Test Runner Script for JMeter (Linux/Mac)
# This script runs the JMeter test plan and generates HTML reports

# Set variables
JMETER_HOME="${JMETER_HOME:-/opt/apache-jmeter-5.5}"
TEST_PLAN="LabTestAPI.jmx"
RESULTS_FILE="results.jtl"
REPORT_DIR="report"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if JMeter is installed
if [ ! -f "$JMETER_HOME/bin/jmeter" ]; then
    echo -e "${RED}Error: JMeter not found at $JMETER_HOME${NC}"
    echo "Please install JMeter or set JMETER_HOME environment variable"
    exit 1
fi

echo ""
echo "============================================"
echo "Lab Test Booking API - Load Test"
echo "============================================"
echo "Test Plan: $TEST_PLAN"
echo "Results File: $RESULTS_FILE"
echo "Report Directory: $REPORT_DIR"
echo ""

# Create report directory if it doesn't exist
mkdir -p "$REPORT_DIR"

# Run JMeter in non-GUI mode
echo -e "${YELLOW}Starting JMeter test run...${NC}"
echo ""

"$JMETER_HOME/bin/jmeter" \
  -n \
  -t "$TEST_PLAN" \
  -l "$RESULTS_FILE" \
  -j jmeter.log \
  -e \
  -o "$REPORT_DIR/report_$TIMESTAMP"

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}Error: JMeter test failed${NC}"
    exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}Test Completed Successfully!${NC}"
echo "============================================"
echo ""
echo "Results Summary:"
echo "- Results file: $RESULTS_FILE"
echo "- Report location: $REPORT_DIR/report_$TIMESTAMP"
echo ""
echo -e "${GREEN}To view the HTML report, open:${NC}"
echo "$REPORT_DIR/report_$TIMESTAMP/index.html"
echo ""
