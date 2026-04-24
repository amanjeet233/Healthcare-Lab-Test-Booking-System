# Load Testing for Lab Test Booking API

This directory contains load testing scripts and configurations for the Lab Test Booking REST API using Apache JMeter.

## Overview

The load test simulates three primary user scenarios:
1. **Search Tests** - 100 concurrent users searching for lab tests
2. **Create Bookings** - 50 concurrent users creating booking reservations
3. **Download Reports** - 20 concurrent users downloading PDF reports

## Test Configuration

**File:** `LabTestAPI.jmx`

### Test Parameters

- **Total Load:** 170 concurrent users (100 + 50 + 20)
- **Test Duration:** 300 seconds (5 minutes)
- **Ramp-up Time:** 30 seconds (gradual user increase)
- **Loop Count:** Varies per scenario (5-10 iterations)

### Test Scenarios

#### Scenario 1: Search Lab Tests (100 Users)
- **Endpoints Tested:**
  - `GET /api/lab-tests/search?search=blood&page={0-5}`
  - `GET /api/lab-tests?page={0-5}`
- **Expected Response:** 200 OK
- **Throughput Target:** ~333+ requests per minute

#### Scenario 2: Create Bookings (50 Users)
- **Endpoint Tested:**
  - `POST /api/bookings`
- **Request Payload:**
  ```json
  {
    "labTestId": 1-10,
    "bookingDate": "2026-02-18T09:00:00",
    "slotTime": "09:00 AM",
    "labPartnerId": 1-5,
    "addressType": "HOME"
  }
  ```
- **Expected Response:** 201 Created
- **Features:** Extracts booking ID from response for potential follow-up tests

#### Scenario 3: Download Reports (20 Users)
- **Endpoint Tested:**
  - `GET /api/reports/{1-100}/pdf`
- **Expected Content:** PDF (application/pdf)
- **Expected Response:** 200 OK

### Metrics Collected

- **Response Time:** Average, Min, Max, P50, P90, P95, P99
- **Throughput:** Requests per second / minute
- **Error Rate:** Percentage of failed requests
- **Bytes Sent/Received:** Total data transferred
- **Active Threads:** Concurrent users over time

## Prerequisites

1. **Apache JMeter** (5.5 or later)
   - Download: https://jmeter.apache.org/download_jmeter.cgi
   - Installation: Extract to a directory (e.g., `C:\apache-jmeter-5.5`)

2. **Java Runtime Environment** (JDK 8 or later)
   - Required by JMeter

3. **Lab Test Booking API** running locally
   - Default URL: `http://localhost:8080`
   - Health check: `http://localhost:8080/health`

4. **Valid JWT Token**
   - Update `JWT_TOKEN` in the test plan before running
   - Obtain token via: `POST http://localhost:8080/api/auth/login`

## Installation & Setup

### Step 1: Install JMeter

**Windows:**
```batch
cd C:\
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.5.zip
# Extract the ZIP file
# Set JMETER_HOME environment variable
setx JMETER_HOME "C:\apache-jmeter-5.5"
```

**Linux/Mac:**
```bash
cd /opt
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.5.tgz
tar -xzf apache-jmeter-5.5.tgz
export JMETER_HOME="/opt/apache-jmeter-5.5"
```

### Step 2: Update Test Plan Variables

Edit `LabTestAPI.jmx` and update:
- `BASE_URL`: API base URL (default: http://localhost:8080)
- `JWT_TOKEN`: Valid authentication token
- `TEST_DURATION`: Duration in seconds (default: 300)
- `RAMP_UP_TIME`: Gradual ramp-up duration (default: 30)

### Step 3: Configure API Authentication

Obtain a JWT token:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Update the `JWT_TOKEN` variable in the test plan with the received token.

## Running the Load Test

### Option 1: Using Batch Script (Windows)

```batch
cd load-test
run-test.bat
```

The script will:
1. Validate JMeter installation
2. Run the test in non-GUI mode
3. Generate HTML reports automatically
4. Display the report location

### Option 2: Using Bash Script (Linux/Mac)

```bash
cd load-test
chmod +x run-test.sh
./run-test.sh
```

### Option 3: Manual Execution

```bash
jmeter -n \
  -t LabTestAPI.jmx \
  -l results.jtl \
  -e \
  -o report/results_$(date +%s)
```

### Option 4: Using JMeter GUI

```bash
jmeter -t LabTestAPI.jmx
```

Then click **Start** button or press `Ctrl+R`

## Interpreting Results

### HTML Report Location

Reports are generated in: `report/report_TIMESTAMP/`

Key files:
- `index.html` - Main summary report
- `statistics.html` - Detailed response time statistics
- `graph.html` - Visual representation of response times

### Key Performance Indicators (KPIs)

#### 1. Response Time Metrics

| Metric | Target | Acceptable | Warning |
|--------|--------|-----------|---------|
| Average | < 200ms | < 500ms | > 500ms |
| P95 | < 500ms | < 1000ms | > 1000ms |
| P99 | < 1000ms | < 2000ms | > 2000ms |
| Max | < 5000ms | < 10000ms | > 10000ms |

#### 2. Throughput

| Operation | Target | Min Acceptable |
|-----------|--------|----------------|
| Search | > 300 req/min | > 200 req/min |
| Booking | > 150 req/min | > 100 req/min |
| Reports | > 60 req/min | > 40 req/min |

#### 3. Error Rate

| Status | Target | Acceptable | Critical |
|--------|--------|-----------|----------|
| Success | 100% | > 99.5% | < 99% |
| Errors | 0% | < 0.5% | > 0.5% |

### Interpreting Report Tables

**Summary Table Example:**
```
Label               Samples  Average  Min     Max     Std Dev  Error %  Throughput
Search Lab Tests    1000     180ms    45ms    2500ms  220ms    0%       200/sec
Create Booking      500      250ms    100ms   3000ms  350ms    0.2%     100/sec
Download Report     160      420ms    200ms   1800ms  150ms    0%       32/sec
```

**Analysis:**
- **Samples:** Total requests executed
- **Average:** Mean response time
- **P95/P99:** Percentile response times (shown in detailed view)
- **Error %:** Percentage of failed requests
- **Throughput:** Requests per second

## Troubleshooting

### Common Issues

#### 1. "Connection refused" Error
```
Error: Connection refused to host: localhost:8080
```
**Solution:**
- Verify API is running: `curl http://localhost:8080/health`
- Check `BASE_URL` in test plan
- Verify firewall settings

#### 2. "401 Unauthorized" Error
```
Error: 401 Unauthorized
```
**Solution:**
- Verify JWT token is valid
- Update `JWT_TOKEN` variable with fresh token
- Check token expiration time

#### 3. High Error Rate During Test
```
Error %: > 5%
```
**Solution:**
- Reduce concurrent users (decrease thread count)
- Increase test duration for warmup
- Check API server resources (CPU, memory, database)
- Review application logs

#### 4. JMeter Out of Memory
```
Error: java.lang.OutOfMemoryError
```
**Solution:**
- Increase JVM heap size before running:
  ```bash
  export JVM_ARGS="-Xms512m -Xmx2048m"
  jmeter -n -t LabTestAPI.jmx ...
  ```

#### 5. Slow Response Times
```
Average: > 1000ms
```
**Solution:**
- Reduce concurrent users
- Check API server performance
- Review database query performance
- Check network latency

## Performance Tuning

### For Better Load Test Results

1. **Database Optimization**
   - Add indexes on frequently queried columns
   - Optimize query performance
   - Consider caching strategies

2. **API Optimization**
   - Implement connection pooling
   - Use asynchronous processing
   - Add caching (Redis)
   - Optimize response payload size

3. **Infrastructure Scaling**
   - Increase server resources
   - Use load balancer (Nginx, HAProxy)
   - Implement horizontal scaling
   - Use CDN for static assets

### JMeter Tweaks

Update in `LabTestAPI.jmx`:
```xml
<!-- Increase thread pool size -->
<stringProp name="ThreadGroup.num_threads">200</stringProp>

<!-- Increase test duration -->
<stringProp name="ThreadGroup.duration">600</stringProp>

<!-- Adjust ramp-up time -->
<stringProp name="ThreadGroup.ramp_time">60</stringProp>

<!-- Add think time between requests -->
<ConstantTimer>
  <stringProp name="ConstantTimer.delay">500</stringProp>
</ConstantTimer>
```

## Advanced Features

### Custom Metrics

Add correlation ID to track requests:
```xml
<HeaderManager>
  <elementProp name="X-Request-ID">
    <stringProp name="Header.value">${__UUID()}</stringProp>
  </elementProp>
</HeaderManager>
```

### Load Profile Variations

**Ramp-up Pattern:**
- 0-1 min: 0 → 50%
- 1-3 min: 50% → 100%
- 3-4 min: 100% (sustained)
- 4-5 min: 100% → 0% (ramp-down)

**Spike Testing:**
Increase users from 50 to 500 suddenly to test system reaction

**Stress Testing:**
Gradually increase load until system breaks, identify breaking point

## Best Practices

1. **Baseline Testing**
   - Run with minimal load first
   - Establish baseline metrics
   - Compare subsequent tests

2. **Realistic Scenarios**
   - Match production user behavior
   - Include think time between requests
   - Simulate varied operations

3. **Monitoring During Tests**
   - Watch server CPU, memory, disk I/O
   - Monitor database connections
   - Check application error logs

4. **Result Documentation**
   - Save all reports with timestamps
   - Document configuration changes
   - Track performance trends

5. **Iterative Testing**
   - Test early and often
   - Identify bottlenecks early
   - Measure improvement after fixes

## Reporting

### Generate Summary Report

```bash
# View HTML report
# Windows
start report/report_20260218_120000/index.html

# Linux
xdg-open report/report_20260218_120000/index.html

# Mac
open report/report_20260218_120000/index.html
```

### Export Results

Results are saved as:
- `results.jtl` - JMeter results file (CSV format)
- `jmeter.log` - JMeter execution log

Import into external tools:
- Excel/Google Sheets for analysis
- Grafana for visualization
- Jenkins for CI/CD integration

## Continuous Integration

### Jenkins Integration

```groovy
stage('Load Test') {
    steps {
        sh 'cd load-test && ./run-test.sh'
        publishHTML([
            reportDir: 'load-test/report',
            reportFiles: 'index.html',
            reportName: 'JMeter Load Test'
        ])
    }
}
```

### GitHub Actions Integration

```yaml
- name: Run Load Test
  run: |
    cd load-test
    ./run-test.sh

- name: Upload Report
  uses: actions/upload-artifact@v2
  with:
    name: jmeter-report
    path: load-test/report/
```

## Support & Resources

- **JMeter Documentation:** https://jmeter.apache.org/
- **JMeter Best Practices:** https://jmeter.apache.org/usermanual/best-practices.html
- **API Documentation:** See project README

## Version History

- **v1.0 (2026-02-18)**
  - Initial load test plan
  - 3 concurrent user scenarios
  - HTML report generation
  - Run scripts for Windows and Linux
