# Load Testing Suite - File Reference

Complete load testing infrastructure for Lab Test Booking API with comprehensive documentation, automation scripts, and result analysis tools.

## File Structure

```
load-test/
├── LabTestAPI.jmx                 # JMeter test plan (XML)
├── config.json                     # Configuration file (JSON)
├── README.md                       # Comprehensive documentation (12KB+)
├── QUICK_START.md                 # Quick start guide (5-minute setup)
├── FILE_REFERENCE.md              # This file
├── run-test.bat                   # Windows batch script
├── run-test.sh                    # Linux/Mac shell script
├── run-load-test.py              # Python test runner with analysis
├── docker-compose.yml             # Docker Compose for containerized testing
├── results/                       # Results directory (auto-created)
│   ├── results.jtl               # Test results file (CSV)
│   ├── jmeter.log                # JMeter execution log
│   └── results_report.json       # Parsed results (JSON)
└── report/                        # Reports directory (auto-created)
    └── report_YYYYMMDD_HHMMSS/
        ├── index.html            # Main HTML report
        ├── statistics.html       # Detailed statistics
        ├── graph.html            # Performance graphs
        └── ...
```

## File Descriptions

### Core Test Files

#### `LabTestAPI.jmx` (JMeter Test Plan)
**Type:** Apache JMeter Test Plan (XML)
**Size:** ~15KB
**Purpose:** Main test configuration executed by JMeter
**Contains:**
- 3 thread groups (Search, Booking, Report scenarios)
- 5 HTTP samplers with dynamic parameters
- Response assertions and result extractors
- User-defined variables (base URL, JWT token, duration)
- Result collectors and listeners

**Key Sections:**
```
Test Plan
├── Search Tests Thread Group (100 users, 10 loops)
│   ├── Search Lab Tests Sampler
│   └── Get All Lab Tests Sampler
├── Create Bookings Thread Group (50 users, 5 loops)
│   └── Create Booking Sampler
└── Download Reports Thread Group (20 users, 8 loops)
    └── Download Report PDF Sampler
```

**Usage:**
- Edit variables: BASE_URL, JWT_TOKEN, TEST_DURATION, RAMP_UP_TIME
- Adjust thread counts to change concurrent user load
- Modify loop counts for different iteration patterns

#### `config.json` (Configuration)
**Type:** JSON Configuration
**Size:** ~3KB
**Purpose:** Centralized configuration for test parameters
**Contains:**
- API connection settings (baseUrl, JWT token, timeouts)
- Test scenario definitions (users, loops, endpoints)
- Performance targets (response time SLAs, throughput goals)
- Monitoring thresholds (CPU, memory, disk alert levels)

**Key Sections:**
- `api`: Connection and authentication configuration
- `test`: Overall test parameters
- `scenarios`: Array of 3 test scenarios
- `assertions`: Response validation rules
- `performance_targets`: SLA thresholds
- `monitoring`: System resource thresholds

**Usage:**
- Update JWT token before running tests
- Adjust user counts in scenarios array
- Modify performance targets as needed

---

### Execution Scripts

#### `run-test.bat` (Windows)
**Type:** Windows Batch Script
**Size:** ~2KB
**Purpose:** Automated JMeter test execution on Windows
**Features:**
- Validates JMeter installation
- Runs test in non-GUI mode for better performance
- Generates timestamped reports
- Displays execution summary and report location

**Usage:**
```batch
cd load-test
run-test.bat
```

**Environment Requirements:**
- JMETER_HOME environment variable set, OR
- jmeter.bat in system PATH

#### `run-test.sh` (Linux/Mac)
**Type:** Bash Shell Script
**Size:** ~2KB
**Purpose:** Automated JMeter test execution on Unix-like systems
**Features:**
- Cross-platform compatibility (Linux, Mac, WSL)
- Color-coded output for easy reading
- Automatic JMETER_HOME detection
- Timestamped report generation

**Usage:**
```bash
cd load-test
chmod +x run-test.sh
./run-test.sh
```

**Environment Requirements:**
- JMETER_HOME environment variable, OR
- jmeter in system PATH
- Bash shell

#### `run-load-test.py` (Python Test Runner)
**Type:** Python 3 Script
**Size:** ~8KB
**Purpose:** Cross-platform test execution with advanced result analysis
**Features:**
- Platform-independent (Windows, Linux, Mac)
- Automatic JMeter detection
- Real-time progress monitoring
- Comprehensive result analysis
- JSON report generation
- Console summary with detailed statistics
- Percentile calculations (P50, P95, P99)

**Usage:**
```bash
# Run test and analyze
python3 run-load-test.py

# Analyze existing results
python3 run-load-test.py analyze results.jtl
```

**Dependencies:**
- Python 3.6+
- No external pip packages required (uses standard library)

**Output:**
- Console summary report
- JSON analysis: `results_report.json`
- HTML report in `report/` directory

---

### Documentation Files

#### `README.md` (Comprehensive Guide)
**Type:** Markdown Documentation
**Size:** ~12KB
**Purpose:** Complete guide to load testing infrastructure
**Contents:**
- Overview of test scenarios
- Prerequisites and installation steps
- Configuration instructions
- Running tests (4 different methods)
- Interpreting results with detailed metrics
- KPI thresholds and targets
- Troubleshooting common issues
- Performance tuning recommendations
- Advanced features and customization
- Continuous integration setup
- Jenkins and GitHub Actions examples

**Sections:**
1. Overview - Test scenarios explanation
2. Prerequisites - Software requirements
3. Installation - Step-by-step setup guide
4. Configuration - Variable and JWT setup
5. Running Tests - Multiple execution methods
6. Interpreting Results - Metric explanations
7. Troubleshooting - Common issues and solutions
8. Performance Tuning - Optimization strategies
9. Advanced Features - Custom metrics, load profiles
10. Best Practices - Testing guidelines
11. CI/CD Integration - Automation examples
12. Support - Links and resources

#### `QUICK_START.md` (5-Minute Guide)
**Type:** Markdown Reference
**Size:** ~4KB
**Purpose:** Fast onboarding for new users
**Contents:**
- 5-step setup procedure
- Test scenario descriptions
- Expected performance results
- Quick interpretation guide
- Common issues and solutions
- Customization examples
- Best practices checklist

**Key Sections:**
- 5-Minute Setup
- Test Scenarios (what, when, expected results)
- Interpreting Results (key metrics)
- Common Issues & Solutions
- Customizing Tests
- Running via Python
- Performance Benchmarks
- Best Practices

#### `FILE_REFERENCE.md` (This File)
**Type:** Markdown Reference
**Size:** ~6KB
**Purpose:** Detailed reference of all files in the load testing suite
**Provides:**
- File structure overview
- Detailed description of each file
- Usage instructions
- Dependencies and requirements
- Key sections and contents

---

### Infrastructure Files

#### `docker-compose.yml` (Container Orchestration)
**Type:** Docker Compose Configuration
**Size:** ~2KB
**Purpose:** Containerized testing environment setup
**Services:**
- `api`: Lab Test Booking application (Spring Boot)
- `mysql`: MySQL 8.0 database
- `redis`: Redis cache
- `jmeter`: JMeter load testing client

**Features:**
- Health checks for all services
- Service dependencies management
- Volume mounts for persistent data and test results
- Network isolation for security
- Environment variable configuration

**Usage:**
```bash
# Start all services
docker-compose up -d

# Run jmeter service
docker-compose run jmeter

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

**Requirements:**
- Docker and Docker Compose installed
- API image built: `docker build -t lab-test-booking:latest .`

---

## Generated Files (Created During Testing)

### Results Files

#### `results.jtl`
**Type:** CSV/XML Results
**Generated:** During test execution
**Purpose:** Raw test results data
**Contains:**
- Timestamp
- Request/response details
- Response times
- Status codes
- Error messages
- Thread information

**Format:**
```csv
timeStamp,elapsed,label,responseCode,responseMessage,threadName,success,failureMessage,bytes,sentBytes,grpThreads,allThreads,Latency,Connect
1676234567123,250,Search Lab Tests,200,OK,Search Tests 1-1,true,,1234,456,100,170,80,25
```

#### `jmeter.log`
**Type:** Plain Text Log
**Generated:** During test execution
**Purpose:** JMeter execution details and diagnostic info
**Contains:**
- Startup messages
- Configuration details
- Warning/error messages
- Performance metrics
- Shutdown information

#### `results_report.json`
**Type:** JSON Report
**Generated:** By `run-load-test.py`
**Purpose:** Parsed and analyzed test results
**Contains:**
```json
{
  "generated_at": "2026-02-18T12:34:56",
  "overall": {
    "total_requests": 1660,
    "successful": 1655,
    "error_rate": 0.30,
    "response_time": {
      "avg": 250.00,
      "p95": 500,
      "p99": 1000
    }
  },
  "by_label": { ... },
  "errors": { ... }
}
```

### HTML Reports

#### `report/report_YYYYMMDD_HHMMSS/index.html`
**Type:** HTML Report (by JMeter)
**Generated:** After test execution with `-e -o` flags
**Contains:**
- Overall statistics
- Response time graphs
- Throughput information
- Error analysis
- Request/response details

**Key Pages:**
- `index.html` - Summary dashboard
- `statistics.html` - Detailed statistics by endpoint
- `graph.html` - Response time trends
- `errors.html` - Error details
- `top5_errors.html` - Top 5 error types

---

## Usage Workflows

### Workflow 1: Quick Test (5 minutes)
```
1. Update JWT_TOKEN in LabTestAPI.jmx
2. Run: run-test.bat (Windows) or ./run-test.sh (Linux/Mac)
3. Open: report/report_YYYYMMDD_HHMMSS/index.html
4. Review: Response times, error rate, throughput
```

### Workflow 2: Python Analysis (Platform-Independent)
```
1. Run: python3 run-load-test.py
2. Review: Console summary report
3. Export: results_report.json for further analysis
4. Open: report/report_YYYYMMDD_HHMMSS/index.html
```

### Workflow 3: Docker Containerized
```
1. Edit: docker-compose.yml (if needed)
2. Build: docker build -t lab-test-booking:latest .
3. Run: docker-compose up -d
4. Results: Local volumes mount results and reports
```

### Workflow 4: Continuous Integration (Jenkins)
```
1. Commit: Load test files to repository
2. Configure: Jenkins job to run tests periodically
3. Execute: python3 run-load-test.py in build step
4. Archive: Generate trend reports over time
```

---

## Performance Targets

### Expected Metrics (Baseline)

**Search Tests (100 users):**
- Average Response Time: 150-200ms
- P95: 400-500ms
- P99: 800-1000ms
- Throughput: 300+ req/min
- Error Rate: < 0.5%

**Create Bookings (50 users):**
- Average Response Time: 200-250ms
- P95: 500-600ms
- P99: 1000-1200ms
- Throughput: 150+ req/min
- Error Rate: < 0.5%

**Download Reports (20 users):**
- Average Response Time: 300-400ms
- P95: 600-800ms
- P99: 1200-1800ms
- Throughput: 60+ req/min
- Error Rate: < 0.5%

---

## Customization Guide

### Adjusting User Load
Edit `LabTestAPI.jmx`:
```xml
<stringProp name="ThreadGroup.num_threads">200</stringProp>
```

### Changing Test Duration
Edit `LabTestAPI.jmx` or passing via variable:
```xml
<stringProp name="ThreadGroup.duration">600</stringProp>
```

### Creating Custom Scenario
1. Copy `ThreadGroup` and `hashTree` blocks
2. Modify endpoint path and parameters
3. Update expected response codes
4. Add to test plan

### Adding Custom Headers
Add to `HeaderManager` within sampler:
```xml
<elementProp name="X-Custom-Header">
  <stringProp name="Header.value">value</stringProp>
</elementProp>
```

---

## Troubleshooting Quick Reference

| Problem | Solution | File |
|---------|----------|------|
| "Connection refused" | Verify API running on localhost:8080 | README.md § Troubleshooting |
| "401 Unauthorized" | Update JWT token in test plan | QUICK_START.md § Step 3 |
| High error rate | Reduce user load or check server logs | README.md § Performance Tuning |
| Out of memory | Increase JVM heap: `-Xms512m -Xmx2048m` | run-load-test.py |
| Slow responses | Check server resource usage | README.md § Advanced Features |

---

## Additional Resources

- **JMeter Official:** https://jmeter.apache.org/
- **API Documentation:** See project README.md
- **Docker Documentation:** https://docs.docker.com/
- **Best Practices:** README.md § Best Practices section

---

## Version Information

- **JMeter Version:** 5.5
- **Test Plan Format:** JMeter 5.0+
- **Python Version:** 3.6+
- **Docker Compose Version:** 3.8
- **Created:** 2026-02-18
- **Last Updated:** 2026-02-18

---

## Support & Feedback

For issues or questions:
1. Check QUICK_START.md for common issues
2. Review README.md troubleshooting section
3. Check console output and jmeter.log
4. Review results_report.json for detailed metrics

Happy load testing! 🚀
