import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (renderTime > 16) { // More than 16ms indicates potential performance issue
      console.warn(`Performance warning: ${componentName} took ${renderTime.toFixed(2)}ms to render`);
    }

    // Log metrics for analysis
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now()
    };

    // Store in session storage for debugging
    if (typeof window !== 'undefined') {
      const existingMetrics = JSON.parse(sessionStorage.getItem('performance-metrics') || '[]');
      existingMetrics.push(metrics);
      
      // Keep only last 100 entries
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      sessionStorage.setItem('performance-metrics', JSON.stringify(existingMetrics));
    }
  });

  return {
    renderCount: renderCount.current,
    getMetrics: () => {
      if (typeof window !== 'undefined') {
        return JSON.parse(sessionStorage.getItem('performance-metrics') || '[]');
      }
      return [];
    },
    clearMetrics: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('performance-metrics');
      }
    }
  };
}

export function useMemoryMonitor() {
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const limitMB = memory.jsHeapSizeLimit / 1024 / 1024;
        
        if (usedMB > limitMB * 0.8) {
          console.warn(`Memory usage high: ${usedMB.toFixed(2)}MB / ${limitMB.toFixed(2)}MB`);
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);
}

export function useNetworkMonitor() {
  useEffect(() => {
    const checkConnection = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
          console.warn('Slow network detected, consider enabling data saving mode');
        }
      }
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', () => console.warn('Network offline'));
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', () => {});
    };
  }, []);
}