import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function StatCard({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <Card>
      <CardDescription>{title}</CardDescription>
      <CardTitle className="mt-2 text-2xl">{value}</CardTitle>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </Card>
  );
}
