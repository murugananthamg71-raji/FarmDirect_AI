import os
import joblib
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_model():
    csv_path = os.path.join(os.path.dirname(__file__), "../data/synthetic_demand_history.csv")
    if not os.path.exists(csv_path):
        from generate_demo_data import generate_demo_dataset
        generate_demo_dataset()

    df = pd.read_csv(csv_path)

    X = df[["week_of_year", "category", "district", "season_factor"]]
    y = df["demand_kg"]

    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["category", "district"]),
            ("num", "passthrough", ["week_of_year", "season_factor"]),
        ]
    )

    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", GradientBoostingRegressor(n_estimators=100, random_state=42))
    ])

    model.fit(X, y)

    models_dir = os.path.join(os.path.dirname(__file__), "../models")
    os.makedirs(models_dir, exist_ok=True)
    out_model_path = os.path.join(models_dir, "demand_model.joblib")
    joblib.dump(model, out_model_path)
    print(f"Successfully trained & saved GradientBoosting demand model to {out_model_path}")

if __name__ == "__main__":
    train_model()

