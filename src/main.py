# PUBLIC: FREIGHT ANALYSIS
# --------------------------------------------------

@app.get("/api/analyze")
def analyze():
    df = get_analysis()

    records = (
        df.astype(object)
        .where(pd.notna(df), None)
        .to_dict(orient="records")
    )

    flagged_count = 0
    matched_notes_count = 0

    for record in records:
        flag_value = str(
            record.get("flagged", "")
        ).strip().lower()

        if flag_value in {"true", "1", "yes"}:
            flagged_count += 1

        note_id = record.get("matched_note_id")

        if note_id is not None and str(note_id).strip():
            matched_notes_count += 1

    if "cost_per_tonne_km" in df.columns:
        costs = pd.to_numeric(
            df["cost_per_tonne_km"],
            errors="coerce",
        )
    else:
        costs = pd.Series(dtype=float)

    average_cost = (
        float(costs.mean())
        if not costs.dropna().empty
        else None
    )

    return JSONResponse(
        content={
            "total_records": len(records),
            "flagged_records": flagged_count,
            "matched_notes": matched_notes_count,
            "average_cost": average_cost,
            "records": records,
        }
    )


# --------------------------------------------------
# PUBLIC: FREIGHT ASSISTANT
# --------------------------------------------------

@app.post("/api/ask")
def ask_question(request: AskRequest):
    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Please enter a question.",
        )

    try:
        from src.assistant import answer_question

        answer = answer_question(question)

        return {
            "question": question,
            "answer": str(answer),
        }

    except ImportError:
        return {
            "question": question,
            "answer": (
                "The question endpoint is available, but a dedicated "
                "answer_question() function is not configured in "
                "src/assistant.py yet. The analysis dashboard can still "
                "use /api/analyze."
            ),
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not answer the question: {exc}",
        ) from exc


# --------------------------------------------------
# PUBLIC: CSV EXPORT
# --------------------------------------------------

@app.get("/api/export")
def export_analysis():
    get_analysis()

    if not OUTPUT_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="Analysis output CSV was not generated.",
        )

    return FileResponse(
        path=str(OUTPUT_FILE),
        media_type="text/csv",
        filename="freight_cost_analysis.csv",
    )
