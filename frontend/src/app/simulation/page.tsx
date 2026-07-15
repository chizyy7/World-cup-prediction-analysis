"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getTeams, simulateKnockout } from "@/lib/api";
import { KnockoutResult, TeamFeatures } from "@/lib/types";

export default function SimulationPage() {
  const [teams, setTeams] = useState<TeamFeatures[]>([]);
  const [result, setResult] = useState<KnockoutResult | null>(null);

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  async function runSimulation() {
    setResult(await simulateKnockout(teams.slice(0, 8)));
  }

  return (
    <div>
      <PageHeader title="Knockout Tournament Simulation" description="Simulate bracket outcomes and visualize winner paths by probability." />
      <Button onClick={runSimulation}>Run 8-Team Simulation</Button>
      {result && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="text-lg font-semibold">Predicted Winner</h3>
            <p className="mt-2 text-2xl font-bold">{result.winner}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Champion probability {(result.winner_probability * 100).toFixed(1)}%</p>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{result.explanation}</p>
          </Card>
          <Card>
            <h3 className="mb-3 text-lg font-semibold">Winner Distribution</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(result.all_probabilities).map(([team, probability]) => (
                <div key={team} className="grid grid-cols-[120px_1fr_50px] items-center gap-2">
                  <span>{team}</span>
                  <div className="h-2 rounded bg-slate-200 dark:bg-slate-800">
                    <div className="h-2 rounded bg-emerald-600" style={{ width: `${(probability * 100).toFixed(1)}%` }} />
                  </div>
                  <span>{(probability * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
