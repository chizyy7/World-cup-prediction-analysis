import { TeamFeatures } from "@/lib/types";

export function TeamSelect({ value, teams, onChange }: { value: string; teams: TeamFeatures[]; onChange: (value: string) => void }) {
  return (
    <select className="h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 text-sm dark:border-slate-700" value={value} onChange={(e) => onChange(e.target.value)}>
      {teams.map((team) => (
        <option key={team.team} value={team.team}>
          {team.team}
        </option>
      ))}
    </select>
  );
}
