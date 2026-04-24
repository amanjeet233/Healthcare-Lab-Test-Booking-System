import type { Metric } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
            const logWithThresholds = (metric: Metric) => {
                onPerfEntry(metric);

                // Target Thresholds Check
                let isPoor = false;
                switch (metric.name) {
                    case 'FCP': isPoor = metric.value > 1500; break;
                    case 'LCP': isPoor = metric.value > 2500; break;
                    case 'CLS': isPoor = metric.value > 0.1; break;
                    default: break;
                }

                if (isPoor && import.meta.env.DEV) {
                    console.warn(`[Web Vitals] Poor Performance Detected: ${metric.name} = ${metric.value.toFixed(3)}`);
                }
            };

            onCLS(logWithThresholds);
            onINP(logWithThresholds);
            onFCP(logWithThresholds);
            onLCP(logWithThresholds);
            onTTFB(logWithThresholds);
        });
    }
};

export default reportWebVitals;
