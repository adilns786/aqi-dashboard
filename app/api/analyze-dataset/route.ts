import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execPromise = promisify(exec);

interface AnalysisResponse {
  success?: boolean;
  total_rows?: number;
  columns?: string[];
  num_columns?: number;
  preview?: any[];
  statistics?: Record<string, any>;
  error?: string;
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

    // Call Python script for analysis
    const scriptPath = path.join(process.cwd(), 'scripts', 'model_handler.py');

    try {
      const { stdout, stderr } = await execPromise(
        `python3 "${scriptPath}" analyze '${csvData.replace(/'/g, "'\\''")}'`
      );

      if (stderr) {
        console.error('[Dataset Analysis] Python stderr:', stderr);
      }

      const result = JSON.parse(stdout);
      return NextResponse.json(result);
    } catch (execError: any) {
      console.error('[Dataset Analysis] Execution error:', execError.message);
      return NextResponse.json(
        { error: `Analysis failed: ${execError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Dataset Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
