# Load Testing Quick Start Guide

## 5-Minute Setup

### Step 1: Verify Prerequisites (1 min)

Ensure your API server is running:
```bash
curl http://localhost:8080/health
```

Expected response: `{"status":"UP"}`

### Step 2: Get Authentication Token (2 min)

Obtain a JWT token for testing:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Copy the `token` from the response.

### Step 3: Update Test Configuration (1 min)

Edit `LabTestAPI.jmx` and find this section:
```xml
<elementProp name="JWT_TOKEN" elementType="Argument">
  <stringProp name="Argument.value">YOUR_TOKEN_HERE</stringProp>
</elementProp>
```

Replace `YOUR_TOKEN_HERE` with your JWT token.

### Step 4: Run the Test (1 min)

**Windows:**
```batch
run-test.bat
```

**Linux/Mac:**
```bash
./run-test.sh
```

**Python (Cross-platform):**
```bash
python3 run-load-test.py
```

### Step 5: View Results

After the test completes, open the HTML report:
```
report/report_YYYYMMDD_HHMMSS/index.html
```

---

## Test Scenarios

### Scenario 1: Search Tests (100 Users)
- **What it tests:** Search functionality under load
- **Duration:** 5 minutes
- **Users:** 100 concurrent
- **Requests:** ~1,000 total

**Expected Results:**
- Average response time: 180-200ms
- Error rate: 0%
- Throughput: 200+ req/sec

### Scenario 2: Create Bookings (50 Users)
- **What it tests:** Booking creation under load
- **Duration:** 5 minutes
- **Users:** 50 concurrent
- **Requests:** ~500 total

**Expected Results:**
- Average response time: 250-300ms
- Error rate: < 1%
- Throughput: 100+ req/sec

### Scenario 3: Download Reports (20 Users)
- **What it tests:** Large file download performance
- **Duration:** 5 minutes
- **Users:** 20 concurrent
- **Requests:** ~160 total

**Expected Results:**
- Average response time: 400-500ms
- Error rate: 0%
- Throughput: 50+ req/sec

---

## Interpreting Results

### Key Metrics

| Metric | What It Means |
|--------|---------------|
| **Average Response Time** | Mean time for server to respond (lower is better) |
| **P95** | 95% of requests complete in this time |
| **P99** | 99% of requests complete in this time |
| **Throughput** | Requests processed per second |
| **Error Rate** | Percentage of failed requests |

### Sample Report Output

```
OVERALL STATISTICS
────────────────────────────────────────────────────────────
Test Duration: 300.0 seconds
Total Requests: 1660
Successful: 1655 | Failed: 5
Error Rate: 0.30%
Overall Throughput: 5.53 req/sec

RESPONSE TIME (ms)
────────────────────────────────────────────────────────────
Min: 45      | Max: 2500    | Avg: 250.00  | Median: 200
P50: 200     | P95: 500     | P99: 1000    | StDev: 150.00
```

### Quick Assessment

✅ **Good Performance (proceed to production)**
- Avg response time < 500ms
- P95 < 1000ms
- Error rate < 1%
- No timeouts

⚠️ **Acceptable (monitor production)**
- Avg response time 500-1000ms
- P95 1000-2000ms
- Error rate 1-2%
- Occasional timeouts

❌ **Poor Performance (requires optimization)**
- Avg response time > 1000ms
- P95 > 2000ms
- Error rate > 2%
- Frequent timeouts or failures

---

## Common Issues & Solutions

### Issue: "Connection refused"
```
Error: Connection refused to host: localhost:8080
```

**Solution:**
1. Verify API is running: `curl http://localhost:8080/health`
2. Check if port 8080 is correct
3. Verify firewall allows connections

### Issue: "401 Unauthorized"
```
Error: Unauthorized - Check your JWT token
```

**Solution:**
1. Get a fresh JWT token
2. Update the token in test configuration
3. Verify token hasn't expired

### Issue: High error rate (> 5%)
```
Failed: 100 | Error Rate: 6.0%
```

**Solution:**
1. Reduce concurrent users to 25% current value
2. Check server CPU/memory usage
3. Review API logs for errors
4. Check database performance

### Issue: Slow responses (> 2000ms)
```
Average: 2500ms | P95: 4000ms
```

**Solution:**
1. Check server resource usage
2. Review application logs
3. Check database query performance
4. Verify network connectivity

---

## Customizing Tests

### Increase Load

Edit `LabTestAPI.jmx` and change thread counts:
```xml
<!-- Search Tests - from 100 to 200 users -->
<stringProp name="ThreadGroup.num_threads">200</stringProp>

<!-- Create Bookings - from 50 to 100 users -->
<stringProp name="ThreadGroup.num_threads">100</stringProp>

<!-- Download Reports - from 20 to 50 users -->
<stringProp name="ThreadGroup.num_threads">50</stringProp>
```

### Extend Test Duration

Change test duration (in seconds):
```xml
<stringProp name="ThreadGroup.duration">600</stringProp>  <!-- 10 minutes -->
```

### Add Custom Headers

Add Authorization header for protected endpoints:
```xml
<HeaderManager>
  <elementProp name="Authorization">
    <stringProp name="Header.value">Bearer ${JWT_TOKEN}</stringProp>
  </elementProp>
</HeaderManager>
```

### Define Variables

Edit User Defined Variables section:
```xml
<elementProp name="MY_VARIABLE">
  <stringProp name="Argument.name">MY_VARIABLE</stringProp>
  <stringProp name="Argument.value">my_value</stringProp>
</elementProp>
```

---

## Running via Python

### Run Test and Generate Report
```bash
python3 run-load-test.py
```

### Analyze Existing Results
```bash
python3 run-load-test.py analyze results.jtl
```

### Output
- Console summary report
- JSON report: `results_report.json`
- HTML report: `report/report_YYYYMMDD_HHMMSS/index.html`

---

## Performance Benchmarks

### Expected Baseline Performance (Single Server)

| Scenario | Throughput | Avg Response | P95 | Error Rate |
|----------|-----------|--------------|-----|-----------|
| Search | 300+ req/min | 150-200ms | 400ms | < 0.5% |
| Booking | 150+ req/min | 200-250ms | 500ms | < 0.5% |
| Report | 60+ req/min | 300-400ms | 800ms | < 0.5% |

---

## Best Practices

1. **Baseline First**
   - Run with 25% load first
   - Document baseline metrics
   - Compare against previous runs

2. **Realistic Load**
   - Match production user behavior
   - Include think time between requests
   - Test during off-peak hours

3. **Monitor System**
   - Watch CPU, memory, disk I/O
   - Monitor database connections
   - Check application error logs

4. **Document Results**
   - Save reports with timestamps
   - Track performance trends
   - Document configuration changes

5. **Iterative Testing**
   - Test after each optimization
   - Identify bottlenecks early
   - Measure improvement impact

---

## Support

- **JMeter Docs:** https://jmeter.apache.org/
- **API Docs:** See project README
- **Issues:** Create GitHub issue with test results

---

## Troubleshooting Script

Run additional diagnostics:

**Windows:**
```batch
@echo off
echo Testing connectivity...
curl http://localhost:8080/health
echo.
echo Checking Java version...
java -version
echo.
echo Checking JMeter...
where jmeter
```

**Linux/Mac:**
```bash
echo "Testing connectivity..."
curl http://localhost:8080/health

echo ""
echo "Checking Java version..."
java -version

echo ""
echo "Checking JMeter..."
which jmeter
```

---

## Next Steps

1. ✅ Run initial load test
2. ✅ Review performance metrics
3. ✅ Identify bottlenecks
4. ✅ Optimize application/infrastructure
5. ✅ Re-run test to measure improvement
6. ✅ Set up continuous load testing in CI/CD

Good luck with your load testing! 🚀
