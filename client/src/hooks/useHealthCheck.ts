import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface HealthStatus {
  api: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  youtube: 'healthy' | 'degraded' | 'down';
  tmdb: 'healthy' | 'degraded' | 'down';
  lastChecked: Date;
}

export function useHealthCheck(intervalMs: number = 60000) {
  const [health, setHealth] = useState<HealthStatus>({
    api: 'healthy',
    database: 'healthy',
    youtube: 'healthy',
    tmdb: 'healthy',
    lastChecked: new Date()
  });

  const checkHealth = async () => {
    const newHealth: HealthStatus = {
      api: 'healthy',
      database: 'healthy',
      youtube: 'healthy',
      tmdb: 'healthy',
      lastChecked: new Date()
    };

    try {
      // Check API health
      const response = await fetch('/api/health', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        newHealth.api = 'down';
      }

      const healthData = await response.json();
      
      // Check individual services
      if (healthData.youtube === false) {
        newHealth.youtube = 'down';
      }
      
      if (healthData.tmdb === false) {
        newHealth.tmdb = 'down';
      }
      
      if (healthData.database === false) {
        newHealth.database = 'down';
      }

    } catch (error) {
      console.warn('Health check failed:', error);
      newHealth.api = 'down';
    }

    setHealth(newHealth);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    health,
    refresh: checkHealth,
    isHealthy: health.api === 'healthy' && health.database === 'healthy'
  };
}