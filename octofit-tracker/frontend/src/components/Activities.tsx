import { CapabilityCard } from './CapabilityCard.js';
export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      resultKey="activities"
      emptyText="No activities yet."
      renderItem={(activity) => `${String(activity.type ?? 'Activity')} - ${String(activity.minutes ?? 0)} minutes, ${String(activity.points ?? 0)} points`}
    />
  );
}
