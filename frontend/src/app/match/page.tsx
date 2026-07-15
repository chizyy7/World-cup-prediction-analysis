"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeamSelect } from "@/components/team-select";
import { PageHeader } from "@/components/page-header";
import { getTeams, predictMatch } from "@/lib/api";
import { MatchPrediction, TeamFeatures } from "@/lib/types";

export default function MatchPage() {
  const [teams, setTeams] = useState<TeamFeatures[]>([]);
  const [home, setHome] = useState("Argentina");
  const [away, setAway] = useState("France");
  const [result, setResult] = useState<MatchPrediction | null>(null);

  useEffect(() => {
    getTeams().then((data) => {
      setTeams(data);
      if (data[0]) setHome(data[0].team);
      if (data[1]) setAway(data[1].team);
    });
  }, []);

  const homeTeam = useMemo(() => teams.find((t) => t.team === home), [teams, home]);
  const awayTeam = useMemo(() => teams.find((t) => t.team === away), [teams, away]);

  async function runPrediction() {
    if (!homeTeam || !awayTeam) return;
    setResult(await predictMatch(homeTeam, awayTeam));
  }

  const pieData = result
    ? [
        { name: `${result.home_team} Win`, value: Number((result.home_win_probability * 100).toFixed(1)) },
        { name: "Draw", value: Number((result.draw_probability * 100).toFixed(1)) },
        { name: `${result.away_team} Win`, value: Number((result.away_win_probability * 100).toFixed(1)) },
      ]
    : [];

  return (
    <div>
      <PageHeader title="Match Outcome Prediction" description="Predict head-to-head outcomes with confidence scores and explanations." />
      <div className="mb-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
        <TeamSelect teams={teams} value={home} onChange={setHome} />
        <TeamSelect teams={teams} value={away} onChange={setAway} />
        <Button onClick={runPrediction}>Predict</Button>
      </div>
      {result && (
        <Card>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={["#10b981", "#94a3b8", "#2563eb"][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Prediction Summary</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {pieData.map((item) => (
                  <li key={item.name}>{item.name}: {item.value}%</li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{result.explanation}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
