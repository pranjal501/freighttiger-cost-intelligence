
import re
import pandas as pd


# Maximum matching window for a note that does not specify
# a longer or shorter event duration.
DEFAULT_NOTE_WINDOW_DAYS = 7


def normalize_route(value):
    """Normalize route names for matching different separators."""
    if pd.isna(value):
        return ""

    value = str(value).strip().lower()
    value = re.sub(r"\s*(?:->|[-–—])\s*", "-", value)
    value = re.sub(r"\s+", " ", value)

    return value


def note_has_cost_impact(note):
    """
    Return True only when a note explicitly indicates a cost impact.

    Explicit statements that costs were not significantly affected
    or that the event does not affect the dataset are excluded.
    """
    text = str(note).lower()

    exclusions = [
        "not part of this dataset",
        "not significantly affected",
        "no significant impact on cost",
        "costs were not affected",
        "did not affect costs",
    ]

    if any(phrase in text for phrase in exclusions):
        return False

    impact_terms = [
        "higher trip costs",
        "higher costs",
        "transportation costs",
        "transport costs",
        "costs across all routes",
        "pushing up",
        "surcharge",
        "increased costs",
        "cost increase",
        "costs rose",
        "costs increased",
        "additional cost",
    ]

    return any(term in text for term in impact_terms)


def note_matches_route(note_row, route):
    """Check whether a note applies to a route."""
    applies_to = str(note_row["applies_to"]).strip()

    if applies_to.lower() == "all routes":
        return True

    note_route = normalize_route(applies_to)
    shipment_route = normalize_route(route)

    return note_route == shipment_route


def note_matches_date(note_row, week_of):
    """
    Match a note to a reporting week.

    A route-specific note can match when its date falls within the
    reporting week or the seven days immediately before it.

    An All Routes note matches its stated date and the following
    six days. This is a matching window, not proof of causation.
    """
    note_date = pd.to_datetime(
        note_row["date"], errors="coerce"
    )
    week_start = pd.to_datetime(
        week_of, errors="coerce"
    )

    if pd.isna(note_date) or pd.isna(week_start):
        return False

    week_end = week_start + pd.Timedelta(days=6)
    applies_to = str(note_row["applies_to"]).strip().lower()

    if applies_to == "all routes":
        effective_end = note_date + pd.Timedelta(
            days=DEFAULT_NOTE_WINDOW_DAYS - 1
        )

        return note_date <= week_end and effective_end >= week_start

    earliest_match = week_start - pd.Timedelta(
        days=DEFAULT_NOTE_WINDOW_DAYS
    )

    return earliest_match <= note_date <= week_end


def retrieve_matching_notes(route, week_of, context_notes):
    """
    Return relevant notes for a route and reporting week.

    Notes are filtered by route, date, and explicit cost impact.
    Original note IDs and note text are preserved.
    """
    required = {"note_id", "date", "applies_to", "note"}
    missing = required - set(context_notes.columns)

    if missing:
        raise ValueError(
            "Context notes are missing columns: "
            + ", ".join(sorted(missing))
        )

    matches = []

    for _, note_row in context_notes.iterrows():
        if not note_matches_route(note_row, route):
            continue

        if not note_matches_date(note_row, week_of):
            continue

        if not note_has_cost_impact(note_row["note"]):
            continue

        matches.append(
            {
                "note_id": note_row["note_id"],
                "date": note_row["date"],
                "applies_to": note_row["applies_to"],
                "note": note_row["note"],
            }
        )

    return matches


def attach_evidence(analysis, context_notes):
    """
    Attach matching evidence to the analysis output.

    The notes provide context, not proof that an event caused
    a particular cost change. No match means blank evidence fields.
    """
    result = analysis.copy()

    result["matched_note_id"] = None
    result["reason"] = ""

    for index, row in result.iterrows():
        matches = retrieve_matching_notes(
            route=row["route"],
            week_of=row["week_of"],
            context_notes=context_notes,
        )

        if not matches:
            continue

        # Deterministic choice: prefer the most recent matching note.
        matches.sort(
            key=lambda item: (
                pd.to_datetime(item["date"], errors="coerce"),
                str(item["note_id"]),
            ),
            reverse=True,
        )

        selected = matches[0]

        result.at[index, "matched_note_id"] = selected["note_id"]
        result.at[index, "reason"] = (
            f"Context note {selected['note_id']} "
            f"({selected['date']}): {selected['note']} "
            "This is relevant context, not proof of causation."
        )

    return result
