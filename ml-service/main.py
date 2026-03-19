from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

app = FastAPI()

# -------------------------------
# Sample Training Data (Dummy)
# -------------------------------
# Month vs Expense
months = np.array([1, 2, 3, 4, 5, 6]).reshape(-1, 1)
expenses = np.array([8000, 8500, 9000, 9500, 10000, 11000])

model = LinearRegression()
model.fit(months, expenses)

# -------------------------------
# Request Model
# -------------------------------
class ExpenseData(BaseModel):
    monthly_expenses: list   # [8000, 8500, 9000]
    current_expense: float


# -------------------------------
# 1. Expense Prediction
# -------------------------------
@app.post("/predict")
def predict_expense(data: ExpenseData):
    n = len(data.monthly_expenses)
    next_month = np.array([[n + 1]])
    
    prediction = model.predict(next_month)[0]

    return {
        "predicted_expense": round(float(prediction), 2)
    }


# -------------------------------
# 2. Overspending Detection
# -------------------------------
@app.post("/overspending")
def detect_overspending(data: ExpenseData):
    avg = sum(data.monthly_expenses) / len(data.monthly_expenses)

    if data.current_expense > avg:
        status = True
    else:
        status = False

    return {
        "average_expense": round(avg, 2),
        "overspending": status
    }


# -------------------------------
# 3. Credit Score
# -------------------------------
@app.post("/credit-score")
def credit_score(data: ExpenseData):
    avg = sum(data.monthly_expenses) / len(data.monthly_expenses)

    savings_ratio = max(0, (avg - data.current_expense) / avg)

    score = 50 + (savings_ratio * 50)

    return {
        "credit_score": round(score, 2)
    }


# -------------------------------
# Root API
# -------------------------------
@app.get("/")
def home():
    return {"message": "ML Service Running 🚀"}

    # -------------------------------
# Run Server (for deployment)
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)