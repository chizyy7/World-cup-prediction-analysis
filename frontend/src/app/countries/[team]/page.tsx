"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { FormTrendChart } from "@/components/form-trend-chart";
import { PageHeader } from "@/components/page-header";
import { getTeam } from "@/lib/api";
import { TeamFeatures } from "@/lib/types";

type TeamProfile = TeamFeatures & { history?: Array<Record<string, number>> };

export default function CountryDetailPage() {
  const params = useParams<{ team: string }>();
  const teamParam = decodeURIComponent(params.team ?? "");
  const [team, setTeam] = useState<TeamProfile | null>(null);

  useEffect(() => {
    getTeam(teamParam).then(setTeam);
  }, [teamParam]);

  if (!team) return <p>Loading team profile...</p>;

  return (
    <div>
      <PageHeader title={`${team.team} Profile`} description="Detailed metrics, historical form trends, and model-ready signals." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-slate-500">FIFA Rank</p><p className="text-2xl font-semibold">{team.fifa_rank}</p></Card>
        <Card><p className="text-sm text-slate-500">Elo Rating</p><p className="text-2xl font-semibold">{team.elo_rating}</p></Card>
        <Card><p className="text-sm text-slate-500">xG</p><p className="text-2xl font-semibold">{team.xg}</p></Card>
      </div>
      <Card className="mt-6">
        <h3 className="mb-3 text-lg font-semibold">Form & Historical Stats</h3>
        <FormTrendChart data={team.history ?? []} />
      </Card>
    </div>
  );
}
