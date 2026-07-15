"use client";

import { useEffect, useMemo, useState } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { TeamSelect } from "@/components/team-select";
import { PageHeader } from "@/components/page-header";
import { getTeams } from "@/lib/api";
import { TeamFeatures } from "@/lib/types";

const metrics = ["elo_rating", "recent_form", "goals_scored", "possession", "xg", "wc_pedigree"] as const;

export default function ComparePage() {
  const [teams, setTeams] = useState<TeamFeatures[]>([]);
  const [left, setLeft] = useState("Argentina");
  const [right, setRight] = useState("France");

  useEffect(() => {
    getTeams().then((data) => {
      setTeams(data);
      if (data[0]) setLeft(data[0].team);
      if (data[1]) setRight(data[1].team);
    });
  }, []);

  const leftTeam = teams.find((t) => t.team === left);
  const rightTeam = teams.find((t) => t.team === right);

  const chartData = useMemo(() => {
    if (!leftTeam || !rightTeam) return [];
    return metrics.map((metric) => ({
      metric,
      [leftTeam.team]: Number(leftTeam[metric]),
      [rightTeam.team]: Number(rightTeam[metric]),
    }));
  }, [leftTeam, rightTeam]);

  return (
    <div>
      <PageHeader title="Team Comparison" description="Side-by-side statistical and probability-related team signal comparison." />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <TeamSelect teams={teams} value={left} onChange={setLeft} />
        <TeamSelect teams={teams} value={right} onChange={setRight} />
      </div>
      <Card>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              {leftTeam && <Radar dataKey={leftTeam.team} stroke="#16a34a" fill="#16a34a" fillOpacity={0.25} />}
              {rightTeam && <Radar dataKey={rightTeam.team} stroke="#2563eb" fill="#2563eb" fillOpacity={0.25} />}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
