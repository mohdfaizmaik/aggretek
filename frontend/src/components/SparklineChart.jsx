import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useSparkline } from '../hooks/usePrices';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '8px 12px',
            fontSize: '0.85rem',
        }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
                    {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
                </p>
            ))}
        </div>
    );
};

export default function SparklineChart({ commodity, market }) {
    const { t } = useTranslation();
    const { data, loading, error } = useSparkline({ commodity, market, days: 7 });

    if (!commodity) return null;

    if (loading) return (
        <div className="chart-panel">
            <div className="skeleton" style={{ height: 200 }} />
        </div>
    );

    if (error || !data.length) return (
        <div className="chart-panel">
            <p className="text-muted text-sm" style={{ textAlign: 'center', padding: '2rem' }}>
                {t('chart.no_data')}
            </p>
        </div>
    );

    const formatted = data.map((d) => ({
        ...d,
        price_date: new Date(d.price_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        modal_price: parseFloat(d.modal_price),
        min_price: parseFloat(d.min_price),
        max_price: parseFloat(d.max_price),
    }));

    return (
        <div className="chart-panel">
            <div className="chart-header">
                <h3>{t('chart.title')} — {commodity}</h3>
                {market && <span className="text-sm text-muted">📍 {market}</span>}
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="colorModal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="price_date"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`}
                        width={52}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="modal_price"
                        name={t('chart.modal')}
                        stroke="#22c55e"
                        strokeWidth={2.5}
                        fill="url(#colorModal)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#22c55e' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="min_price"
                        name={t('chart.min')}
                        stroke="#60a5fa"
                        strokeWidth={1.5}
                        dot={false}
                        strokeDasharray="4 4"
                    />
                    <Line
                        type="monotone"
                        dataKey="max_price"
                        name={t('chart.max')}
                        stroke="#f87171"
                        strokeWidth={1.5}
                        dot={false}
                        strokeDasharray="4 4"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
