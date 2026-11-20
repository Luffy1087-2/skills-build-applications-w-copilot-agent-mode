import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadTeams = () => getJson<Record<string, unknown>>('/api/teams');

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadData={loadTeams}
      resultKey="teams"
      emptyText="No teams yet."
      renderItem={(team) => {
        const members = Array.isArray(team.members) ? team.members.map(String).join(', ') : 'No members';
        return `${String(team.name ?? 'Team')} (${members})`;
      }}
    />
  );
}
