import { CapabilityCard } from './CapabilityCard.js';
export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      resultKey="leaderboard"
      emptyText="No leaderboard rankings yet."
      renderItem={(entry) => `Rank ${String(entry.rank ?? '')}: ${String(entry.teamName ?? 'Unknown team')} - ${String(entry.totalPoints ?? 0)} points`}
    />
  );
}
