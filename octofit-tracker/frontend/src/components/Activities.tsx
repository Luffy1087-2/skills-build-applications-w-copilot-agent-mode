import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadActivities = () => getJson<Record<string, unknown>>('/api/activities');

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadData={loadActivities}
      resultKey="activities"
      emptyText="No activities yet."
      renderItem={(activity) => `${String(activity.type ?? 'Activity')} - ${String(activity.minutes ?? 0)} minutes, ${String(activity.points ?? 0)} points`}
    />
  );
}
