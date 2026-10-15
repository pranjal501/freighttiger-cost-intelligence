
import pandas as pd

from src.data_loader import EXPECTED_OUTPUT_COLUMNS


# Configurable anomaly threshold: 20% increase.
ANOMALY_THRESHOLD_PERCENT = 20.0

# Compare against the previous eight calendar weeks.
HISTORY_WEEKS = 8

DATE_COLUMNS = ["date", "shipment_date", "week_of"]


def _find_date_column(shipments):
    """Find the date column available in the shipment dataset."""
    for column in DATE_COLUMNS:
        if column in shipments.columns:
            return column

    raise ValueError(
        "No date column found. Expected date, shipment_date, or week_of."
    )


def calculate_weekly_costs(shipments):
    """
    Calculate weekly cost per tonne-kilometre.

    Formula:
        Total freight cost (INR)
        -----------------------------------------
        Sum of (quantity in tonnes * distance in km)

    Weeks run Monday through Sunday.
    """
    required = {
        "origin",
        "destination",
        "route_type",
        "freight_cost_inr",
        "quantity_tonnes",
        "distance_km",
    }

    missing = required - set(shipments.columns)

    if missing:
        raise ValueError(
            "Missing shipment columns: "
            + ", ".join(sorted(missing))
        )

    date_column = _find_date_column(shipments)

    df = shipments.copy()

    # Convert dates and numeric fields safely.
    df["_date"] = pd.to_datetime(
        df[date_column], errors="coerce"
    )

    numeric_columns = [
        "freight_cost_inr",
        "quantity_tonnes",
        "distance_km",
    ]

    for column in numeric_columns:
        df[column] = pd.to_numeric(
            df[column], errors="coerce"
        )

    # Remove records that cannot be used for a valid calculation.
    df = df.dropna(
        subset=[
            "_date",
            "origin",
            "destination",
            "route_type",
            "freight_cost_inr",
            "quantity_tonnes",
            "distance_km",
        ]
    )

    df = df[
        (df["freight_cost_inr"] >= 0)
        & (df["quantity_tonnes"] > 0)
        & (df["distance_km"] > 0)
    ].copy()

    if df.empty:
        raise ValueError(
            "No valid shipment records remain after data validation."
        )

    # Monday is the beginning of each reporting week.
    df["week_of"] = (
        df["_date"].dt.normalize()
        - pd.to_timedelta(df["_date"].dt.weekday, unit="D")
    )

    # Keep route identity consistent across history and peer comparisons.
    df["route"] = (
        df["origin"].astype(str).str.strip()
        + " -> "
        + df["destination"].astype(str).str.strip()
    )

    # Calculate tonne-kilometres for every shipment before aggregation.
    df["_tonne_km"] = (
        df["quantity_tonnes"] * df["distance_km"]
    )

    weekly = (
        df.groupby(
            [
                "route",
                "origin",
                "destination",
                "route_type",
                "week_of",
            ],
            as_index=False,
        )
        .agg(
            total_freight_cost_inr=(
                "freight_cost_inr", "sum"
            ),
            total_tonne_km=("_tonne_km", "sum"),
        )
    )

    weekly["cost_per_tonne_km"] = (
        weekly["total_freight_cost_inr"]
        / weekly["total_tonne_km"]
    )

    return weekly.sort_values(
        ["route_type", "route", "week_of"]
    ).reset_index(drop=True)


def compare_route_costs(
    weekly_costs,
    threshold_percent=ANOMALY_THRESHOLD_PERCENT,
):
    """
    Compare each route with:
    1. Its own available observations in the preceding eight weeks.
    2. Other routes of the same route_type in the same week.

    Positive increases above the configured threshold trigger a flag.
    Missing comparison baselines remain blank.
    """
    required = {
        "route",
        "route_type",
        "week_of",
        "cost_per_tonne_km",
    }

    missing = required - set(weekly_costs.columns)

    if missing:
        raise ValueError(
            "Missing weekly cost columns: "
            + ", ".join(sorted(missing))
        )

    if threshold_percent < 0:
        raise ValueError("Threshold cannot be negative.")

    df = weekly_costs.copy()
    df["week_of"] = pd.to_datetime(
        df["week_of"], errors="coerce"
    )
    df["cost_per_tonne_km"] = pd.to_numeric(
        df["cost_per_tonne_km"], errors="coerce"
    )

    results = []

    for _, current in df.iterrows():
        route = current["route"]
        route_type = current["route_type"]
        week = current["week_of"]
        current_cost = current["cost_per_tonne_km"]

        own_change = None
        peer_change = None

        if pd.notna(week) and pd.notna(current_cost):
            # Only observations from the previous eight calendar weeks.
            history_start = week - pd.Timedelta(weeks=HISTORY_WEEKS)

            history = df[
                (df["route"] == route)
                & (df["route_type"] == route_type)
                & (df["week_of"] >= history_start)
                & (df["week_of"] < week)
                & (df["cost_per_tonne_km"].notna())
            ]

            if not history.empty:
                history_average = history[
                    "cost_per_tonne_km"
                ].mean()

                if history_average > 0:
                    own_change = (
                        (current_cost - history_average)
                        / history_average
                    ) * 100

            peers = df[
                (df["route_type"] == route_type)
                & (df["week_of"] == week)
                & (df["route"] != route)
                & (df["cost_per_tonne_km"].notna())
            ]

            if not peers.empty:
                peer_average = peers[
                    "cost_per_tonne_km"
                ].mean()

                if peer_average > 0:
                    peer_change = (
                        (current_cost - peer_average)
                        / peer_average
                    ) * 100

        # Missing baselines do not count as evidence of an anomaly.
        flagged = (
            (own_change is not None
             and own_change > threshold_percent)
            or
            (peer_change is not None
             and peer_change > threshold_percent)
        )

        results.append(
            {
                "route": route,
                "week_of": (
                    week.strftime("%Y-%m-%d")
                    if pd.notna(week)
                    else ""
                ),
                "cost_per_tonne_km": (
                    round(float(current_cost), 4)
                    if pd.notna(current_cost)
                    else None
                ),
                "vs_own_history": (
                    round(own_change, 2)
                    if own_change is not None
                    else None
                ),
                "vs_similar_routes": (
                    round(peer_change, 2)
                    if peer_change is not None
                    else None
                ),
                "flagged": bool(flagged),
                "matched_note_id": None,
                "reason": "",
            }
        )

    return pd.DataFrame(
        results,
        columns=EXPECTED_OUTPUT_COLUMNS,
    )
