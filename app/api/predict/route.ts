import { NextRequest, NextResponse } from 'next/server';

interface PredictionRequest {
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

// Simple AQI model coefficients (matches the generated model)
const MODEL_COEFFICIENTS = [
  0.3,    // PM2.5
  0.2,    // PM10
  0.15,   // NO
  0.15,   // NO2
  0.1,    // NOx
  0.1,    // NH3
  2.0,    // CO
  0.15,   // SO2
  0.1,    // O3
  0.5,    // Benzene
  0.4,    // Toluene
  0.35,   // Xylene
  0.5,    // Month
  0.01,   // DayOfYear
  1.0,    // DayOfWeek
  -0.1    // Year
];

const MODEL_INTERCEPT = 30.0;

// AQI bucket classification
const AQI_BUCKETS = [
  { min: 0, max: 50, bucket: 'Good', range: [0, 50] },
  { min: 51, max: 100, bucket: 'Satisfactory', range: [51, 100] },
  { min: 101, max: 200, bucket: 'Moderately Polluted', range: [101, 200] },
  { min: 201, max: 300, bucket: 'Poor', range: [201, 300] },
  { min: 301, max: 500, bucket: 'Very Poor', range: [301, 500] },
];

function predictAQI(features: number[]): number {
  // Simple linear prediction
  let prediction = MODEL_INTERCEPT;
  for (let i = 0; i < features.length && i < MODEL_COEFFICIENTS.length; i++) {
    prediction += features[i] * MODEL_COEFFICIENTS[i];
  }
  // Ensure positive
  return Math.max(prediction, 0);
}

function getAQIBucket(aqi: number): { bucket: string; range: [number, number] } {
  for (const { min, max, bucket, range } of AQI_BUCKETS) {
    if (aqi >= min && aqi <= max) {
      return { bucket, range };
    }
  }
  return { bucket: 'Severe', range: [500, 1000] };
}

export async function POST(request: NextRequest): Promise<NextResponse<PredictionResponse>> {
  try {
    const body: PredictionRequest = await request.json();
    const { features } = body;

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

    // Calculate prediction
    const aqi = predictAQI(features);
    const { bucket, range } = getAQIBucket(aqi);

    return NextResponse.json({
      success: true,
      aqi: Math.round(aqi * 100) / 100,
      bucket,
      bucket_range: range,
      features_used: features.length,
    });
  } catch (error) {
    console.error('[AQI API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
