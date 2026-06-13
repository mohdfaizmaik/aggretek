export default function LoadingSkeleton({ rows = 6 }) {
    return (
        <div className="table-container">
            <div style={{ padding: '0.8rem 1rem', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <div className="skeleton" style={{ height: 16, width: '60%', borderRadius: 4 }} />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        gap: '1.5rem',
                        padding: '0.85rem 1rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'var(--bg-surface)',
                    }}
                >
                    <div className="skeleton" style={{ height: 14, width: '12%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '14%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '18%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '10%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '8%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '8%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '8%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: '12%', borderRadius: 4 }} />
                </div>
            ))}
        </div>
    );
}
