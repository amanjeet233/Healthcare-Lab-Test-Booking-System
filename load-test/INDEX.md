# Lab Test Booking API - Load Testing Suite

Complete, production-ready load testing infrastructure with JMeter test plans, automation scripts, and comprehensive documentation.

## 📋 Quick Navigation

| Need | File | Time |
|------|------|------|
| **Get Started** | [QUICK_START.md](QUICK_START.md) | 5 min |
| **Full Guide** | [README.md](README.md) | 15 min |
| **File Details** | [FILE_REFERENCE.md](FILE_REFERENCE.md) | 10 min |
| **Run Test (Windows)** | `run-test.bat` | 1 click |
| **Run Test (Linux/Mac)** | `./run-test.sh` | 1 command |
| **Python Runner** | `python3 run-load-test.py` | 1 command |

---

## 🚀 30-Second Start

### Prerequisites
- API running on `http://localhost:8080`
- Java 8+ installed (for JMeter)
- 5-minute spare time

### Steps
**Step 1:** Get JWT token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

**Step 2:** Update token in `LabTestAPI.jmx` (find `JWT_TOKEN`)

**Step 3:** Run test
```bash
# Windows
run-test.bat

# Linux/Mac
./run-test.sh

# Python (any OS)
python3 run-load-test.py
```

**Step 4:** View results → `report/report_YYYYMMDD_HHMMSS/index.html`

---

## 📊 What Gets Tested

### Three Load Scenarios

| Scenario | Users | Duration | Requests | Tests |
|----------|-------|----------|----------|-------|
| **Search Tests** | 100 | 5 min | ~1,000 | Lab test search, filter, list |
| **Create Bookings** | 50 | 5 min | ~500 | Booking creation, slot selection |
| **Download Reports** | 20 | 5 min | ~160 | PDF report generation, download |

**Total Load:** 170 concurrent users | **Total Requests:** ~1,660

---

## 📈 Metrics Measured

### Performance Indicators
- ✅ **Response Times:** Average, Min, Max, P50, P95, P99
- ✅ **Throughput:** Requests/second, Requests/minute
- ✅ **Error Rates:** % failed requests, error breakdown
- ✅ **Data Transfer:** Bytes sent/received
- ✅ **Concurrency:** Active threads over time

### Reports Generated
- HTML Dashboard with graphs and statistics
- JSON report for automated analysis
- Raw CSV results for spreadsheet analysis
- Detailed error logs

---

## 📁 File Structure

```
load-test/
├── LabTestAPI.jmx              # JMeter test plan
├── config.json                  # Configuration (API URL, params)
├── run-test.bat                # Windows executor
├── run-test.sh                 # Linux/Mac executor
├── run-load-test.py           # Python cross-platform runner
├── docker-compose.yml          # Container orchestration
│
├── README.md                   # Complete documentation
├── QUICK_START.md             # 5-minute quick start
├── FILE_REFERENCE.md          # Detailed file reference
├── INDEX.md                   # This file
│
└── results/                   # Auto-created during tests
    ├── results.jtl           # Raw results (CSV)
    ├── jmeter.log            # Execution log
    └── results_report.json   # Parsed analysis
```

---

## 🎯 When to Use This Suite

✅ **Use for:**
- Pre-deployment performance validation
- Baseline establishment before optimization
- Regression testing after code changes
- SLA verification (response time, throughput)
- Capacity planning (how many users can the system handle?)
- Bottleneck identification

✅ **Also great for:**
- Load testing in CI/CD pipelines
- Performance trend tracking
- Client demos ("our system handles 170 concurrent users!")
- Stress testing (gradually increase load to breaking point)

---

## 📋 Test Scenarios Explained

### Scenario 1: Search Tests (100 Users)
*Simulates users browsing and searching lab tests*

**Endpoints tested:**
- `GET /api/lab-tests/search?search=blood&page=X`
- `GET /api/lab-tests?page=X`

**Expected performance:**
- Response time: 150-200ms (average)
- P95: 400-500ms
- Throughput: 300+ requests/minute
- Error rate: < 0.5%

**What we measure:**
- Search responsiveness
- Database query efficiency
- Pagination performance
- Caching effectiveness

---

### Scenario 2: Create Bookings (50 Users)
*Simulates users making test booking reservations*

**Endpoints tested:**
- `POST /api/bookings` (create booking)

**Request payload:**
```json
{
  "labTestId": 1-10,
  "bookingDate": "2026-02-18T09:00:00",
  "slotTime": "09:00 AM",
  "labPartnerId": 1-5,
  "addressType": "HOME"
}
```

**Expected performance:**
- Response time: 200-250ms (average)
- P95: 500-600ms
- Throughput: 150+ requests/minute
- Error rate: < 0.5%

**What we measure:**
- Database write performance
- Transaction handling
- Booking slot availability check
- Business logic execution time

---

### Scenario 3: Download Reports (20 Users)
*Simulates users downloading lab report PDFs*

**Endpoints tested:**
- `GET /api/reports/{id}/pdf`

**Expected performance:**
- Response time: 300-400ms (average)
- P95: 600-800ms
- Throughput: 60+ requests/minute
- Error rate: < 0.5%

**What we measure:**
- PDF generation performance
- File download efficiency
- Large payload handling
- Memory usage under load

---

## 📊 How to Interpret Results

### Good Performance ✅
```
Error Rate: 0%
Average Response: 200ms
P95 Response: 500ms
Throughput: 300+ req/sec
```
→ **System ready for production**

### Acceptable Performance ⚠️
```
Error Rate: < 1%
Average Response: 500-1000ms
P95 Response: 1000-2000ms
Throughput: 200+ req/sec
```
→ **Monitor in production, optimize soon**

### Poor Performance ❌
```
Error Rate: > 1%
Average Response: > 1000ms
P95 Response: > 2000ms
Timeouts occurring
```
→ **Optimization required before production**

---

## 🔧 Customization Examples

### Increase Load (2x)
Edit `LabTestAPI.jmx`:
```xml
<!-- Change from 100 to 200 -->
<stringProp name="ThreadGroup.num_threads">200</stringProp>
```

### Extend Duration (10 minutes)
```xml
<!-- Change from 300 to 600 seconds -->
<stringProp name="ThreadGroup.duration">600</stringProp>
```

### Add Custom Variable
```xml
<elementProp name="CUSTOM_VAR">
  <stringProp name="Argument.name">CUSTOM_VAR</stringProp>
  <stringProp name="Argument.value">my_custom_value</stringProp>
</elementProp>
```

---

## ⚙️ System Requirements

### Minimum
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 500 MB free
- **OS:** Windows/Linux/Mac
- **Java:** 8 or later

### Recommended
- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Disk:** 2+ GB free
- **Java:** Java 11+ (LTS)

### JMeter Installation
```bash
# Windows
choco install jmeter  # or download from apache.org

# Linux
sudo apt-get install jmeter  # Debian/Ubuntu

# Mac
brew install jmeter

# Or download: https://jmeter.apache.org/download_jmeter.cgi
```

---

## 🐳 Docker Alternative

Run everything containerized (API, Database, Redis, JMeter):

```bash
# Start all services
docker-compose up -d

# Results appear in: ./results/
# Reports appear in: ./report/

# Stop services
docker-compose down
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" | Verify API running: `curl http://localhost:8080/health` |
| "401 Unauthorized" | Update JWT token in test plan |
| "High error rate" | Reduce users or check server logs |
| "Out of memory" | Increase JVM: `-Xms512m -Xmx2048m` |
| "Slow responses" | Check server CPU/memory usage |

→ See [QUICK_START.md](QUICK_START.md) for more troubleshooting

---

## 📚 Documentation Map

1. **Getting Started** → [QUICK_START.md](QUICK_START.md)
   - 5-step setup
   - Common issues
   - Quick customization

2. **Complete Guide** → [README.md](README.md)
   - Detailed scenario descriptions
   - Installation walkthrough
   - Result interpretation
   - Performance tuning
   - CI/CD integration

3. **File Reference** → [FILE_REFERENCE.md](FILE_REFERENCE.md)
   - Each file explained
   - Usage workflows
   - Customization guide
   - Generated files reference

4. **Configuration** → [config.json](config.json)
   - API parameters
   - Test scenario details
   - Performance targets
   - Monitoring thresholds

---

## ✨ Key Features

✅ **Production-Ready**
- 170 concurrent users across 3 scenarios
- Realistic API paths and payloads
- Error handling and assertions
- Token-based authentication

✅ **Easy to Use**
- One-click execution (batch script)
- Cross-platform Python runner
- Automatic report generation
- No coding required

✅ **Comprehensive Analysis**
- HTML dashboard with graphs
- JSON export for automation
- Percentile statistics (P50, P95, P99)
- Error breakdown

✅ **Flexible**
- Easily adjust user load
- Customize endpoints and payloads
- Extend for new scenarios
- Docker support

✅ **Well Documented**
- 15+ pages of documentation
- Examples and best practices
- Troubleshooting guide
- Performance targets

---

## 🚀 Quick Commands

```bash
# Run test (Windows)
run-test.bat

# Run test (Linux/Mac)
./run-test.sh

# Run test (Any OS, Python)
python3 run-load-test.py

# Analyze existing results
python3 run-load-test.py analyze results.jtl

# Run with Docker
docker-compose up -d

# View report
open report/report_*/index.html  # Mac
xdg-open report/report_*/index.html  # Linux
start report/report_*/index.html  # Windows
```

---

## 📈 Performance Benchmarks

### Expected Throughput (Single Server)
| Operation | Target | Baseline |
|-----------|--------|----------|
| Search | 300 req/min | ✅ |
| Booking | 150 req/min | ✅ |
| Report | 60 req/min | ✅ |

### Expected Response Times
| Operation | Avg | P95 | P99 |
|-----------|-----|-----|-----|
| Search | 150-200ms | 400-500ms | 800-1000ms |
| Booking | 200-250ms | 500-600ms | 1000-1200ms |
| Report | 300-400ms | 600-800ms | 1200-1800ms |

---

## 🎓 Learning Path

1. **5 min:** Read [QUICK_START.md](QUICK_START.md)
2. **5 min:** Get JWT token and update config
3. **5 min:** Run first test
4. **10 min:** Review results and metrics
5. **15 min:** Read full [README.md](README.md)
6. **Custom:** Adjust scenarios for your needs

---

## 📞 Support

- **Questions?** Check the relevant documentation file
- **Issues?** See troubleshooting sections
- **Custom scenarios?** Edit [LabTestAPI.jmx](LabTestAPI.jmx)
- **Need CI/CD?** See [README.md](README.md) Jenkins/GitHub sections

---

## 🎯 Next Steps

1. ✅ Review this page for overview
2. ✅ Follow [QUICK_START.md](QUICK_START.md) for 5-minute setup
3. ✅ Run first test
4. ✅ Review results in HTML report
5. ✅ Read [README.md](README.md) for advanced features
6. ✅ Customize for your specific needs

---

## 📝 Version

- **Suite Version:** 1.0
- **JMeter Version:** 5.5+
- **Python Version:** 3.6+
- **Created:** 2026-02-18
- **Status:** Production Ready

---

## 📄 File Manifest

- ✅ `LabTestAPI.jmx` - JMeter test plan (15KB)
- ✅ `config.json` - Configuration reference (3KB)
- ✅ `run-test.bat` - Windows batch executor
- ✅ `run-test.sh` - Linux/Mac shell executor
- ✅ `run-load-test.py` - Python runner/analyzer (8KB)
- ✅ `docker-compose.yml` - Container orchestration
- ✅ `README.md` - Full documentation (12KB)
- ✅ `QUICK_START.md` - Quick reference (4KB)
- ✅ `FILE_REFERENCE.md` - Detailed file guide (6KB)
- ✅ `INDEX.md` - This navigation page

**Total:** 10 files, ~50KB of resources

---

Happy load testing! 🚀

**Questions?** Start with [QUICK_START.md](QUICK_START.md)
**Need details?** See [README.md](README.md)
**Looking for files?** Check [FILE_REFERENCE.md](FILE_REFERENCE.md)
