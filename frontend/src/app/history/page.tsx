"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { getHistory } from "@/lib/api";

export default function HistoryPage() {
  const [items, setItems] = useState<Array<{ year: number; host: string; winner: string; runner_up: string }>>([]);

  useEffect(() => {
    getHistory().then(setItems);
  }, []);

  return (
    <div>
      <PageHeader title="Historical World Cup Statistics" description="Tournament outcomes, winners, and comparative context." />
      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.year} className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold">{item.year}</p>
            <p className="text-sm">Host: {item.host}</p>
            <p className="text-sm">Winner: {item.winner}</p>
            <p className="text-sm text-slate-500">Runner-up: {item.runner_up}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
