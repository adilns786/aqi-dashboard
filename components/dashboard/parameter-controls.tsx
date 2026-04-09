'use client';

import React, { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FEATURE_NAMES, FEATURE_RANGES, FEATURE_DEFAULTS } from '@/lib/aqi-utils';
import { RotateCcw } from 'lucide-react';

interface ParameterControlsProps {
  values: Record<string, number>;
  onValuesChange: (values: Record<string, number>) => void;
}

export function ParameterControls({ values, onValuesChange }: ParameterControlsProps) {
  const handleSliderChange = useCallback((feature: string, newValue: number[]) => {
    const updatedValues = {
      ...values,
      [feature]: newValue[0]
    };
    onValuesChange(updatedValues);
  }, [values, onValuesChange]);

  const handleReset = useCallback(() => {
    onValuesChange(FEATURE_DEFAULTS);
  }, [onValuesChange]);

  // Group features into sections
  const pollutants = FEATURE_NAMES.slice(0, 12);
  const temporal = FEATURE_NAMES.slice(12);

  return (
    <div className="space-y-4">
      <Card className="border shadow-lg bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl text-slate-900">Parameter Controls</CardTitle>
              <CardDescription className="text-slate-600">
                Adjust pollutant levels and temporal features
              </CardDescription>
            </div>
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pollutants Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Air Pollutants
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
              {pollutants.map((feature) => {
                try {
                  const [min, max] = FEATURE_RANGES[feature] || [0, 100];
                  const value = values[feature] || FEATURE_DEFAULTS[feature] || 0;
                  return (
                    <div key={feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">
                          {feature}
                        </label>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-700">
                          {typeof value === 'number' ? value.toFixed(1) : '0'}
                        </span>
                      </div>
                      <Slider
                        min={min}
                        max={max}
                        step={0.1}
                        value={[typeof value === 'number' ? value : 0]}
                        onValueChange={(newValue) => handleSliderChange(feature, newValue)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{min}</span>
                        <span>{max}</span>
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          </div>

          {/* Temporal Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Temporal Features
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1">
              {temporal.map((feature) => {
                try {
                  const [min, max] = FEATURE_RANGES[feature] || [0, 100];
                  const value = values[feature] || FEATURE_DEFAULTS[feature] || 0;
                  
                  const getTemporalLabel = (feature: string, val: number) => {
                    try {
                      if (feature === 'Month') return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Math.floor(val) - 1] || 'N/A';
                      if (feature === 'DayOfWeek') return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][Math.floor(val)] || 'N/A';
                      return val.toFixed(0);
                    } catch {
                      return 'N/A';
                    }
                  };

                  return (
                    <div key={feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700">
                          {feature}
                        </label>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-100 text-blue-700">
                          {getTemporalLabel(feature, typeof value === 'number' ? value : 0)}
                        </span>
                      </div>
                      <Slider
                        min={min}
                        max={max}
                        step={feature === 'DayOfYear' ? 1 : 1}
                        value={[typeof value === 'number' ? value : 0]}
                        onValueChange={(newValue) => handleSliderChange(feature, newValue)}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{min}</span>
                        <span>{max}</span>
                      </div>
                    </div>
                  );
                } catch {
                  return null;
                }
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
