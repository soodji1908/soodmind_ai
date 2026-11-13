# EstateMind ML Service

Python service that trains and serves the house price models and analyses resumes for EstateMind AI and CareerMind AI. The Next.js app calls it from the server only, so the browser never talks to this service directly.

## 1. Requirements

- Python 3.11 or newer (3.12 also works)
- pip (included with Python)

## 2. Create and activate a virtual environment (Windows PowerShell)

Run these commands from the `python-ml` folder:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

If PowerShell blocks the activation script, run this once and try again:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## 3. Install dependencies

```powershell
pip install -r requirements.txt
```

XGBoost is optional. To include it, uncomment the `xgboost` line in `requirements.txt` before installing.

## 4. Configure environment

For local development, set `ML_API_KEY` once in the project root `.env.local`. The Python service loads that file automatically using `python-dotenv`, and the Next.js server reads the same key. This prevents the two services from accidentally using different secrets. You can also set `ML_API_KEY` directly in the process environment; environment variables take precedence over `.env.local`.

```env
ML_API_URL=http://localhost:8000
ML_API_KEY=replace-with-the-same-long-random-key
```

Never commit `.env.local` or expose the key in browser code. In production, configure `ML_API_KEY` as a server-side secret in both deployments.

## 5. Place a house price dataset

Put one CSV file in `house_price\datasets\`. The file must include these columns (names are case-insensitive, spaces become underscores):

| Column | Required | Notes |
| --- | --- | --- |
| `price` | yes | Sale or listing price, greater than 0 |
| `area_sqft` | yes | Living area, greater than 0 |
| `bedrooms` | yes | Whole number, 0 or more |
| `bathrooms` | yes | Number, 0 or more |
| `year_built` | no | Missing values are imputed |
| `lot_size_sqft` | no | Missing values are imputed |
| `garage_spaces` | no | Missing values are imputed |
| `location` | no | Text category; blank becomes `unknown` |
| `property_type` | no | Text category; blank becomes `unknown` |

At least 50 valid rows are required. Rows with an invalid price or area are dropped and counted in the training report. No model is created from a dataset that is too small or malformed; the API returns a clear `insufficient_data` or `invalid_dataset` error instead.

Public datasets such as the Ames Housing or Kaggle House Prices data can be renamed to match these columns. Check the dataset licence before use.

## 6. Train and compare models

```powershell
python -m house_price.train --dataset houses.csv
```

This compares Linear Regression, Random Forest Regressor and Gradient Boosting Regressor. Each model is evaluated with:

- 5-fold cross-validation on the training split (MAE, RMSE, R2, with standard deviations)
- a 20% holdout split (MAE, RMSE, R2)

The model with the lowest cross-validated RMSE is saved to `house_price\models\house_price_model.joblib`, and the full comparison is saved to `house_price\models\house_price_metrics.json`. Training metrics are never invented: if training has not run, the prediction endpoint says so.

## 7. Start the FastAPI server

```powershell
uvicorn api.main:app --reload --port 8000
```

Interactive API documentation is at `http://localhost:8000/docs`.

## 8. Endpoints

All endpoints except `/health` require the header `X-ML-API-Key: <your ML_API_KEY>`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check (no key needed) |
| POST | `/api/ml/house-price/predict` | Estimate a price from JSON features |
| POST | `/api/ml/house-price/train` | Train from a CSV in `house_price\datasets` |
| GET | `/api/ml/house-price/metrics` | Model comparison and selected model |
| POST | `/api/ml/resume/analyze` | Analyse a PDF/DOCX upload or pasted resume text (form data) |
| POST | `/api/ml/resume/match` | Analyse and match against a job description (form data) |
| GET | `/api/ml/models/status` | Status of the house price model and resume engine |

Errors use a consistent shape: `{"error": "<code>", "message": "<explanation>"}`. Codes include `unauthorized`, `not_configured`, `model_not_trained`, `insufficient_data`, `invalid_dataset`, `unreadable_resume`, and `missing_resume`.

## 9. Test the API

Health check:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Prediction (after training):

```powershell
$headers = @{ "X-ML-API-Key" = $env:ML_API_KEY }
$body = @{ area_sqft = 1850; bedrooms = 3; bathrooms = 2; year_built = 1998; location = "downtown" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:8000/api/ml/house-price/predict -Headers $headers -ContentType "application/json" -Body $body
```

Resume analysis of a file:

```powershell
curl.exe -X POST http://localhost:8000/api/ml/resume/analyze -H "X-ML-API-Key: $env:ML_API_KEY" -F "file=@C:\path\to\resume.pdf"
```

## 10. Run the tests

```powershell
python -m pytest -q
```

The tests create their own temporary datasets and models, so they never touch the real `house_price\models` folder.

## 11. Next.js integration

The Next.js server reads two variables:

- `ML_API_URL` - the base URL of this service, for example `http://localhost:8000`
- `ML_API_KEY` - the same key as this service

Both are read only on the server. The Next.js route handlers check the signed-in user's portal membership before forwarding any request, so only estate members can request price estimates and only career members can analyse resumes.

## 12. Limits and honesty notes

- Price estimates come from the trained model on the dataset you supply. Quality depends on that dataset; they are not market valuations.
- The ATS checklist is a set of fixed structural rules. It does not predict whether a real applicant tracking system or recruiter will accept a resume.
- Scanned image PDFs have no text layer and cannot be read. Upload a text-based PDF or DOCX.
- spaCy is not required. Skill and section detection use curated rules plus scikit-learn TF-IDF, which keeps installation simple on Windows.
