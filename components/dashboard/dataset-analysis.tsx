'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DatasetAnalysisProps {
  data: {
    total_rows: number;
    columns: string[];
    num_columns: number;
    preview: any[];
    statistics: Record<string, any>;
  } | null;
  loading?: boolean;
}

export function DatasetAnalysis({ data, loading }: DatasetAnalysisProps) {
  if (!data) {
    return null;
  }

  const numericStats = useMemo(() => {
    try {
      return Object.entries(data.statistics || {})
        .filter(([_, stats]: [string, any]) => stats?.type === 'numeric')
        .slice(0, 12);
    } catch {
      return [];
    }
  }, [data.statistics]);

  const statisticsData = useMemo(() => {
    try {
      return numericStats
        .slice(0, 8)
        .map(([col, stats]: [string, any]) => ({
          name: col,
          mean: typeof stats?.mean === 'number' ? stats.mean : 0,
          std: typeof stats?.std === 'number' ? stats.std : 0,
          min: typeof stats?.min === 'number' ? stats.min : 0,
          max: typeof stats?.max === 'number' ? stats.max : 0
        }));
    } catch {
      return [];
    }
  }, [numericStats]);

  const previewRows = useMemo(() => {
    try {
      return Array.isArray(data.preview) ? data.preview : [];
    } catch {
      return [];
    }
  }, [data.preview]);

  const columns = useMemo(() => {
    try {
      return Array.isArray(data.columns) ? data.columns : [];
    } catch {
      return [];
    }
  }, [data.columns]);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{data.total_rows || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Total Rows</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-white to-purple-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{data.num_columns || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Columns</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-white to-orange-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{numericStats.length || 0}</div>
              <div className="text-xs text-slate-500 mt-1">Numeric Features</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card className="border shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-slate-900">Dataset Analysis</CardTitle>
          <CardDescription className="text-slate-600">
            Statistical overview and data preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="stats" className="text-slate-700">Statistics</TabsTrigger>
              <TabsTrigger value="preview" className="text-slate-700">Preview</TabsTrigger>
              <TabsTrigger value="distribution" className="text-slate-700">Distribution</TabsTrigger>
            </TabsList>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      <TableHead className="text-slate-700">Feature</TableHead>
                      <TableHead className="text-slate-700 text-right">Mean</TableHead>
                      <TableHead className="text-slate-700 text-right">Std Dev</TableHead>
                      <TableHead className="text-slate-700 text-right">Min</TableHead>
                      <TableHead className="text-slate-700 text-right">Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {numericStats.length > 0 ? (
                      numericStats.map(([feature, stats]: [string, any]) => {
                        const mean = typeof stats?.mean === 'number' ? stats.mean.toFixed(2) : 'N/A';
                        const std = typeof stats?.std === 'number' ? stats.std.toFixed(2) : 'N/A';
                        const min = typeof stats?.min === 'number' ? stats.min.toFixed(2) : 'N/A';
                        const max = typeof stats?.max === 'number' ? stats.max.toFixed(2) : 'N/A';
                        
                        return (
                          <TableRow key={feature} className="border-slate-200 hover:bg-slate-50">
                            <TableCell className="font-medium text-slate-800">{feature}</TableCell>
                            <TableCell className="text-right text-slate-600">{mean}</TableCell>
                            <TableCell className="text-right text-slate-600">{std}</TableCell>
                            <TableCell className="text-right text-slate-600">{min}</TableCell>
                            <TableCell className="text-right text-slate-600">{max}</TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-slate-500 py-4">
                          No numeric features available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="text-sm text-slate-600 mb-3">
                Showing first {Math.min(previewRows.length, 40)} rows of {data.total_rows || 0} total
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-100">
                    <TableRow className="border-slate-200 hover:bg-transparent">
                      {columns.slice(0, 6).map((col) => (
                        <TableHead key={col} className="text-slate-700 whitespace-nowrap">
                          {String(col || '')}
                        </TableHead>
                      ))}
                      {columns.length > 6 && (
                        <TableHead className="text-slate-700">+{columns.length - 6} more</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.length > 0 ? (
                      previewRows.map((row, idx) => (
                        <TableRow key={idx} className="border-slate-200 hover:bg-slate-50">
                          {columns.slice(0, 6).map((col) => (
                            <TableCell key={col} className="text-slate-600 whitespace-nowrap text-sm">
                              {String(row?.[col] || '-')}
                            </TableCell>
                          ))}
                          {columns.length > 6 && (
                            <TableCell className="text-slate-600 text-sm">...</TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={Math.min(columns.length, 6) + (columns.length > 6 ? 1 : 0)} className="text-center text-slate-500 py-4">
                          No preview data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="space-y-4">
              {statisticsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statisticsData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#1e293b'
                      }}
                      cursor={{ fill: 'rgba(96, 125, 255, 0.1)' }}
                    />
                    <Bar dataKey="mean" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="std" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-slate-500 py-8">
                  No distribution data available
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
