from typing import Protocol, List, Dict, Any, Optional
from pydantic import BaseModel

class DemandRequest(BaseModel):
    category: str
    district: str
    current_orders: Optional[float] = 0.0
    current_stock: Optional[float] = 0.0

class DemandResult(BaseModel):
    category: str
    district: str
    predicted_demand_kg: float
    demand_level: str  # LOW, MEDIUM, HIGH
    confidence_score: float
    chart_data: List[Dict[str, Any]]
    stock_planning_recommendation: str
    explanation: str

class PriceRequest(BaseModel):
    product_name: str
    category: str
    district: str
    current_price: float
    unit: str
    cost_floor: Optional[float] = None

class PriceResult(BaseModel):
    product_name: str
    category: str
    district: str
    suggested_min: float
    suggested_recommended: float
    suggested_max: float
    current_price_status: str  # BELOW, WITHIN, ABOVE
    demand_indicator: str
    fair_price_breakdown: Dict[str, float]
    explanation: str

class StopPoint(BaseModel):
    id: int
    type: str  # PICKUP or DROP
    name: str
    district: str
    latitude: float
    longitude: float
    order_id: int

class RouteRequest(BaseModel):
    start_district: str
    start_lat: float
    start_lng: float
    stops: List[StopPoint]

class RouteResult(BaseModel):
    ordered_stops: List[StopPoint]
    total_distance_km: float
    estimated_minutes: int
    km_saved_vs_naive: float
    polyline: List[List[float]]

class DemandForecaster(Protocol):
    def forecast(self, req: DemandRequest) -> DemandResult: ...

class PriceAdvisor(Protocol):
    def advise(self, req: PriceRequest) -> PriceResult: ...

class RouteOptimizer(Protocol):
    def optimize(self, req: RouteRequest) -> RouteResult: ...

