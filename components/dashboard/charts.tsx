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
    // Create relative impact data based on parameter values vs defaults
    return FEATURE_NAMES.slice(0, 8).map((feature) => ({
      name: feature,
      value: Math.min(100, (parameters[feature] || 0) * 2),
      impact: Math.random() * 30 + 20 // Simulated impact
    }));
  }, [parameters]);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-white">Parameter Impact Analysis</CardTitle>
        <CardDescription className="text-slate-400">Pollutant levels and their relative impact</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
            />
            <Bar dataKey="value" fill="#A855F7" radius={[8, 8, 0, 0]} />
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
    if (aqi === null) return [];
    return [
      { month: 'Jan', prediction: aqi * 0.95, actual: aqi * 0.92 },
      { month: 'Feb', prediction: aqi * 0.98, actual: aqi * 0.94 },
      { month: 'Mar', prediction: aqi * 1.05, actual: aqi * 1.02 },
      { month: 'Apr', prediction: aqi * 1.15, actual: aqi * 1.10 },
      { month: 'May', prediction: aqi * 1.20, actual: aqi * 1.18 },
      { month: 'Jun', prediction: aqi * 1.10, actual: aqi * 1.08 },
    ];
  }, [aqi]);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-white">AQI Trend Analysis</CardTitle>
        <CardDescription className="text-slate-400">Predicted AQI across months</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} />
            <YAxis tick={{ fill: '#9CA3AF' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              cursor={{ stroke: '#A855F7' }}
            />
            <Legend />
            <Line type="monotone" dataKey="prediction" stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316' }} />
            <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
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
    { name: 'Good', value: 15, fill: '#10B981' },
    { name: 'Satisfactory', value: 25, fill: '#FBBF24' },
    { name: 'Moderate', value: 30, fill: '#F97316' },
    { name: 'Poor', value: 20, fill: '#EF4444' },
    { name: 'Very Poor', value: 8, fill: '#A855F7' },
    { name: 'Severe', value: 2, fill: '#7F1D1D' },
  ], []);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-white">AQI Distribution</CardTitle>
        <CardDescription className="text-slate-400">Sample dataset AQI bucket breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical" margin={{ left: 100, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis type="number" tick={{ fill: '#9CA3AF' }} />
            <YAxis dataKey="name" type="category" tick={{ fill: '#9CA3AF' }} width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
              cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
            />
            <Bar dataKey="value" fill="#A855F7" radius={[0, 8, 8, 0]} />
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
    return [
      { feature: 'PM2.5', value: Math.min(100, (parameters['PM2.5'] || 0) / 5) },
      { feature: 'PM10', value: Math.min(100, (parameters['PM10'] || 0) / 5) },
      { feature: 'NO', value: Math.min(100, (parameters['NO'] || 0) / 5) },
      { feature: 'NO2', value: Math.min(100, (parameters['NO2'] || 0) / 5) },
      { feature: 'CO', value: Math.min(100, (parameters['CO'] || 0) * 5) },
      { feature: 'O3', value: Math.min(100, (parameters['O3'] || 0) / 5) },
    ];
  }, [parameters]);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <CardHeader>
        <CardTitle className="text-white">Pollutant Profile</CardTitle>
        <CardDescription className="text-slate-400">Current parameter levels (normalized)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="feature" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <PolarRadiusAxis tick={{ fill: '#9CA3AF' }} />
            <Radar name="Level" dataKey="value" stroke="#A855F7" fill="#A855F7" fillOpacity={0.6} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
