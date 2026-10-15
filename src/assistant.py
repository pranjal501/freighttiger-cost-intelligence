
import pandas as pd

from src.cost_engine import (
    ANOMALY_THRESHOLD_PERCENT,
    calculate_weekly_costs,
    compare_route_costs,
)
from src.evidence_retriever import attach_evidence
from src.data_loader import EXPECTED_OUTPUT_COLUMNS


def run_analysis(
    shipments: pd.DataFrame,
    context_notes: pd.DataFrame,
    threshold_percent: float = ANOMALY_THRESHOLD_PERCENT,
) -> pd.DataFrame:
    """
    Run the complete deterministic freight-cost analysis.

    Steps:
    1. Calculate weekly cost per tonne-kilometre.
    2. Compare routes against history and peer routes.
    3. Attach relevant contextual evidence.
    4. Return exactly the required eight columns.
    """
    weekly_costs = calculate_weekly_costs(shipments)

    analysis = compare_route_costs(
        weekly_costs,
        threshold_percent=threshold_percent,
    )

    analysis = attach_evidence(
        analysis,
        context_notes,
    )

    # Keep contextual explanations only for flagged records.
    unflagged = ~analysis["flagged"].fillna(False).astype(bool)

    analysis.loc[unflagged, "matched_note_id"] = None
    analysis.loc[unflagged, "reason"] = ""

    # Preserve the exact required output schema.
    analysis = analysis[EXPECTED_OUTPUT_COLUMNS].copy()

    return analysis


def save_analysis(
    analysis: pd.DataFrame,
    output_path="outputs/freight_cost_analysis.csv",
) -> str:
    """Save results separately; never overwrite company input files."""
    from pathlib import Path

    destination = Path(output_path)
    destination.parent.mkdir(parents=True, exist_ok=True)

    analysis.to_csv(
        destination,
        index=False,
        encoding="utf-8-sig",
    )

    return str(destination)
