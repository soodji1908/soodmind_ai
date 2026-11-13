import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent
# In local development, reuse the root Next.js .env.local so both services
# automatically read the same ML_API_KEY. Deployment environment variables
# still take precedence over this file.
load_dotenv(PROJECT_ROOT / ".env.local")
load_dotenv(BASE_DIR / ".env", override=False)
HOUSE_PRICE_DIR = BASE_DIR / "house_price"
DATASET_DIR = HOUSE_PRICE_DIR / "datasets"
MODEL_DIR = HOUSE_PRICE_DIR / "models"
MODEL_PATH = MODEL_DIR / "house_price_model.joblib"
METRICS_PATH = MODEL_DIR / "house_price_metrics.json"

MIN_TRAINING_ROWS = 50
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_RESUME_TEXT_CHARS = 200_000

ML_API_KEY = os.getenv("ML_API_KEY", "")
