'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import {
  getAQIBucket,
  getAQIColor,
  getAQIDescription,
  getAQIRecommendation,
  formatAQI
} from '@/lib/aqi-utils';

interface PredictionCardProps {
  aqi: number | null;
  bucket: string | null;
  loading: boolean;
  error: string | null;
}

export function PredictionCard({ aqi, bucket, loading, error }: PredictionCardProps) {
  const bucketInfo = bucket ? getAQIBucket(bucket === 'Very Poor' ? 350 : (
    bucket === 'Good' ? 25 :
    bucket === 'Satisfactory' ? 75 :
    bucket === 'Moderate' ? 150 :
    bucket === 'Poor' ? 250 :
    450
  )) : null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner className="w-8 h-8 mb-4" />
          <p className="text-sm text-slate-400">Predicting AQI...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-900/20 border border-red-800">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">Prediction Error</p>
            <p className="text-xs text-red-200 mt-1">{error}</p>
          </div>
        </div>
      );
    }

    if (aqi === null || bucket === null) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">Load model and adjust parameters to predict</p>
        </div>
      );
    }

    const isGood = bucket === 'Good' || bucket === 'Satisfactory';

    return (
      <div className="space-y-4">
        {/* AQI Value Display */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center">
            <div
              className="relative w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${bucketInfo?.color}20, ${bucketInfo?.color}40)`,
                border: `3px solid ${bucketInfo?.color}`
              }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold" style={{ color: bucketInfo?.color }}>
                  {formatAQI(aqi)}
                </div>
                <div className="text-xs text-slate-400 mt-1">AQI Value</div>
              </div>
            </div>
          </div>

          {/* Bucket Badge */}
          <div
            className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: bucketInfo?.bgColor,
              color: bucketInfo?.textColor
            }}
          >
            {bucket}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 text-center">
          <p className="text-sm text-slate-300">
            {getAQIDescription(aqi)}
          </p>
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400">
            {isGood ? (
              <><CheckCircle className="w-4 h-4 text-green-400" /> Good conditions</>
            ) : (
              <><TrendingUp className="w-4 h-4 text-orange-400" /> Caution advised</>
            )}
          </div>
        </div>

        {/* Recommendation */}
        <div
          className="p-3 rounded-lg text-sm"
          style={{
            backgroundColor: bucketInfo?.bgColor
          }}
        >
          <p className="font-medium mb-1" style={{ color: bucketInfo?.textColor }}>
            Recommendation:
          </p>
          <p style={{ color: bucketInfo?.textColor }}>
            {getAQIRecommendation(aqi)}
          </p>
        </div>

        {/* Range Info */}
        <div className="text-xs text-slate-500 text-center">
          AQI {bucketInfo?.min} - {bucketInfo?.max} ({bucket})
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white">AQI Prediction</CardTitle>
        <CardDescription className="text-slate-400">
          Real-time air quality forecast
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
