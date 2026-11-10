import pandas as pd
from typing import List, Optional
from api.schemas.models import RecommendationResponse, MarketRecommendationItem

# Standard freight rates for agricultural transport (₹ per km per quintal)
DEFAULT_FREIGHT_RATE_PER_KM_QTL = 0.45 # ~₹45 to transport 1 quintal 100 km

# Approximate road distance matrix between key mandi centers (km)
# Centered around common regional trading corridors for easy explanation
ESTIMATED_DISTANCES: dict[tuple[str, str], float] = {
    ("Khanna", "Ludhiana"): 45.0,
    ("Khanna", "Jalandhar City"): 105.0,
    ("Khanna", "Amritsar"): 185.0,
    ("Khanna", "Patiala"): 60.0,
    ("Khanna", "Bathinda"): 160.0,
    ("Khanna", "Karnal"): 155.0,
    ("Khanna", "Thanesar"): 120.0,
    ("Khanna", "Sirsa"): 210.0,
    ("Khanna", "Agra"): 440.0,
    ("Khanna", "Kota"): 610.0,
    ("Karnal", "Thanesar"): 35.0,
    ("Karnal", "Kaithal"): 65.0,
    ("Karnal", "Sirsa"): 190.0,
    ("Karnal", "Rewari"): 175.0,
    ("Karnal", "Agra"): 290.0,
    ("Karnal", "Aligarh"): 235.0,
    ("Agra", "Aligarh"): 85.0,
    ("Agra", "Farrukhabad"): 170.0,
    ("Agra", "Bareilly"): 210.0,
    ("Indore", "Ujjain"): 55.0,
    ("Indore", "Sehore"): 155.0,
    ("Indore", "Neemuch"): 260.0,
    ("Indore", "Kota"): 315.0,
    ("Lasalgaon", "Pimpalgaon"): 35.0,
    ("Lasalgaon", "Nashik"): 60.0,
    ("Lasalgaon", "Pune (Gultekdi)"): 210.0,
    ("Lasalgaon", "Ahmednagar"): 145.0,
}

def get_mandi_distance(origin: str, destination: str) -> float:
    """Returns approximate road distance between two markets in kilometers."""
    if origin.lower() == destination.lower():
        return 0.0
    pair = (origin, destination)
    reverse_pair = (destination, origin)
    if pair in ESTIMATED_DISTANCES:
        return ESTIMATED_DISTANCES[pair]
    if reverse_pair in ESTIMATED_DISTANCES:
        return ESTIMATED_DISTANCES[reverse_pair]
    # Default regional distance approximation for unlisted pairs
    return 120.0

def compute_market_recommendations(
    df: pd.DataFrame,
    commodity: str,
    origin_market: str,
    quantity_quintals: float = 50.0,
    vehicle_type: str = "Standard Agricultural Truck",
    custom_cost_per_km: Optional[float] = None,
    custom_loading_cost: Optional[float] = None,
    max_distance_km: Optional[float] = 400.0,
) -> RecommendationResponse:
    """
    Computes market recommendations by deducting estimated transport costs from reported prices.
    Formula:
      Transport Cost per Quintal = Distance (km) * Freight Rate per km per quintal
      Net Price per Quintal = Reported Modal Price - Transport Cost per Quintal
      Total Net Proceeds = Net Price per Quintal * Quantity (Quintals)
      Net Advantage vs. Local = Destination Net Proceeds - Local Net Proceeds
    """
    sub_df = df[df["Commodity"].str.lower() == commodity.lower()].copy()
    if len(sub_df) == 0:
        raise ValueError(f"No records found for commodity '{commodity}'.")

    # Get the latest observation per market
    latest_records = []
    for _, group in sub_df.groupby("Market"):
        sorted_group = group.sort_values(by="Date", ascending=False)
        latest_records.append(sorted_group.iloc[0])
    latest_df = pd.DataFrame(latest_records)

    # Find origin market observation
    origin_matches = latest_df[latest_df["Market"].str.lower() == origin_market.lower()]
    if len(origin_matches) == 0:
        origin_row = latest_df.iloc[0]
        origin_market = origin_row["Market"]
    else:
        origin_row = origin_matches.iloc[0]

    freight_rate = custom_cost_per_km if custom_cost_per_km is not None else DEFAULT_FREIGHT_RATE_PER_KM_QTL
    candidates = []

    for _, row in latest_df.iterrows():
        cand_market = row["Market"]
        cand_price = float(row["Modal_Price"])
        cand_date = str(row["Date"])
        cand_state = str(row["State"])
        cand_dist = str(row["District"])

        is_origin = (cand_market.lower() == origin_market.lower())
        distance_km = get_mandi_distance(origin_market, cand_market)

        if max_distance_km and distance_km > max_distance_km and not is_origin:
            continue

        # Transport cost calculations
        cost_per_qtl = round(distance_km * freight_rate, 2)
        net_price_per_qtl = round(cand_price - cost_per_qtl, 2)
        total_proceeds = round(net_price_per_qtl * quantity_quintals, 2)
        total_transport_cost = round(cost_per_qtl * quantity_quintals, 2)

        candidates.append({
            "market": cand_market,
            "district": cand_dist,
            "state": cand_state,
            "reported_modal_price": cand_price,
            "price_date": cand_date,
            "is_fresh_data": True,
            "distance_km": distance_km,
            "estimated_transport_cost_total": total_transport_cost,
            "estimated_transport_cost_per_quintal": cost_per_qtl,
            "estimated_net_price_per_quintal": net_price_per_qtl,
            "estimated_total_proceeds": total_proceeds,
            "is_origin": is_origin,
            "freshness_note": "Recent Observation",
        })

    # Sort descending by total net proceeds
    candidates.sort(key=lambda x: x["estimated_total_proceeds"], reverse=True)

    # Calculate difference versus selling at origin market
    origin_proceeds = 0.0
    origin_net_price = 0.0
    for item in candidates:
        if item["is_origin"]:
            origin_proceeds = item["estimated_total_proceeds"]
            origin_net_price = item["estimated_net_price_per_quintal"]
            break
    else:
        origin_proceeds = candidates[0]["estimated_total_proceeds"]
        origin_net_price = candidates[0]["estimated_net_price_per_quintal"]

    ranked_items: List[MarketRecommendationItem] = []
    for rank, item in enumerate(candidates, start=1):
        diff_proceeds = round(item["estimated_total_proceeds"] - origin_proceeds, 2)
        diff_qtl = round(item["estimated_net_price_per_quintal"] - origin_net_price, 2)

        ranked_items.append(MarketRecommendationItem(
            rank=rank,
            market=item["market"],
            district=item["district"],
            state=item["state"],
            reported_modal_price=item["reported_modal_price"],
            price_date=item["price_date"],
            is_fresh_data=item["is_fresh_data"],
            distance_km=item["distance_km"],
            estimated_transport_cost_total=item["estimated_transport_cost_total"],
            estimated_transport_cost_per_quintal=item["estimated_transport_cost_per_quintal"],
            estimated_net_price_per_quintal=item["estimated_net_price_per_quintal"],
            estimated_total_proceeds=item["estimated_total_proceeds"],
            difference_vs_local_per_quintal=diff_qtl,
            difference_vs_local_total=diff_proceeds,
            is_origin=item["is_origin"],
            freshness_note=item["freshness_note"],
        ))

    disclaimer = (
        "DECISION SUPPORT NOTICE: Estimated transport costs and net prices are approximations. "
        "Actual mandi gate prices fluctuate daily with crop quality and auction arrivals."
    )

    return RecommendationResponse(
        commodity=commodity,
        origin_market=origin_market,
        quantity_quintals=quantity_quintals,
        vehicle_type="Standard Transport",
        cost_per_km_assumed=freight_rate,
        base_handling_cost_assumed=0.0,
        recommendations=ranked_items,
        disclaimer=disclaimer,
    )
