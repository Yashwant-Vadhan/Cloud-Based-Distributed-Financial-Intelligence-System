import pandas as pd
import numpy as np

np.random.seed(42)

rows = 10000  # target rows

data = {
    "month": np.random.randint(1, 13, rows),
    "income": np.random.randint(20000, 80000, rows),
    "rent": np.random.randint(5000, 20000, rows),
    "food": np.random.randint(2000, 8000, rows),
    "travel": np.random.randint(1000, 5000, rows),
    "entertainment": np.random.randint(1000, 4000, rows),
    "savings": np.random.randint(2000, 10000, rows)
}

df = pd.DataFrame(data)

# Total expense (exclude savings)
df["expenses"] = (
    df["rent"] +
    df["food"] +
    df["travel"] +
    df["entertainment"]
)

# Save file
df.to_csv("expenses_dataset.csv", index=False)

print("✅ 10,000 rows dataset created successfully!")
print(df.head())