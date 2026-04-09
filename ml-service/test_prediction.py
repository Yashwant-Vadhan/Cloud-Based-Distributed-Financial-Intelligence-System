import requests
import json

url = "http://127.0.0.1:5003/api/predict"
data = {
    "month": 7,
    "income": 50000,
    "rent": 15000,
    "food": 5000,
    "travel": 2000,
    "entertainment": 1000
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
