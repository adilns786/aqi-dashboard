import { NextRequest, NextResponse } from 'next/server';

interface AnalysisResponse {
  success?: boolean;
  total_rows?: number;
  columns?: string[];
  num_columns?: number;
  preview?: any[];
  statistics?: Record<string, any>;
  error?: string;
}

function parseCSV(csvData: string): { columns: string[]; rows: any[] } {
  const lines = csvData.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse header
  const columns = lines[0].split(',').map((col) => col.trim());

  // Parse rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((val) => val.trim());
    const row: Record<string, any> = {};
    for (let j = 0; j < columns.length && j < values.length; j++) {
      const numVal = parseFloat(values[j]);
      row[columns[j]] = isNaN(numVal) ? values[j] : numVal;
    }
    rows.push(row);
  }

  return { columns, rows };
}

function calculateStatistics(
  rows: any[],
  columns: string[]
): Record<string, any> {
  const stats: Record<string, any> = {};

  for (const col of columns) {
    const values = rows
      .map((row) => row[col])
      .filter((v) => typeof v === 'number');

    if (values.length === 0) {
      stats[col] = { type: 'non-numeric' };
      continue;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length;
    const std = Math.sqrt(variance);

    stats[col] = {
      type: 'numeric',
      count: values.length,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100,
      median: Math.round(sorted[Math.floor(sorted.length / 2)] * 100) / 100,
    };
  }

  return stats;
}

export async function POST(request: NextRequest): Promise<NextResponse<AnalysisResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if file is CSV
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      );
    }

    // Read file content
    const csvData = await file.text();

    // Validate CSV has content
    if (!csvData.trim()) {
      return NextResponse.json(
        { error: 'CSV file is empty' },
        { status: 400 }
      );
    }

    // Parse CSV
    const { columns, rows } = parseCSV(csvData);

    // Get preview (first 40 rows)
    const preview = rows.slice(0, 40);

    // Calculate statistics
    const statistics = calculateStatistics(rows, columns);

    return NextResponse.json({
      success: true,
      total_rows: rows.length,
      columns,
      num_columns: columns.length,
      preview,
      statistics,
    });
  } catch (error: any) {
    console.error('[Dataset Analysis] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
