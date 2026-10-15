
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  FileCheck2,
  RefreshCw,
} from "lucide-react";

function MetricCard({ title, value, description, icon: Icon }) {
  return (
    <article className="border border-white/10 bg-[#1D1C18] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-white/55">{title}</p>
        <Icon size={20} className="text-[#FFBE00]" />
      </div>

      <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-white/45">
        {description}
      </p>
    </article>
  );
}

export default function Dashboard() {
  const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://freighttiger-cost-intelligence-2.onrender.com"
).replace(/\/$/, "");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch analysis directly without checking login.
      const response = await fetch(`${API_URL}/api/analyze`, {
  method: "GET",
  credentials: "include",
});

      if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
      }

      const result = await response.json();

      const records = Array.isArray(result)
        ? result
        : result?.records ?? result?.results ?? result?.data;

      if (!Array.isArray(records)) {
        throw new Error(
          "Unexpected API response: the records array is missing."
        );
      }

      const flaggedRecords = records.filter(
        (record) =>
          record.flagged === true ||
          record.flagged === 1 ||
          ["true", "1", "yes"].includes(
            String(record.flagged).toLowerCase()
          )
      );

      const matchedNotes = records.filter(
        (record) =>
          record.matched_note_id != null &&
          String(record.matched_note_id).trim() !== ""
      );

      const validCosts = records
        .map((record) => Number(record.cost_per_tonne_km))
        .filter((cost) => Number.isFinite(cost));

      const averageCost =
        validCosts.length > 0
          ? validCosts.reduce((sum, cost) => sum + cost, 0) /
            validCosts.length
          : null;

      setData({
        records,
        total_records: records.length,
        flagged_records: flaggedRecords.length,
        matched_notes: matchedNotes.length,
        average_cost: averageCost,
      });
    } catch (err) {
      console.error("Dashboard API error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load analysis."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const records = data?.records ?? [];

  return (
    <main className="min-h-screen bg-[#151512] text-white">
      <header className="border-b border-white/10 border-t-4 border-t-[#FFBE00]">
        <div className="mx-auto flex max-w-[1400px] flex-col justify-between gap-5 px-5 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#FFBE00]">
              YOUR ANALYTICS WORKSPACE
            </p>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Freight cost dashboard
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
              Understand your weekly route costs, identify unusual
              increases, and investigate the evidence behind them.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#FFBE00] px-4 py-3 text-xs font-bold text-black transition hover:bg-[#FFD34C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            {loading ? "LOADING..." : "REFRESH DATA"}
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
        {loading && (
          <p className="text-sm text-white/60">
            Loading your shipment analysis...
          </p>
        )}

        {error && (
          <div className="border border-red-400/30 bg-red-400/10 p-5">
            <p className="text-sm text-red-300">
              Unable to load analysis: {error}
            </p>

            <button
              type="button"
              onClick={loadData}
              className="mt-4 text-xs font-bold text-[#FFBE00]"
            >
              TRY AGAIN →
            </button>

            <p className="mt-3 text-xs text-white/50">
              Check that the Python backend is running and that
              /api/analyze is accessible.
            </p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Weekly route records"
                value={data.total_records}
                description="Route-week records returned by the analysis."
                icon={Database}
              />

              <MetricCard
                title="Flagged records"
                value={data.flagged_records}
                description="Records flagged by the backend's configured rules."
                icon={AlertTriangle}
              />

              <MetricCard
                title="Matched context notes"
                value={data.matched_notes}
                description="Records associated with a context note."
                icon={FileCheck2}
              />

              <MetricCard
                title="Average weekly cost"
                value={
                  data.average_cost == null
                    ? "—"
                    : `₹${data.average_cost.toFixed(4)}`
                }
                description="Unweighted average cost per tonne-kilometre."
                icon={Activity}
              />
            </div>

            <section className="mt-10 border border-white/10 bg-[#1D1C18]">
              <div className="border-b border-white/10 px-5 py-5 sm:px-7">
                <p className="text-[10px] font-bold tracking-[0.17em] text-[#FFBE00]">
                  ANALYSIS RESULTS
                </p>

                <h2 className="mt-3 text-xl font-semibold">
                  Route-week records
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-[#24231E] text-white/60">
                    <tr>
                      {[
                        "Route",
                        "Week starting",
                        "Cost / tonne-km",
                        "Own history",
                        "Peer routes",
                        "Status",
                        "Note ID",
                        "Reason",
                      ].map((heading) => (
                        <th key={heading} className="px-4 py-4">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {records.slice(0, 100).map((record, index) => {
                      const isFlagged =
                        record.flagged === true ||
                        record.flagged === 1 ||
                        ["true", "1", "yes"].includes(
                          String(record.flagged).toLowerCase()
                        );

                      return (
                        <tr
                          key={`${record.route}-${record.week_of}-${index}`}
                          className="border-t border-white/[0.07] hover:bg-white/[0.03]"
                        >
                          <td className="px-4 py-4 font-medium">
                            {record.route ?? "—"}
                          </td>

                          <td className="px-4 py-4 text-white/60">
                            {record.week_of ?? "—"}
                          </td>

                          <td className="px-4 py-4">
                            {record.cost_per_tonne_km == null
                              ? "—"
                              : Number(
                                  record.cost_per_tonne_km
                                ).toFixed(4)}
                          </td>

                          <td className="px-4 py-4 text-white/60">
                            {record.vs_own_history == null
                              ? "—"
                              : `${record.vs_own_history}%`}
                          </td>

                          <td className="px-4 py-4 text-white/60">
                            {record.vs_similar_routes == null
                              ? "—"
                              : `${record.vs_similar_routes}%`}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={
                                isFlagged
                                  ? "text-red-300"
                                  : "text-emerald-300"
                              }
                            >
                              {isFlagged ? "FLAGGED" : "NORMAL"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            {record.matched_note_id ?? "—"}
                          </td>

                          <td className="max-w-xs px-4 py-4 text-white/60">
                            {record.reason ?? "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="px-5 py-4 text-xs text-white/45">
                Showing up to 100 records. Calculations are provided by
                the Python backend.
              </p>
            </section>

            
<a
  href={`${API_URL}/api/export`}
  onClick={async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/export`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Export failed: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "freight_cost_analysis.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
      alert(error.message);
    }
  }}
  className="mt-6 inline-flex items-center rounded-sm bg-[#FFBE00] px-4 py-3 text-xs font-bold text-black hover:bg-[#FFD34C]"
>
  EXPORT CSV ↗
</a>

          </>
        )}
      </section>
    </main>
  );
}
