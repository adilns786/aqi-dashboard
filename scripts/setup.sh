#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Check if aqi_model.pkl exists in scripts folder, if not generate it
if [ ! -f "aqi_model.pkl" ]; then
  echo "Generating sample model..."
  python3 scripts/generate_sample_model.py
fi

# Move or copy the model to public folder
if [ -f "aqi_model.pkl" ]; then
  cp aqi_model.pkl public/aqi_model.pkl
  echo "✓ Model copied to public/aqi_model.pkl"
else
  echo "Warning: Model file not found"
fi

echo "Setup complete!"
