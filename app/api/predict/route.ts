import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execPromise = promisify(exec);

interface PredictionRequest {
  modelPath?: string;
  features: number[];
}

interface PredictionResponse {
  success: boolean;
  aqi?: number;
  bucket?: string;
  bucket_range?: [number, number];
  features_used?: number;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<PredictionResponse>> {
  try {
    const body: PredictionRequest = await request.json();
    const { modelPath = 'public/aqi_model.pkl', features } = body;

    // Validate features
    if (!Array.isArray(features) || features.length !== 16) {
      return NextResponse.json(
        { success: false, error: 'Invalid features. Expected array of 16 numbers.' },
        { status: 400 }
      );
    }

    // Ensure all features are numbers
    if (!features.every((f) => typeof f === 'number')) {
      return NextResponse.json(
        { success: false, error: 'All features must be numbers.' },
        { status: 400 }
      );
    }

    // Build the full path
    const fullModelPath = path.join(process.cwd(), modelPath);

    // Check if model file exists
    if (!fs.existsSync(fullModelPath)) {
      return NextResponse.json(
        { success: false, error: `Model file not found at ${fullModelPath}` },
        { status: 404 }
      );
    }

    // Call Python script
    const scriptPath = path.join(process.cwd(), 'scripts', 'model_handler.py');
    const featuresJson = JSON.stringify(features);

    try {
      const { stdout, stderr } = await execPromise(
        `python3 "${scriptPath}" predict "${fullModelPath}" '${featuresJson.replace(/'/g, "'\\''")}'`
      );

      if (stderr) {
        console.error('[AQI API] Python stderr:', stderr);
      }

      const result = JSON.parse(stdout);
      return NextResponse.json({ success: true, ...result });
    } catch (execError: any) {
      console.error('[AQI API] Execution error:', execError.message);
      return NextResponse.json(
        { success: false, error: `Prediction failed: ${execError.message}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[AQI API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
