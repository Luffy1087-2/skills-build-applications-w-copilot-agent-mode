import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadLeaderboard = () => getJson<Record<string, unknown>>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loadData={loadLeaderboard}
      resultKey="leaderboard"
      emptyText="No leaderboard rankings yet."
      renderItem={(entry) => `Rank ${String(entry.rank ?? '')}: ${String(entry.teamName ?? 'Unknown team')} - ${String(entry.totalPoints ?? 0)} points`}
    />
  );
}
