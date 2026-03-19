from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np

app = FastAPI()

# -------------------------------
# Load Dataset
# -------------------------------
df = pd.read_csv("expenses_dataset.csv")
df.columns = df.columns.str.strip()  # IMPORTANT

X = df[["month", "income", "rent", "food", "travel", "entertainment"]]
y = df["expenses"]

model = LinearRegression()
model.fit(X, y)

# -------------------------------
# Request Model
# -------------------------------
class ExpenseData(BaseModel):
    month: int
    income: float
    rent: float
    food: float
    travel: float
    entertainment: float

# -------------------------------
# 1. Prediction API
# -------------------------------
@app.post("/predict")
def predict_expense(data: ExpenseData):
    input_data = np.array([[
        data.month,
        data.income,
        data.rent,
        data.food,
        data.travel,
        data.entertainment
    ]])

    prediction = model.predict(input_data)[0]

    return {
        "predicted_expense": round(float(prediction), 2)
    }

# -------------------------------
# 2. Overspending
# -------------------------------
@app.post("/overspending")
def overspending(data: ExpenseData):
    try:
        avg = float(df["expenses"].mean())

        current = (
            data.rent +
            data.food +
            data.travel +
            data.entertainment
        )

        return {
            "average_expense": round(avg, 2),
            "overspending": current > avg
        }

    except Exception as e:
        return {
            "error": str(e)
        }

# -------------------------------
# 3. Credit Score
# -------------------------------
@app.post("/credit-score")
def credit_score(data: ExpenseData):
    current = (
        data.rent +
        data.food +
        data.travel +
        data.entertainment
    )

    avg = df["expenses"].mean()

    savings_ratio = max(0, (avg - current) / avg)

    score = 50 + (savings_ratio * 50)

    return {
        "credit_score": round(float(score), 2)
    }

# -------------------------------
# Root
# -------------------------------
@app.get("/")
def home():
    return {"message": "Advanced ML Service Running 🚀"}