'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

  const statisticsData = useMemo(() => {
    return Object.entries(data.statistics)
      .filter(([_, stats]: [string, any]) => stats.type === 'numeric')
      .slice(0, 8)
      .map(([col, stats]: [string, any]) => ({
        name: col,
        mean: stats.mean || 0,
        std: stats.std || 0,
        min: stats.min || 0,
        max: stats.max || 0
      }));
  }, [data.statistics]);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{data.total_rows}</div>
              <div className="text-xs text-slate-400 mt-1">Total Rows</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{data.num_columns}</div>
              <div className="text-xs text-slate-400 mt-1">Columns</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">{Object.keys(data.statistics).length}</div>
              <div className="text-xs text-slate-400 mt-1">Numeric Features</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CardHeader>
          <CardTitle className="text-white">Dataset Analysis</CardTitle>
          <CardDescription className="text-slate-400">
            Statistical overview and data preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stats" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-800">
              <TabsTrigger value="stats" className="text-slate-300">Statistics</TabsTrigger>
              <TabsTrigger value="preview" className="text-slate-300">Preview</TabsTrigger>
              <TabsTrigger value="distribution" className="text-slate-300">Distribution</TabsTrigger>
            </TabsList>

            {/* Statistics Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-300">Feature</TableHead>
                      <TableHead className="text-slate-300 text-right">Mean</TableHead>
                      <TableHead className="text-slate-300 text-right">Std Dev</TableHead>
                      <TableHead className="text-slate-300 text-right">Min</TableHead>
                      <TableHead className="text-slate-300 text-right">Max</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(data.statistics)
                      .filter(([_, stats]: [string, any]) => stats.type === 'numeric')
                      .slice(0, 12)
                      .map(([feature, stats]: [string, any]) => (
                        <TableRow key={feature} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-slate-300">{feature}</TableCell>
                          <TableCell className="text-right text-slate-400">{stats.mean?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell className="text-right text-slate-400">{stats.std?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell className="text-right text-slate-400">{stats.min?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell className="text-right text-slate-400">{stats.max?.toFixed(2) || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="text-sm text-slate-400 mb-3">
                Showing first {Math.min(data.preview.length, 40)} rows of {data.total_rows} total
              </div>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-800">
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      {data.columns.slice(0, 6).map((col) => (
                        <TableHead key={col} className="text-slate-300 whitespace-nowrap">
                          {col}
                        </TableHead>
                      ))}
                      {data.columns.length > 6 && (
                        <TableHead className="text-slate-300">+{data.columns.length - 6} more</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.preview.map((row, idx) => (
                      <TableRow key={idx} className="border-slate-700 hover:bg-slate-800/50">
                        {data.columns.slice(0, 6).map((col) => (
                          <TableCell key={col} className="text-slate-400 whitespace-nowrap text-sm">
                            {String(row[col] || '-')}
                          </TableCell>
                        ))}
                        {data.columns.length > 6 && (
                          <TableCell className="text-slate-400 text-sm">...</TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Distribution Tab */}
            <TabsContent value="distribution" className="space-y-4">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={statisticsData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#9CA3AF' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
                  />
                  <Bar dataKey="mean" fill="#A855F7" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="std" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
