"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function FormTrendChart({ data }: { data: Array<Record<string, number>> }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="year" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="xg" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="goals_scored" stroke="#0284c7" strokeWidth={2} />
          <Line type="monotone" dataKey="goals_conceded" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
