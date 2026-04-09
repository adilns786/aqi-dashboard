'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { ParameterControls } from '@/components/dashboard/parameter-controls';
import { PredictionCard } from '@/components/dashboard/prediction-card';
import {
  ParameterImpactChart,
  AQITrendChart,
  AQIBucketDistribution,
  PollutantRadarChart
} from '@/components/dashboard/charts';
import { ModelUploader, DatasetUploader } from '@/components/dashboard/file-uploaders';
import { DatasetAnalysis } from '@/components/dashboard/dataset-analysis';
import { FEATURE_DEFAULTS } from '@/lib/aqi-utils';

interface PredictionResponse {
  success: boolean;
  aqi?: number;
  bucket?: string;
  error?: string;
}

interface AnalysisResponse {
  success?: boolean;
  total_rows?: number;
  columns?: string[];
  num_columns?: number;
  preview?: any[];
  statistics?: Record<string, any>;
  error?: string;
}

export default function Dashboard() {
  // State management
  const [parameters, setParameters] = useState(FEATURE_DEFAULTS);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(true);
  const [modelName, setModelName] = useState('aqi_model.pkl');
  const [datasetAnalysis, setDatasetAnalysis] = useState<AnalysisResponse | null>(null);
  const [datasetLoading, setDatasetLoading] = useState(false);
  const [datasetError, setDatasetError] = useState<string | null>(null);
  const predictionTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch prediction when parameters change
  useEffect(() => {
    if (predictionTimeout.current) {
      clearTimeout(predictionTimeout.current);
    }

    predictionTimeout.current = setTimeout(() => {
      if (modelLoaded) {
        fetchPrediction();
      }
    }, 500); // Debounce 500ms

    return () => {
      if (predictionTimeout.current) {
        clearTimeout(predictionTimeout.current);
      }
    };
  }, [parameters, modelLoaded]);

  const fetchPrediction = useCallback(async () => {
    setLoading(true);
    try {
      const features = [
        parameters['PM2.5'],
        parameters['PM10'],
        parameters['NO'],
        parameters['NO2'],
        parameters['NOx'],
        parameters['NH3'],
        parameters['CO'],
        parameters['SO2'],
        parameters['O3'],
        parameters['Benzene'],
        parameters['Toluene'],
        parameters['Xylene'],
        parameters['Month'],
        parameters['DayOfYear'],
        parameters['DayOfWeek'],
        parameters['Year']
      ];

      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelPath: 'public/aqi_model.pkl',
          features
        })
      });

      const data: PredictionResponse = await response.json();
      setPrediction(data);
    } catch (error) {
      setPrediction({
        success: false,
        error: error instanceof Error ? error.message : 'Prediction failed'
      });
    } finally {
      setLoading(false);
    }
  }, [parameters, modelLoaded]);

  const handleModelUpload = useCallback((file: File) => {
    // Store model file in public directory
    const formData = new FormData();
    formData.append('file', file);

    // For now, just update the UI to show the custom model is being used
    setModelName(file.name);
    setModelLoaded(true);
  }, []);

  const handleDatasetUpload = useCallback(async (file: File) => {
    setDatasetLoading(true);
    setDatasetError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-dataset', {
        method: 'POST',
        body: formData
      });

      const data: AnalysisResponse = await response.json();
      
      if (data.error) {
        setDatasetError(data.error);
      } else {
        setDatasetAnalysis(data);
      }
    } catch (error) {
      setDatasetError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setDatasetLoading(false);
    }
  }, []);

  const handleRemoveModel = useCallback(() => {
    setModelLoaded(false);
    setModelName('');
    setPrediction(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">AQI Prediction</h1>
              <p className="text-xs text-slate-600">Air Quality Intelligence Dashboard</p>
            </div>
          </div>
          <a
            href="https://colab.research.google.com/drive/1KXHkSj7GpoArzmv15rJUh-vQQlpjUoIp?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/50"
          >
            <ExternalLink className="w-4 h-4" />
            View on Colab
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="predict" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-slate-100 border border-slate-200 p-1 rounded-lg mb-8">
            <TabsTrigger value="predict" className="text-slate-700 data-[state=active]:bg-white">
              Prediction Engine
            </TabsTrigger>
            <TabsTrigger value="analysis" className="text-slate-700 data-[state=active]:bg-white">
              Analysis
            </TabsTrigger>
            <TabsTrigger value="data" className="text-slate-700 data-[state=active]:bg-white col-span-2 lg:col-span-1">
              Dataset Upload
            </TabsTrigger>
          </TabsList>

          {/* Prediction Tab */}
          <TabsContent value="predict" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left Column - Controls */}
              <div className="lg:col-span-1 space-y-6">
                <ParameterControls
                  values={parameters}
                  onValuesChange={setParameters}
                />
                <ModelUploader
                  onModelUpload={handleModelUpload}
                  modelLoaded={modelLoaded}
                  modelName={modelName}
                  onRemoveModel={handleRemoveModel}
                />
              </div>

              {/* Right Column - Prediction & Charts */}
              <div className="lg:col-span-3 space-y-6">
                <PredictionCard
                  aqi={prediction?.aqi ?? null}
                  bucket={prediction?.bucket ?? null}
                  loading={loading}
                  error={prediction?.error ?? null}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ParameterImpactChart
                    aqi={prediction?.aqi ?? null}
                    parameters={parameters}
                  />
                  <PollutantRadarChart
                    aqi={prediction?.aqi ?? null}
                    parameters={parameters}
                  />
                  <AQITrendChart
                    aqi={prediction?.aqi ?? null}
                    parameters={parameters}
                  />
                  <AQIBucketDistribution />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DatasetUploader
                  onDatasetUpload={handleDatasetUpload}
                  loading={datasetLoading}
                  error={datasetError}
                />
              </div>
              <div className="lg:col-span-2">
                {datasetAnalysis ? (
                  <DatasetAnalysis data={datasetAnalysis} loading={datasetLoading} />
                ) : (
                  <div className="flex items-center justify-center h-96 rounded-lg border border-slate-200 bg-slate-50">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-slate-600">Upload a CSV dataset to see analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <div className="max-w-2xl">
              <DatasetUploader
                onDatasetUpload={handleDatasetUpload}
                loading={datasetLoading}
                error={datasetError}
              />

              {datasetAnalysis && (
                <div className="mt-6">
                  <DatasetAnalysis data={datasetAnalysis} loading={datasetLoading} />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">About AQI</h3>
              <p className="text-sm text-slate-600">
                Air Quality Index (AQI) measures how polluted the air is and helps predict health risks associated with air pollution.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Data Sources</h3>
              <p className="text-sm text-slate-600">
                Model trained on real air quality data from major Indian cities. Updated with latest ML techniques.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Features</h3>
              <p className="text-sm text-slate-600">
                Real-time predictions, interactive controls, dataset analysis, and comprehensive visualizations.
              </p>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            <p>AQI Prediction Dashboard © 2024 | Built for Air Quality Intelligence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
