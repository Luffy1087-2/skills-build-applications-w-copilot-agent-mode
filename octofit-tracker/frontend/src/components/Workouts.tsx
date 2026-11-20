import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

const loadWorkoutSuggestions = () => getJson<Record<string, unknown>>('/api/workouts/suggestions/mona%40example.com');

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadData={loadWorkoutSuggestions}
      resultKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(suggestion) => `${String(suggestion.title ?? 'Workout')}: ${String(suggestion.reason ?? '')}`}
    />
  );
}
