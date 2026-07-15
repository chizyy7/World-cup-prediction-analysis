"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { ChampionPrediction } from "@/lib/types";

export function ProbabilityChart({ data }: { data: ChampionPrediction[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.map((d) => ({ ...d, probability: Number((d.probability * 100).toFixed(1)) }))}>
          <XAxis dataKey="team" />
          <YAxis unit="%" />
          <Tooltip />
          <Bar dataKey="probability" fill="#059669" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
