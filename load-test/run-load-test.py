#!/usr/bin/env python3
"""
Load Test Runner and Report Generator for Lab Test Booking API
Automates JMeter test execution and generates detailed performance analysis
"""

import os
import sys
import json
import csv
import subprocess
import statistics
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Tuple


@dataclass
class TestResult:
    """Represents a single test result"""
    timestamp: str
    label: str
    response_time: int
    connect_time: int
    latency: int
    bytes_sent: int
    bytes_received: int
    success: bool
    response_code: str
    response_message: str
    thread_name: str


class LoadTestAnalyzer:
    """Analyzes JMeter load test results"""
    
    def __init__(self, results_file: str):
        self.results_file = results_file
        self.results: List[TestResult] = []
        self.load_results()
    
    def load_results(self):
        """Load results from JTL CSV file"""
        if not os.path.exists(self.results_file):
            print(f"Error: Results file {self.results_file} not found")
            return
        
        with open(self.results_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                result = TestResult(
                    timestamp=row.get('timeStamp', ''),
                    label=row.get('label', ''),
                    response_time=int(row.get('elapsed', 0)),
                    connect_time=int(row.get('Connect', 0)),
                    latency=int(row.get('Latency', 0)),
                    bytes_sent=int(row.get('sentBytes', 0)),
                    bytes_received=int(row.get('bytes', 0)),
                    success=row.get('success', 'false').lower() == 'true',
                    response_code=row.get('responseCode', ''),
                    response_message=row.get('responseMessage', ''),
                    thread_name=row.get('threadName', '')
                )
                self.results.append(result)
    
    def get_summary_by_label(self) -> Dict:
        """Generate summary statistics grouped by test label"""
        summary = {}
        
        # Group results by label
        labels = {}
        for result in self.results:
            if result.label not in labels:
                labels[result.label] = []
            labels[result.label].append(result)
        
        # Calculate statistics for each label
        for label, results in labels.items():
            response_times = [r.response_time for r in results]
            successful = sum(1 for r in results if r.success)
            
            summary[label] = {
                'total_requests': len(results),
                'successful': successful,
                'failed': len(results) - successful,
                'error_rate': round((len(results) - successful) / len(results) * 100, 2),
                'response_time': {
                    'min': min(response_times),
                    'max': max(response_times),
                    'avg': round(statistics.mean(response_times), 2),
                    'median': statistics.median(response_times),
                    'stdev': round(statistics.stdev(response_times), 2) if len(response_times) > 1 else 0,
                    'p50': self._percentile(response_times, 50),
                    'p95': self._percentile(response_times, 95),
                    'p99': self._percentile(response_times, 99),
                },
                'throughput': round(len(results) / (max([int(r.timestamp) for r in results]) - 
                                                   min([int(r.timestamp) for r in results]) + 1) * 1000, 2),
                'bytes': {
                    'sent': sum(r.bytes_sent for r in results),
                    'received': sum(r.bytes_received for r in results),
                    'avg_sent': round(statistics.mean([r.bytes_sent for r in results]), 2),
                    'avg_received': round(statistics.mean([r.bytes_received for r in results]), 2),
                }
            }
        
        return summary
    
    def get_overall_summary(self) -> Dict:
        """Generate overall test summary"""
        response_times = [r.response_time for r in self.results]
        successful = sum(1 for r in self.results if r.success)
        
        return {
            'test_duration': (max([int(r.timestamp) for r in self.results]) - 
                            min([int(r.timestamp) for r in self.results])) / 1000,
            'total_requests': len(self.results),
            'successful': successful,
            'failed': len(self.results) - successful,
            'error_rate': round((len(self.results) - successful) / len(self.results) * 100, 2),
            'overall_throughput': round(len(self.results) / ((max([int(r.timestamp) for r in self.results]) - 
                                                            min([int(r.timestamp) for r in self.results]) + 1) / 1000), 2),
            'response_time': {
                'min': min(response_times),
                'max': max(response_times),
                'avg': round(statistics.mean(response_times), 2),
                'median': statistics.median(response_times),
                'stdev': round(statistics.stdev(response_times), 2) if len(response_times) > 1 else 0,
                'p50': self._percentile(response_times, 50),
                'p95': self._percentile(response_times, 95),
                'p99': self._percentile(response_times, 99),
            }
        }
    
    def get_error_summary(self) -> Dict:
        """Get error details"""
        errors = {}
        for result in self.results:
            if not result.success:
                key = f"{result.response_code}: {result.response_message}"
                if key not in errors:
                    errors[key] = 0
                errors[key] += 1
        return errors
    
    @staticmethod
    def _percentile(data: List[int], percentile: float) -> int:
        """Calculate percentile value"""
        sorted_data = sorted(data)
        index = (len(sorted_data) - 1) * percentile / 100
        lower = int(index)
        upper = lower + 1
        
        if upper >= len(sorted_data):
            return sorted_data[lower]
        
        return int(sorted_data[lower] + (sorted_data[upper] - sorted_data[lower]) * 
                  (index - lower))


def run_jmeter_test(test_plan: str, results_file: str, report_dir: str) -> bool:
    """
    Run JMeter test
    
    Args:
        test_plan: Path to JMeter test plan (.jmx file)
        results_file: Output results file (.jtl)
        report_dir: Directory for HTML report
    
    Returns:
        True if test succeeded, False otherwise
    """
    print("=" * 50)
    print("Lab Test Booking API - Load Test Runner")
    print("=" * 50)
    print()
    
    # Check if JMeter is installed
    jmeter_path = find_jmeter()
    if not jmeter_path:
        print("ERROR: JMeter not found in system PATH or JMETER_HOME")
        print("Please install JMeter or set JMETER_HOME environment variable")
        return False
    
    print(f"✓ JMeter found at: {jmeter_path}")
    
    # Verify test plan exists
    if not os.path.exists(test_plan):
        print(f"ERROR: Test plan not found: {test_plan}")
        return False
    
    print(f"✓ Test plan found: {test_plan}")
    
    # Create report directory
    os.makedirs(report_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    report_path = os.path.join(report_dir, f"report_{timestamp}")
    
    print(f"✓ Report directory: {report_path}")
    print()
    
    # Prepare JMeter command
    cmd = [
        jmeter_path,
        '-n',
        '-t', os.path.abspath(test_plan),
        '-l', os.path.abspath(results_file),
        '-j', 'jmeter.log',
        '-e',
        '-o', report_path
    ]
    
    print("Starting JMeter test...")
    print()
    
    try:
        result = subprocess.run(cmd, check=False)
        
        if result.returncode != 0:
            print("ERROR: JMeter test failed")
            return False
        
        print()
        print("=" * 50)
        print("✓ Test Completed Successfully!")
        print("=" * 50)
        print()
        print(f"Results file: {os.path.abspath(results_file)}")
        print(f"HTML Report: {report_path}/index.html")
        print()
        
        return True
    
    except Exception as e:
        print(f"ERROR: Failed to run JMeter: {e}")
        return False


def find_jmeter() -> str:
    """Find jmeter executable"""
    # Check JMETER_HOME environment variable
    jmeter_home = os.getenv('JMETER_HOME')
    if jmeter_home:
        jmeter_bin = os.path.join(jmeter_home, 'bin', 'jmeter.bat' if os.name == 'nt' else 'jmeter')
        if os.path.exists(jmeter_bin):
            return jmeter_bin
    
    # Check system PATH
    jmeter_cmd = 'jmeter.bat' if os.name == 'nt' else 'jmeter'
    result = subprocess.run(['where' if os.name == 'nt' else 'which', jmeter_cmd], 
                          capture_output=True, text=True)
    if result.returncode == 0:
        return result.stdout.strip()
    
    return None


def generate_json_report(analyzer: LoadTestAnalyzer, output_file: str):
    """Generate JSON report"""
    report = {
        'generated_at': datetime.now().isoformat(),
        'overall': analyzer.get_overall_summary(),
        'by_label': analyzer.get_summary_by_label(),
        'errors': analyzer.get_error_summary()
    }
    
    with open(output_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"✓ JSON report generated: {output_file}")


def print_console_report(analyzer: LoadTestAnalyzer):
    """Print summary report to console"""
    print()
    print("=" * 80)
    print("LOAD TEST SUMMARY REPORT")
    print("=" * 80)
    print()
    
    # Overall summary
    overall = analyzer.get_overall_summary()
    print("OVERALL STATISTICS")
    print("-" * 80)
    print(f"Test Duration: {overall['test_duration']:.1f} seconds")
    print(f"Total Requests: {overall['total_requests']}")
    print(f"Successful: {overall['successful']} | Failed: {overall['failed']}")
    print(f"Error Rate: {overall['error_rate']}%")
    print(f"Overall Throughput: {overall['overall_throughput']:.2f} req/sec")
    print()
    print("RESPONSE TIME (ms)")
    print("-" * 80)
    rt = overall['response_time']
    print(f"Min: {rt['min']:<6} | Max: {rt['max']:<6} | Avg: {rt['avg']:<8} | "
          f"Median: {rt['median']:<6}")
    print(f"P50: {rt['p50']:<6} | P95: {rt['p95']:<6} | P99: {rt['p99']:<6} | "
          f"StDev: {rt['stdev']:<8}")
    print()
    
    # By label summary
    by_label = analyzer.get_summary_by_label()
    print("BY ENDPOINT STATISTICS")
    print("-" * 80)
    print(f"{'Label':<30} {'Samples':<10} {'Avg (ms)':<10} {'Error %':<10} {'P95':<10} {'Throughput':<12}")
    print("-" * 80)
    
    for label, stats in by_label.items():
        avg_rt = stats['response_time']['avg']
        p95 = stats['response_time']['p95']
        error_rate = stats['error_rate']
        throughput = stats['throughput']
        samples = stats['total_requests']
        
        print(f"{label:<30} {samples:<10} {avg_rt:<10.2f} {error_rate:<10.2f} "
              f"{p95:<10} {throughput:<12.2f}")
    
    print()
    
    # Error summary
    errors = analyzer.get_error_summary()
    if errors:
        print("ERROR DETAILS")
        print("-" * 80)
        for error, count in sorted(errors.items(), key=lambda x: x[1], reverse=True):
            print(f"{error}: {count}")
        print()


def main():
    """Main entry point"""
    if len(sys.argv) > 1 and sys.argv[1] == 'analyze':
        # Analyze existing results
        results_file = sys.argv[2] if len(sys.argv) > 2 else 'results.jtl'
        analyzer = LoadTestAnalyzer(results_file)
        print_console_report(analyzer)
        
        # Generate JSON report
        json_report = results_file.replace('.jtl', '_report.json')
        generate_json_report(analyzer, json_report)
    else:
        # Run test and analyze
        test_plan = 'LabTestAPI.jmx'
        results_file = 'results.jtl'
        report_dir = 'report'
        
        if run_jmeter_test(test_plan, results_file, report_dir):
            print("Analyzing results...")
            analyzer = LoadTestAnalyzer(results_file)
            print_console_report(analyzer)
            
            # Generate JSON report
            json_report = results_file.replace('.jtl', '_report.json')
            generate_json_report(analyzer, json_report)
            print()
            print("✓ All reports generated successfully!")
        else:
            sys.exit(1)


if __name__ == '__main__':
    main()
