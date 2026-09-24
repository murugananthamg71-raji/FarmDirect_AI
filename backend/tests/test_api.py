import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_demo_login():
    res = client.post("/api/v1/auth/login", json={
        "email": "farmer@demo.com",
        "password": "Demo@123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "FARMER"

def test_marketplace_products():
    res = client.get("/api/v1/products")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert len(data["items"]) > 0

def test_ai_demand_forecast():
    res = client.post("/api/v1/ai/demand-forecast", json={
        "category": "Vegetables",
        "district": "Coimbatore"
    })
    assert res.status_code == 200
    data = res.json()
    assert "predicted_demand_kg" in data
    assert "chart_data" in data

def test_ai_price_guidance():
    res = client.post("/api/v1/ai/price-guidance", json={
        "product_name": "Tomato",
        "category": "Vegetables",
        "district": "Coimbatore",
        "current_price": 28.0,
        "unit": "kg"
    })
    assert res.status_code == 200
    data = res.json()
    assert "fair_price_breakdown" in data
    assert "suggested_recommended" in data

def test_ai_route_optimization():
    res = client.post("/api/v1/ai/optimize-route", json={
        "start_district": "Coimbatore",
        "start_lat": 11.0168,
        "start_lng": 76.9558,
        "stops": [
            {
                "id": 1,
                "type": "PICKUP",
                "name": "Pickup 1",
                "district": "Coimbatore",
                "latitude": 11.0250,
                "longitude": 76.9600,
                "order_id": 101
            },
            {
                "id": 2,
                "type": "DROP",
                "name": "Drop 1",
                "district": "Coimbatore",
                "latitude": 11.0350,
                "longitude": 76.9700,
                "order_id": 101
            }
        ]
    })
    assert res.status_code == 200
    data = res.json()
    assert "total_distance_km" in data
    assert "km_saved_vs_naive" in data

