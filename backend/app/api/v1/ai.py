from fastapi import APIRouter, Depends
from app.services.ai.interface import DemandRequest, DemandResult, PriceRequest, PriceResult, RouteRequest, RouteResult
from app.services.ai.demand import BaselineDemandForecaster
from app.services.ai.price import BaselinePriceAdvisor
from app.services.ai.route import TSP2OptRouteOptimizer

router = APIRouter()

demand_service = BaselineDemandForecaster()
price_service = BaselinePriceAdvisor()
route_service = TSP2OptRouteOptimizer()

@router.post("/demand-forecast", response_model=DemandResult)
def get_demand_forecast(req: DemandRequest):
    return demand_service.forecast(req)

@router.post("/price-guidance", response_model=PriceResult)
def get_price_guidance(req: PriceRequest):
    return price_service.advise(req)

@router.post("/optimize-route", response_model=RouteResult)
def optimize_route(req: RouteRequest):
    return route_service.optimize(req)

