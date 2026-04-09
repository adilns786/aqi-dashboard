/**
 * AQI utilities for bucket classification, colors, and ranges
 */

export interface AQIBucket {
  name: string;
  min: number;
  max: number;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  recommendation: string;
}

export const AQI_BUCKETS: Record<string, AQIBucket> = {
  Good: {
    name: 'Good',
    min: 0,
    max: 50,
    color: '#10B981',
    bgColor: '#ECFDF5',
    textColor: '#047857',
    description: 'Air quality is satisfactory',
    recommendation: 'Perfect for outdoor activities'
  },
  Satisfactory: {
    name: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#FBBF24',
    bgColor: '#FFFBEB',
    textColor: '#D97706',
    description: 'Air quality is acceptable',
    recommendation: 'Sensitive people should limit outdoor exposure'
  },
  Moderate: {
    name: 'Moderate',
    min: 101,
    max: 200,
    color: '#F97316',
    bgColor: '#FFF7ED',
    textColor: '#EA580C',
    description: 'Air quality is acceptable for most',
    recommendation: 'Sensitive groups should consider limiting outdoor activities'
  },
  Poor: {
    name: 'Poor',
    min: 201,
    max: 300,
    color: '#EF4444',
    bgColor: '#FEF2F2',
    textColor: '#DC2626',
    description: 'Air quality is poor',
    recommendation: 'Avoid outdoor activities'
  },
  'Very Poor': {
    name: 'Very Poor',
    min: 301,
    max: 400,
    color: '#A855F7',
    bgColor: '#FAF5FF',
    textColor: '#7C3AED',
    description: 'Air quality is very poor',
    recommendation: 'Stay indoors, use air purifiers'
  },
  Severe: {
    name: 'Severe',
    min: 401,
    max: 500,
    color: '#7F1D1D',
    bgColor: '#7F1D1D',
    textColor: '#FFFFFF',
    description: 'Air quality is severe',
    recommendation: 'Remain indoors, close all windows'
  }
};

export const CITIES = ['Delhi', 'Mumbai', 'Chennai', 'Kolkata', 'Bangalore'];

export const FEATURE_RANGES: Record<string, [number, number]> = {
  'PM2.5': [0, 500],
  'PM10': [0, 500],
  'NO': [0, 500],
  'NO2': [0, 500],
  'NOx': [0, 500],
  'NH3': [0, 500],
  'CO': [0, 50],
  'SO2': [0, 500],
  'O3': [0, 500],
  'Benzene': [0, 50],
  'Toluene': [0, 50],
  'Xylene': [0, 50],
  'Month': [1, 12],
  'DayOfYear': [1, 365],
  'DayOfWeek': [0, 6],
  'Year': [2015, 2024]
};

export const FEATURE_NAMES = [
  'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3',
  'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene',
  'Month', 'DayOfYear', 'DayOfWeek', 'Year'
];

export const FEATURE_DEFAULTS: Record<string, number> = {
  'PM2.5': 50,
  'PM10': 100,
  'NO': 100,
  'NO2': 50,
  'NOx': 100,
  'NH3': 50,
  'CO': 10,
  'SO2': 50,
  'O3': 50,
  'Benzene': 10,
  'Toluene': 10,
  'Xylene': 10,
  'Month': 6,
  'DayOfYear': 182,
  'DayOfWeek': 3,
  'Year': 2023
};

/**
 * Get AQI bucket for a given value
 */
export function getAQIBucket(aqi: number): AQIBucket {
  for (const bucket of Object.values(AQI_BUCKETS)) {
    if (aqi >= bucket.min && aqi <= bucket.max) {
      return bucket;
    }
  }
  return AQI_BUCKETS.Severe;
}

/**
 * Get gradient color based on AQI value
 */
export function getAQIColor(aqi: number): string {
  return getAQIBucket(aqi).color;
}

/**
 * Get background color for AQI bucket
 */
export function getAQIBgColor(aqi: number): string {
  return getAQIBucket(aqi).bgColor;
}

/**
 * Get text color for AQI bucket
 */
export function getAQITextColor(aqi: number): string {
  return getAQIBucket(aqi).textColor;
}

/**
 * Format AQI value with appropriate precision
 */
export function formatAQI(value: number): string {
  return value.toFixed(1);
}

/**
 * Get recommendations based on AQI
 */
export function getAQIRecommendation(aqi: number): string {
  return getAQIBucket(aqi).recommendation;
}

/**
 * Get description based on AQI
 */
export function getAQIDescription(aqi: number): string {
  return getAQIBucket(aqi).description;
}
