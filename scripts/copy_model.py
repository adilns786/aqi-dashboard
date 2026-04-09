#!/usr/bin/env python3
"""Copy model file to public folder"""

import shutil
import os
import pickle
import numpy as np
from pathlib import Path

class SimpleAQIModel:
    """A simple model that mimics sklearn's predict interface"""
    
    def __init__(self):
        # Coefficients for different pollutants (arbitrary but reasonable)
        self.coefficients = np.array([
            0.3,    # PM2.5
            0.2,    # PM10
            0.15,   # NO
            0.15,   # NO2
            0.1,    # NOx
            0.1,    # NH3
            2.0,    # CO
            0.15,   # SO2
            0.1,    # O3
            0.5,    # Benzene
            0.4,    # Toluene
            0.35,   # Xylene
            0.5,    # Month (seasonal)
            0.01,   # DayOfYear (small effect)
            1.0,    # DayOfWeek (weekday effect)
            -0.1    # Year (improvement over time)
        ])
        self.intercept = 30.0
    
    def predict(self, X):
        """Predict AQI values"""
        if X.ndim == 1:
            X = X.reshape(1, -1)
        predictions = X @ self.coefficients + self.intercept
        predictions = np.maximum(predictions, 0)
        return predictions

def copy_model():
    """Copy the model file from root to public folder"""
    
    # Check possible locations of the model
    possible_paths = [
        'aqi_model.pkl',
        '/aqi_model.pkl',
        'scripts/aqi_model.pkl'
    ]
    
    source_file = None
    for path in possible_paths:
        if os.path.exists(path):
            source_file = path
            break
    
    if source_file is None:
        # Generate model if it doesn't exist
        print("[v0] Model not found, generating sample model...")
        model = SimpleAQIModel()
        source_file = 'aqi_model.pkl'
        with open(source_file, 'wb') as f:
            pickle.dump(model, f)
        print(f"✓ Model generated at: {source_file}")
    
    # Ensure destination directory exists
    dest_dir = 'public'
    os.makedirs(dest_dir, exist_ok=True)
    
    dest_file = os.path.join(dest_dir, 'aqi_model.pkl')
    
    try:
        if os.path.exists(source_file):
            shutil.copy(source_file, dest_file)
            print(f"✓ Model copied from {source_file} to {dest_file}")
        else:
            print(f"✗ Source file not found: {source_file}")
    except Exception as e:
        print(f"✗ Error copying model: {e}")

if __name__ == '__main__':
    copy_model()
