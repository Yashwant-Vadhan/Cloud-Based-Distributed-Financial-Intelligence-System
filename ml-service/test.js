async function getPrediction() {
  const response = await fetch("https://ml-service-3bck.onrender.com/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      monthly_expenses: [8000, 8500, 9000, 9500],
      current_expense: 11000
    })
  });

  const data = await response.json();
  console.log(data);
}

getPrediction();