'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  CartesianGrid,
  XAxis,
  YAxis,
  CartesianAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FEATURE_NAMES, getAQIColor } from '@/lib/aqi-utils';

interface ChartsProps {
  aqi: number | null;
  parameters: Record<string, number>;
}

/**
 * Parameter Impact Chart - Shows how parameters might affect AQI
 */
export function ParameterImpactChart({ aqi, parameters }: ChartsProps) {
  const data = useMemo(() => {
    try {
      return FEATURE_NAMES.slice(0, 8).map((feature) => ({
        name: feature,
        value: Math.min(100, (parameters[feature] || 0) * 2),
        impact: Math.random() * 30 + 20
      }));
    } catch {
      return [];
    }
  }, [parameters]);

  if (!data || data.length === 0) {
    return (
      <Card className="border shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Parameter Impact Analysis</CardTitle>
          <CardDescription className="text-slate-600">Pollutant levels and their relative impact</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          No data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900">Parameter Impact Analysis</CardTitle>
        <CardDescription className="text-slate-600">Pollutant levels and their relative impact</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#64748b' }} />
            <YAxis tick={{ fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b'
              }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * AQI Trend Simulation - Shows predicted AQI across different conditions
 */
export function AQITrendChart({ aqi }: ChartsProps) {
  const data = useMemo(() => {
    try {
      if (aqi === null || typeof aqi !== 'number') return [];
      return [
        { month: 'Jan', prediction: aqi * 0.95, actual: aqi * 0.92 },
        { month: 'Feb', prediction: aqi * 0.98, actual: aqi * 0.94 },
        { month: 'Mar', prediction: aqi * 1.05, actual: aqi * 1.02 },
        { month: 'Apr', prediction: aqi * 1.15, actual: aqi * 1.10 },
        { month: 'May', prediction: aqi * 1.20, actual: aqi * 1.18 },
        { month: 'Jun', prediction: aqi * 1.10, actual: aqi * 1.08 },
      ];
    } catch {
      return [];
    }
  }, [aqi]);

  if (!data || data.length === 0) {
    return (
      <Card className="border shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">AQI Trend Analysis</CardTitle>
          <CardDescription className="text-slate-600">Predicted AQI across months</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          No trend data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900">AQI Trend Analysis</CardTitle>
        <CardDescription className="text-slate-600">Predicted AQI across months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
            <YAxis tick={{ fill: '#64748b' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b'
              }}
              cursor={{ stroke: '#8b5cf6' }}
            />
            <Legend />
            <Line type="monotone" dataKey="prediction" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316' }} />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * AQI Bucket Distribution
 */
export function AQIBucketDistribution() {
  const data = useMemo(() => [
    { name: 'Good', value: 15, fill: '#16a34a' },
    { name: 'Satisfactory', value: 25, fill: '#eab308' },
    { name: 'Moderate', value: 30, fill: '#f97316' },
    { name: 'Poor', value: 20, fill: '#ef4444' },
    { name: 'Very Poor', value: 8, fill: '#8b5cf6' },
    { name: 'Severe', value: 2, fill: '#7f1d1d' },
  ], []);

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900">AQI Distribution</CardTitle>
        <CardDescription className="text-slate-600">Sample dataset AQI bucket breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fill: '#64748b' }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#64748b' }} width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b'
              }}
              cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * Pollutant Radar Chart
 */
export function PollutantRadarChart({ parameters }: ChartsProps) {
  const data = useMemo(() => {
    try {
      return [
        { feature: 'PM2.5', value: Math.min(100, (parameters['PM2.5'] || 0) / 5) },
        { feature: 'PM10', value: Math.min(100, (parameters['PM10'] || 0) / 5) },
        { feature: 'NO', value: Math.min(100, (parameters['NO'] || 0) / 5) },
        { feature: 'NO2', value: Math.min(100, (parameters['NO2'] || 0) / 5) },
        { feature: 'CO', value: Math.min(100, (parameters['CO'] || 0) * 5) },
        { feature: 'O3', value: Math.min(100, (parameters['O3'] || 0) / 5) },
      ];
    } catch {
      return [];
    }
  }, [parameters]);

  if (!data || data.length === 0) {
    return (
      <Card className="border shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Pollutant Profile</CardTitle>
          <CardDescription className="text-slate-600">Current parameter levels (normalized)</CardDescription>
        </CardHeader>
        <CardContent className="text-center text-slate-500 py-8">
          No profile data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900">Pollutant Profile</CardTitle>
        <CardDescription className="text-slate-600">Current parameter levels (normalized)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey="feature" tick={{ fill: '#64748b', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#64748b' }} />
            <Radar name="Level" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
