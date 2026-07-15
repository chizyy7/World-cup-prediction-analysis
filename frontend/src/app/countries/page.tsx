"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getTeams } from "@/lib/api";
import { TeamFeatures } from "@/lib/types";

export default function CountriesPage() {
  const [teams, setTeams] = useState<TeamFeatures[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getTeams().then(setTeams);
  }, []);

  const filtered = useMemo(() => teams.filter((t) => t.team.toLowerCase().includes(query.toLowerCase())), [teams, query]);

  return (
    <div>
      <PageHeader title="Country Profiles" description="Search and explore AI-ready national team profiles and metrics." />
      <Input placeholder="Search team..." value={query} onChange={(e) => setQuery(e.target.value)} className="mb-4 max-w-sm" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((team) => (
          <Link key={team.team} href={`/countries/${encodeURIComponent(team.team)}`}>
            <Card className="transition hover:-translate-y-0.5">
              <h3 className="font-semibold">{team.team}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Elo {team.elo_rating} • FIFA Rank {team.fifa_rank}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
