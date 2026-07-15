"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { getTeams, predictChampion } from "@/lib/api";
import { ChampionPrediction, TeamFeatures } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Card } from "@/components/ui/card";
import { ProbabilityChart } from "@/components/probability-chart";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function DashboardPage() {
  const [teams, setTeams] = useState<TeamFeatures[]>([]);
  const [predictions, setPredictions] = useState<ChampionPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getTeams();
      setTeams(data);
      setPredictions(await predictChampion(data));
      setLoading(false);
    })();
  }, []);

  const totalTeams = teams.length;
  const top = predictions[0];
  const avgElo = useMemo(() => (teams.length ? Math.round(teams.reduce((a, t) => a + t.elo_rating, 0) / teams.length) : 0), [teams]);

  return (
    <div>
      <PageHeader title="Champion Probability Dashboard" description="Model-driven FIFA World Cup winner probabilities with explainable AI output." />
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3"><LoadingSkeleton /><LoadingSkeleton /><LoadingSkeleton /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard title="Top Predicted Champion" value={top?.team ?? "N/A"} description={top ? `${(top.probability * 100).toFixed(1)}% win probability` : ""} />
            <StatCard title="Teams Analyzed" value={String(totalTeams)} description="Current contender pool" />
            <StatCard title="Average Elo" value={String(avgElo)} description="Team strength baseline" />
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
            <Card>
              <h3 className="mb-4 text-lg font-semibold">Champion Probability Chart</h3>
              <ProbabilityChart data={predictions} />
            </Card>
          </motion.div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {predictions.slice(0, 6).map((team) => (
              <Card key={team.team}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{team.team}</h4>
                  <span className="text-sm font-medium">{(team.probability * 100).toFixed(1)}%</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{team.explanation}</p>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
