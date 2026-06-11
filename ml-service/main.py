from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai
import uvicorn

from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, specify the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Clients Initialization
# -------------------------------
openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
gemini_model = genai.GenerativeModel("gemini-2.0-flash")

# Groq (using OpenAI compatible client)
groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

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
    language: str = "English"

# -------------------------------
# AI Prediction Logic
# -------------------------------
def get_ai_prediction(data: ExpenseData):
    lang = data.language or "English"
    prompt = f"""
    Analyze the following financial data and return a JSON object with EXACTLY these keys:
    - "nextMonth": (number) your prediction for next month's total expenses.
    - "savings": (number) predicted savings (income - predicted expenses).
    - "alert": (string) a short, 1-sentence spending alert or tip.
    - "detailedSummary": (string) a 2-3 sentence deep dive into their financial situation.
    - "recommendations": (array of strings) 3 specific, actionable tips to improve savings.
    - "riskStatus": (string) "Safe", "Warning", or "Critical" based on savings ratio.

    Data:
    Month: {data.month}
    Income: {data.income}
    Rent: {data.rent}
    Food: {data.food}
    Travel: {data.travel}
    Entertainment: {data.entertainment}

    CRITICAL REQUIREMENT:
    You MUST translate and return the values of "alert", "detailedSummary", and "recommendations" in the following language: {lang}.
    The value of "riskStatus" MUST remain exactly one of "Safe", "Warning", or "Critical" in English.
    """

    # 1. Try Groq First (Primary - Ultra Fast & High Limit)
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Groq Error: {e}. Falling back to OpenAI...")

    # 2. Try OpenAI Second
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"OpenAI Error: {e}. Falling back to Gemini...")
        
    # 3. Try Gemini Third
    try:
        response = gemini_model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Error: {e}")
        # 4. Final Rule-based Fallback (Ensures the app works even with dead keys)
        fallbacks = {
            "English": {
                "alert": "(AI offline) Moderate spending detected.",
                "summary_buffer": "Your current spending is {ratio}% of your income. You have a solid buffer.",
                "summary_cut": "Your current spending is {ratio}% of your income. You should look for immediate areas to cut costs.",
                "recs": [
                    "Track your daily variable expenses more closely.",
                    "Consider setting a strict budget for entertainment.",
                    "Aim to save at least 20% of your income monthly."
                ]
            },
            "Hindi": {
                "alert": "(एआई ऑफ़लाइन) मध्यम व्यय का पता चला।",
                "summary_buffer": "आपका वर्तमान खर्च आपकी आय का {ratio}% है। आपके पास एक मजबूत बफर है।",
                "summary_cut": "आपका वर्तमान खर्च आपकी आय का {ratio}% है। आपको तुरंत खर्च में कटौती करनी चाहिए।",
                "recs": [
                    "अपने दैनिक परिवर्तनीय खर्चों पर अधिक बारीकी से नज़र रखें।",
                    "मनोरंजन के लिए एक सख्त बजट निर्धारित करने पर विचार करें।",
                    "मासिक रूप से अपनी आय का कम से कम 20% बचाने का लक्ष्य रखें।"
                ]
            },
            "Tamil": {
                "alert": "(AI ஆஃப்லைன்) மிதமான செலவு கண்டறியப்பட்டுள்ளது.",
                "summary_buffer": "உங்கள் தற்போதைய செலவு உங்கள் வருமானத்தில் {ratio}% ஆகும். உங்களிடம் போதுமான சேமிப்பு உள்ளது.",
                "summary_cut": "உங்கள் தற்போதைய செலவு உங்கள் வருமானத்தில் {ratio}% ஆகும். உடனடியாக செலவைக் குறைக்க வேண்டும்.",
                "recs": [
                    "உங்கள் தினசரி மாறும் செலவுகளை உன்னிப்பாகக் கண்காணியுங்கள்.",
                    "பொழுதுபோக்கிற்கான கடுமையான வரம்பை அமைக்க பரிசீலிக்கவும்.",
                    "ஒவ்வொரு மாதமும் உங்கள் வருமானத்தில் குறைந்தது 20% சேமிப்பதை இலக்காகக் கொள்ளுங்கள்."
                ]
            }
        }

        lang_key = "English"
        if "hind" in lang.lower() or lang == "hi":
            lang_key = "Hindi"
        elif "tamil" in lang.lower() or lang == "ta":
            lang_key = "Tamil"

        fb = fallbacks.get(lang_key, fallbacks["English"])

        total_exp = data.rent + data.food + data.travel + data.entertainment
        predicted_expense = total_exp * 1.05
        savings = data.income - predicted_expense
        
        ratio = (predicted_expense / data.income) if data.income > 0 else 1
        risk = "Safe" if ratio < 0.5 else "Warning" if ratio < 0.8 else "Critical"
        
        ratio_pct = round(ratio*100)
        summary = fb["summary_buffer"].format(ratio=ratio_pct) if risk == "Safe" else fb["summary_cut"].format(ratio=ratio_pct)
        
        return {
            "nextMonth": round(predicted_expense, 2),
            "savings": round(savings, 2),
            "alert": fb["alert"],
            "detailedSummary": summary,
            "recommendations": fb["recs"],
            "riskStatus": risk
        }

@app.post("/predict")
@app.post("/api/predict")
def predict_expense(data: ExpenseData):
    return get_ai_prediction(data)

@app.post("/overspending")
def check_overspending(data: ExpenseData):
    # For simplicity, using the same fallback logic if needed
    prompt = f"Analyze overspending for Income: {data.income}, Total expenses: {data.rent + data.food + data.travel + data.entertainment}. Return JSON with 'overspending_status' and 'is_overspending'."
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "user", "content": prompt}]
        )
        return json.loads(response.choices[0].message.content)
    except:
        response = gemini_model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)

# -------------------------------
# Health Check
# -------------------------------
@app.get("/health")
def health():
    return {"status": "ML AI Service Running with Fallback 🚀"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5003))
    uvicorn.run(app, host="0.0.0.0", port=port)