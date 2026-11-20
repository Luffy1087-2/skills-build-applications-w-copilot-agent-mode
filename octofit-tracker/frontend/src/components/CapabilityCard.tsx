import { useEffect, useState } from 'react';

type Props = {
  title: string;
  description: string;
  loadData: () => Promise<Record<string, unknown>>;
  resultKey: 'activities' | 'teams' | 'leaderboard' | 'suggestions';
  emptyText: string;
  renderItem: (item: Record<string, unknown>) => string;
};

export function CapabilityCard({ title, description, loadData, resultKey, emptyText, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setItems(null);
    setError('');

    loadData()
      .then((data) => {
        if (active) setItems(Array.isArray(data[resultKey]) ? data[resultKey] as Record<string, unknown>[] : []);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load data');
      });

    return () => { active = false; };
  }, [loadData, resultKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error && <p className="alert alert-danger" role="alert">Unable to load {title.toLowerCase()}: {error}</p>}
        {!error && items === null && <p role="status">Loading {title.toLowerCase()}...</p>}
        {!error && items !== null && items.length === 0 && <p>{emptyText}</p>}
        {!error && items !== null && items.length > 0 && (
          <ul className="list-unstyled">
            {items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}
