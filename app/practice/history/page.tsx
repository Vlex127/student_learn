"use client";
import React, { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

import { getPracticeHistory } from "@/lib/api";

export default function PracticeHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        const res = await getPracticeHistory();

        if (res.data) setHistory(res.data.practice_sessions || []);
        setError(res.error || null);
      } catch (e) {
        setError("Failed to load practice history");
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        Loading practice history...
      </div>
    );
  }
  if (error) {
    return (
      <div className="container mx-auto py-12 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
        <TrendingUp size={28} /> Practice History
      </h1>
      {history.length === 0 ? (
        <div className="text-muted-foreground">No practice sessions yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100 dark:bg-zinc-800">
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Score</th>
                <th className="p-2 text-left">Correct</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session, idx) => (
                <tr key={idx} className="border-b">
                  <td className="p-2">{session.subject?.name || "-"}</td>
                  <td className="p-2">{session.score}</td>
                  <td className="p-2">{session.correct_answers}</td>
                  <td className="p-2">{session.total_questions}</td>
                  <td className="p-2">{session.time_taken}s</td>
                  <td className="p-2">
                    {session.completed_at
                      ? new Date(session.completed_at).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
