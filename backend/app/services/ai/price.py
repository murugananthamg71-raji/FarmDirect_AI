from app.services.ai.interface import PriceRequest, PriceResult

class BaselinePriceAdvisor:
    def advise(self, req: PriceRequest) -> PriceResult:
        product_name = req.product_name.strip().title()
        category = req.category.strip().title()
        district = req.district.strip().title()
        curr_price = req.current_price

        # Base market modal price benchmarks
        benchmarks = {
            "Tomato": 28.0,
            "Onion": 32.0,
            "Potato": 25.0,
            "Basmati Rice": 85.0,
            "Wheat": 30.0,
            "Banana (Nendran)": 45.0,
            "Alphonso Mango": 120.0,
            "Tender Coconut": 35.0,
            "Red Chilli": 180.0,
            "Turmeric": 140.0,
        }

        modal_price = benchmarks.get(product_name, curr_price if curr_price > 0 else 40.0)

        suggested_min = round(modal_price * 0.90, 2)
        suggested_rec = round(modal_price * 1.05, 2)
        suggested_max = round(modal_price * 1.20, 2)

        # Status check
        if curr_price < suggested_min:
            status = "BELOW"
            explanation = f"Your current price (₹{curr_price}) is lower than current district mandi benchmarks. Consider raising to ~₹{suggested_rec} for fair farmer profit margin."
        elif curr_price > suggested_max:
            status = "ABOVE"
            explanation = f"Your price (₹{curr_price}) is above typical market range. High price might slow consumer cart conversions unless organic certified."
        else:
            status = "WITHIN"
            explanation = f"Your current price (₹{curr_price}) is optimally aligned with local mandi benchmarks & direct platform demand."

        # Fair Price Breakdown calculation (Farmer gets ~75%, Logistics/Platform gets ~25%)
        farmer_share = round(suggested_rec * 0.75, 2)
        logistics_platform_fee = round(suggested_rec * 0.25, 2)

        breakdown = {
            "farmer_net_earnings": farmer_share,
            "logistics_and_platform_fee": logistics_platform_fee,
            "consumer_total_price": suggested_rec,
        }

        return PriceResult(
            product_name=product_name,
            category=category,
            district=district,
            suggested_min=suggested_min,
            suggested_recommended=suggested_rec,
            suggested_max=suggested_max,
            current_price_status=status,
            demand_indicator="HIGH" if status == "BELOW" else "MEDIUM",
            fair_price_breakdown=breakdown,
            explanation=explanation,
        )

