import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_demo_dataset():
    categories = ["Vegetables", "Fruits", "Grains & Pulses", "Spices & Herbs", "Nuts & Oilseeds"]
    districts = ["Coimbatore", "Madurai", "Chennai", "Erode", "Thanjavur"]

    records = []
    start_date = datetime(2024, 1, 1)

    for week in range(104):  # 2 years of weekly data
        current_week_date = start_date + timedelta(weeks=week)
        week_of_year = current_week_date.isocalendar()[1]
        season_factor = 1.0 + 0.3 * np.sin(2 * np.pi * week_of_year / 52.0)

        for cat in categories:
            base_demand = {
                "Vegetables": 1400,
                "Fruits": 950,
                "Grains & Pulses": 2200,
                "Spices & Herbs": 450,
                "Nuts & Oilseeds": 650,
            }[cat]

            for dist in districts:
                dist_factor = {
                    "Coimbatore": 1.2,
                    "Madurai": 1.1,
                    "Chennai": 1.4,
                    "Erode": 1.0,
                    "Thanjavur": 1.15,
                }[dist]

                noise = random.uniform(0.85, 1.15)
                demand_kg = round(base_demand * dist_factor * season_factor * noise, 1)

                records.append({
                    "week_start": current_week_date.strftime("%Y-%m-%d"),
                    "week_of_year": week_of_year,
                    "category": cat,
                    "district": dist,
                    "season_factor": round(season_factor, 2),
                    "demand_kg": demand_kg,
                    "is_demo_sample": True
                })

    df = pd.DataFrame(records)
    out_dir = os.path.join(os.path.dirname(__file__), "../data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "synthetic_demand_history.csv")
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} synthetic demand records to {out_path}")

if __name__ == "__main__":
    generate_demo_dataset()

