#!/usr/bin/env python3
"""
AQI Model Handler - Handles model loading and inference
"""

import pickle
import json
import sys
import numpy as np
import csv
import io
from pathlib import Path
from typing import Dict, List, Tuple, Any

class AQIModelHandler:
    """Handle AQI model loading and predictions"""
    
    # AQI bucket boundaries and classifications
    AQI_BUCKETS = {
        'Good': (0, 50),
        'Satisfactory': (51, 100),
        'Moderate': (101, 200),
        'Poor': (201, 300),
        'Very Poor': (301, 400),
        'Severe': (401, 500)
    }
    
    # City encoding mapping
    CITY_MAPPING = {
        'Delhi': 0,
        'Mumbai': 1,
        'Chennai': 2,
        'Kolkata': 3,
        'Bangalore': 4
    }
    
    # Feature names in order
    FEATURE_NAMES = [
        'PM2.5', 'PM10', 'NO', 'NO2', 'NOx', 'NH3',
        'CO', 'SO2', 'O3', 'Benzene', 'Toluene', 'Xylene',
        'Month', 'DayOfYear', 'DayOfWeek', 'Year'
    ]
    
    def __init__(self, model_path: str = None):
        """Initialize with model path"""
        self.model = None
        self.scaler = None
        
        if model_path:
            self.load_model(model_path)
    
    def load_model(self, model_path: str) -> bool:
        """Load the pickled model"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
                
            # Handle different pickle formats
            if isinstance(model_data, dict):
                self.model = model_data.get('model')
                self.scaler = model_data.get('scaler')
            else:
                self.model = model_data
                
            return self.model is not None
        except Exception as e:
            print(f"Error loading model: {str(e)}", file=sys.stderr)
            return False
    
    def predict(self, features: List[float]) -> Dict[str, Any]:
        """
        Make AQI prediction
        
        Args:
            features: List of 16 feature values
            
        Returns:
            Dict with prediction, bucket, and metadata
        """
        try:
            if self.model is None:
                return {
                    'error': 'Model not loaded',
                    'aqi': None,
                    'bucket': None
                }
            
            # Convert to numpy array
            X = np.array(features).reshape(1, -1)
            
            # Scale if scaler available
            if self.scaler:
                X = self.scaler.transform(X)
            
            # Make prediction
            aqi_prediction = self.model.predict(X)[0]
            
            # Ensure AQI is positive
            aqi_prediction = max(0, float(aqi_prediction))
            
            # Get bucket classification
            bucket = self._get_bucket(aqi_prediction)
            
            return {
                'success': True,
                'aqi': round(aqi_prediction, 2),
                'bucket': bucket,
                'bucket_range': self.AQI_BUCKETS.get(bucket),
                'features_used': len(features)
            }
        except Exception as e:
            return {
                'error': str(e),
                'aqi': None,
                'bucket': None
            }
    
    def _get_bucket(self, aqi: float) -> str:
        """Get AQI bucket classification"""
        if aqi <= 50:
            return 'Good'
        elif aqi <= 100:
            return 'Satisfactory'
        elif aqi <= 200:
            return 'Moderate'
        elif aqi <= 300:
            return 'Poor'
        elif aqi <= 400:
            return 'Very Poor'
        else:
            return 'Severe'
    
    def analyze_dataset(self, csv_data: str) -> Dict[str, Any]:
        """
        Analyze a CSV dataset and return statistics
        
        Args:
            csv_data: Raw CSV string data
            
        Returns:
            Dict with statistics and metadata
        """
        try:
            lines = csv_data.strip().split('\n')
            reader = csv.DictReader(io.StringIO(csv_data))
            rows = list(reader)
            
            if not rows:
                return {'error': 'No data in CSV'}
            
            # Get column names
            columns = list(rows[0].keys())
            
            # Get first 40 rows
            preview_rows = rows[:40]
            
            # Calculate statistics for numeric columns
            stats = {}
            for col in columns:
                try:
                    values = [float(row[col]) for row in rows if row[col] and row[col].strip()]
                    if values:
                        values = np.array(values)
                        stats[col] = {
                            'mean': round(float(values.mean()), 3),
                            'std': round(float(values.std()), 3),
                            'min': round(float(values.min()), 3),
                            'max': round(float(values.max()), 3),
                            'median': round(float(np.median(values)), 3),
                            'q25': round(float(np.percentile(values, 25)), 3),
                            'q75': round(float(np.percentile(values, 75)), 3),
                        }
                except (ValueError, TypeError):
                    pass
            
            return {
                'success': True,
                'total_rows': len(rows),
                'columns': columns,
                'num_columns': len(columns),
                'preview': preview_rows,
                'statistics': stats
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_feature_ranges(self) -> Dict[str, Tuple[float, float]]:
        """Get suggested ranges for each feature"""
        ranges = {
            'PM2.5': (0, 500),
            'PM10': (0, 500),
            'NO': (0, 500),
            'NO2': (0, 500),
            'NOx': (0, 500),
            'NH3': (0, 500),
            'CO': (0, 50),
            'SO2': (0, 500),
            'O3': (0, 500),
            'Benzene': (0, 50),
            'Toluene': (0, 50),
            'Xylene': (0, 50),
            'Month': (1, 12),
            'DayOfYear': (1, 365),
            'DayOfWeek': (0, 6),
            'Year': (2015, 2024)
        }
        return ranges


def main():
    """CLI interface for model handler"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No command provided'}))
        return
    
    command = sys.argv[1]
    
    if command == 'predict':
        if len(sys.argv) < 4:
            print(json.dumps({'error': 'Missing model_path or features'}))
            return
        
        model_path = sys.argv[2]
        features = json.loads(sys.argv[3])
        
        handler = AQIModelHandler(model_path)
        result = handler.predict(features)
        print(json.dumps(result))
    
    elif command == 'analyze':
        if len(sys.argv) < 4:
            print(json.dumps({'error': 'Missing model_path or csv_data'}))
            return
        
        csv_data = sys.argv[2]
        handler = AQIModelHandler()
        result = handler.analyze_dataset(csv_data)
        print(json.dumps(result))
    
    elif command == 'info':
        if len(sys.argv) < 3:
            print(json.dumps({'error': 'Missing model_path'}))
            return
        
        model_path = sys.argv[2]
        handler = AQIModelHandler(model_path)
        
        info = {
            'model_loaded': handler.model is not None,
            'feature_names': handler.FEATURE_NAMES,
            'feature_ranges': handler.get_feature_ranges(),
            'aqi_buckets': handler.AQI_BUCKETS,
            'cities': handler.CITY_MAPPING
        }
        print(json.dumps(info))


if __name__ == '__main__':
    main()
