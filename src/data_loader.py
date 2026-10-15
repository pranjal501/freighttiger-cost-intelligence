from pathlib import Path

import pandas as pd


# --------------------------------------------------
# PROJECT PATHS
# --------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"

SHIPMENTS_FILE = DATA_DIR / "shipment_records.csv"
CONTEXT_FILE = DATA_DIR / "context_notes.csv"
OUTPUT_FORMAT_FILE = DATA_DIR / "sample_output_format_v2.csv"


# --------------------------------------------------
# EXPECTED OUTPUT COLUMNS
# --------------------------------------------------

EXPECTED_OUTPUT_COLUMNS = [
    "route",
    "week_of",
    "cost_per_tonne_km",
    "vs_own_history",
    "vs_similar_routes",
    "flagged",
    "matched_note_id",
    "reason",
]


# --------------------------------------------------
# GENERIC CSV LOADER
# --------------------------------------------------

def load_csv(file_path: Path) -> pd.DataFrame:
    """Load a company-provided CSV without modifying the original file."""

    if not file_path.exists():
        raise FileNotFoundError(
            f"Required file not found: {file_path}"
        )

    try:
        return pd.read_csv(
            file_path,
            encoding="utf-8-sig",
        )

    except pd.errors.EmptyDataError as exc:
        raise ValueError(
            f"The CSV file is empty: {file_path.name}"
        ) from exc

    except pd.errors.ParserError as exc:
        raise ValueError(
            f"Could not parse {file_path.name}. "
            "The file may contain malformed CSV rows. "
            "The original file has not been changed."
        ) from exc


# --------------------------------------------------
# LOAD SHIPMENT RECORDS
# --------------------------------------------------

def load_shipment_records() -> pd.DataFrame:
    """Load the shipment dataset."""

    return load_csv(SHIPMENTS_FILE)


# --------------------------------------------------
# LOAD CONTEXT NOTES
# --------------------------------------------------

def load_context_notes() -> pd.DataFrame:
    """Load contextual notes for investigating cost changes."""

    return load_csv(CONTEXT_FILE)


# --------------------------------------------------
# LOAD AND VALIDATE OUTPUT FORMAT
# --------------------------------------------------

def load_output_format() -> pd.DataFrame:
    """
    Read only the output template header.

    The company-provided sample includes descriptive example rows
    that may not be valid machine-readable CSV records.
    """

    if not OUTPUT_FORMAT_FILE.exists():
        raise FileNotFoundError(
            f"Required file not found: {OUTPUT_FORMAT_FILE}"
        )

    try:
        header = pd.read_csv(
            OUTPUT_FORMAT_FILE,
            nrows=0,
            encoding="utf-8-sig",
        )

    except Exception as exc:
        raise ValueError(
            "Could not read the output template header. "
            "The original file has not been modified."
        ) from exc

    actual_columns = list(header.columns)

    if actual_columns != EXPECTED_OUTPUT_COLUMNS:
        raise ValueError(
            "The output template columns do not match "
            "the required schema.\n"
            f"Expected: {EXPECTED_OUTPUT_COLUMNS}\n"
            f"Found: {actual_columns}"
        )

    return header


# --------------------------------------------------
# VALIDATE SHIPMENT RECORDS
# --------------------------------------------------

def validate_shipment_records(
    shipments: pd.DataFrame,
) -> None:
    """Validate the minimum columns required by the cost engine."""

    required_columns = {
        "origin",
        "destination",
        "route_type",
        "freight_cost_inr",
        "quantity_tonnes",
        "distance_km",
    }

    missing = required_columns - set(shipments.columns)

    if missing:
        raise ValueError(
            "Shipment dataset is missing required columns: "
            + ", ".join(sorted(missing))
        )

    date_columns = {
        "date",
        "shipment_date",
        "week_of",
    }

    if not date_columns.intersection(shipments.columns):
        raise ValueError(
            "Shipment dataset must contain one date column: "
            "date, shipment_date, or week_of."
        )


# --------------------------------------------------
# LOAD ALL DATASETS
# --------------------------------------------------

def load_all_data():
    """
    Load and validate all three company-provided CSV files.

    Returns:
        shipments: Shipment records DataFrame
        context_notes: Context notes DataFrame
        output_format: Validated output template header
    """

    shipments = load_shipment_records()
    context_notes = load_context_notes()
    output_format = load_output_format()

    validate_shipment_records(shipments)

    return shipments, context_notes, output_format