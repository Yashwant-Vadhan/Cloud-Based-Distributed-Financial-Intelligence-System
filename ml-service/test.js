async function getPrediction() {
  const response = await fetch("http://127.0.0.1:5003/api/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      month: 7,
      income: 45000,
      rent: 12000,
      food: 4000,
      travel: 2000,
      entertainment: 1500
    })
  });

  const data = await response.json();
  console.log("Prediction:", data);
}

getPrediction();

async function testOverspending() {
  const response = await fetch("http://127.0.0.1:5003/overspending", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      month: 5,
      income: 30000,
      rent: 15000,
      food: 6000,
      travel: 3000,
      entertainment: 2000
    })
  });

  const data = await response.json();
  console.log("Overspending:", data);
}

testOverspending();

async function testCreditScore() {
  const response = await fetch("http://127.0.0.1:8000/credit-score", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      month: 9,
      income: 50000,
      rent: 10000,
      food: 3500,
      travel: 1500,
      entertainment: 1000
    })
  });

  const data = await response.json();
  console.log("Credit Score:", data);
}

testCreditScore();