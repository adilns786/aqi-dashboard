#!/usr/bin/env python3
"""
Generate a sample AQI prediction model for testing
This creates a simple linear regression model that can be used as a placeholder
"""

import pickle
import numpy as np
from pathlib import Path
import sys

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
        """
        Predict AQI values
        X: numpy array of shape (n_samples, 16)
        """
        # Ensure X is 2D
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # Simple linear prediction
        predictions = X @ self.coefficients + self.intercept
        
        # Ensure predictions are positive
        predictions = np.maximum(predictions, 0)
        
        return predictions

def main():
    try:
        # Create model
        model = SimpleAQIModel()
        
        # Get output path from argument or use default
        output_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('public')
        output_dir.mkdir(parents=True, exist_ok=True)
        
        output_path = output_dir / 'aqi_model.pkl'
        
        # Save model
        with open(output_path, 'wb') as f:
            pickle.dump(model, f)
        
        print(f"✓ Sample model created at: {output_path}")
        
        # Test the model
        test_features = np.array([[50, 100, 100, 50, 100, 50, 10, 50, 50, 10, 10, 10, 6, 182, 3, 2023]])
        test_prediction = model.predict(test_features)
        print(f"✓ Test prediction: {test_prediction[0]:.2f} AQI")
        
    except Exception as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
