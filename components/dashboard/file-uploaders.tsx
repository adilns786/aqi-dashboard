'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Upload, CheckCircle, FileUp, Trash2 } from 'lucide-react';

interface ModelUploaderProps {
  onModelUpload?: (file: File) => void;
  modelLoaded?: boolean;
  modelName?: string;
  onRemoveModel?: () => void;
}

export function ModelUploader({ onModelUpload, modelLoaded, modelName, onRemoveModel }: ModelUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.name.endsWith('.pkl')) {
      setError('Please select a .pkl file');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      onModelUpload?.(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [onModelUpload]);

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <FileUp className="w-5 h-5" />
          Model File
        </CardTitle>
        <CardDescription className="text-slate-600">
          Upload or use default AQI prediction model
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {modelLoaded && modelName ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-300">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Model Loaded</p>
                  <p className="text-xs text-green-800 mt-1">{modelName}</p>
                </div>
              </div>
              <Button
                onClick={onRemoveModel}
                size="sm"
                variant="ghost"
                className="text-green-600 hover:text-green-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pkl"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="w-full p-6 rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-500 hover:bg-purple-50 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="w-6 h-6" />
                  <span className="text-sm text-slate-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-slate-500">
                    .pkl files up to 100MB
                  </span>
                </div>
              )}
            </button>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-xs text-slate-600 text-center">
              Using default model: aqi_model.pkl
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface DatasetUploaderProps {
  onDatasetUpload?: (file: File) => void;
  loading?: boolean;
  error?: string | null;
}

export function DatasetUploader({ onDatasetUpload, loading, error }: DatasetUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.name.endsWith('.csv')) {
      setLocalError('Please select a CSV file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setLocalError('File size must be less than 50MB');
      return;
    }

    setLocalError(null);
    onDatasetUpload?.(file);
  }, [onDatasetUpload]);

  return (
    <Card className="border shadow-lg bg-white">
      <CardHeader>
        <CardTitle className="text-slate-900 flex items-center gap-2">
          <FileUp className="w-5 h-5" />
          Dataset Analysis
        </CardTitle>
        <CardDescription className="text-slate-600">
          Upload CSV file for statistical analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full p-6 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Spinner className="w-6 h-6" />
              <span className="text-sm text-slate-500">Analyzing...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">
                Click to upload dataset
              </span>
              <span className="text-xs text-slate-500">
                CSV files up to 50MB
              </span>
            </div>
          )}
        </button>

        {(error || localError) && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-800">{error || localError}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
