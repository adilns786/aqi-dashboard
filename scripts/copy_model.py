#!/usr/bin/env python3
"""Copy model file to public folder"""

import shutil
import os
from pathlib import Path

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
        # Try to generate it if it doesn't exist
        print("[v0] Model not found, generating sample model...")
        from generate_sample_model import generate_sample_model
        generate_sample_model()
        source_file = 'aqi_model.pkl'
    
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
