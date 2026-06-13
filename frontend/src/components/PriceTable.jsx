import { useTranslation } from 'react-i18next';
import MSPBadge from './MSPBadge';
import FreshnessBadge from './FreshnessBadge';
import WatchlistButton from './WatchlistButton';
import LoadingSkeleton from './LoadingSkeleton';

const BASE_COLS = [
    { key: 'price_date', label_key: 'table.date', sortable: true },
    { key: 'commodity_en', label_key: 'table.commodity', sortable: true },
    { key: 'market_name', label_key: 'table.market', sortable: true },
    { key: 'state', label_key: 'table.state', sortable: true },
    { key: 'min_price', label_key: 'table.min', sortable: true },
    { key: 'max_price', label_key: 'table.max', sortable: true },
    { key: 'modal_price', label_key: 'table.modal', sortable: true },
    { key: 'msp', label_key: 'table.msp', sortable: false },
    { key: 'updated', label_key: 'table.updated', sortable: false },
    { key: 'source', label_key: 'table.source', sortable: false },
];

function fmt(val) {
    if (val == null) return '—';
    return '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export default function PriceTable({
    data = [],
    loading,
    error,
    sort,
    order,
    onSort,
    selectedRow,
    onRowClick,
    pagination,
    onPageChange,
    showWatchlist = true,
    onRemove,
}) {
    const { t } = useTranslation();

    const cols = [
        ...BASE_COLS,
        ...(showWatchlist
            ? [{ key: 'watchlist', label_key: '', sortable: false }]
            : [{ key: 'actions', label_key: 'common.actions', sortable: false }]),
    ];

    if (loading && data.length === 0) return <LoadingSkeleton rows={8} />;

    if (error) return (
        <div className="empty-state">
            <span className="emoji">⚠️</span>
            <h3>{t('common.error')}</h3>
            <p>{error}</p>
        </div>
    );

    if (!loading && data.length === 0) return (
        <div className="empty-state">
            <span className="emoji">🌾</span>
            <h3>{t('table.no_data')}</h3>
        </div>
    );

    const SortIcon = ({ col }) => {
        if (!col.sortable || !onSort) return null;
        if (sort !== col.key) return <span style={{ opacity: 0.3 }}>⇅</span>;
        return <span>{order === 'asc' ? '↑' : '↓'}</span>;
    };

    return (
        <>
            <div className="table-container">
                <table className="price-table" id="price-table">
                    <thead>
                        <tr>
                            {cols.map((col) => (
                                <th
                                    key={col.key}
                                    className={sort === col.key ? 'sort-active' : ''}
                                    onClick={() => col.sortable && onSort?.(col.key)}
                                    style={{ cursor: col.sortable && onSort ? 'pointer' : 'default' }}
                                >
                                    {col.label_key ? t(col.label_key) : ''} <SortIcon col={col} />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                className={selectedRow?.id === row.id ? 'selected' : ''}
                                onClick={() => onRowClick?.(row)}
                            >
                                <td className="text-sm text-muted">{row.price_date || '—'}</td>
                                <td>
                                    <div className="crop-cell">
                                        <span className="crop-en">{row.commodity_en}</span>
                                        <span className="crop-hi">{row.commodity_hi}</span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 500 }}>{row.market_name || t('common.all_markets')}</div>
                                    {row.district && <div className="text-xs text-muted">{row.district}</div>}
                                </td>
                                <td className="text-sm">{row.state || '—'}</td>
                                <td className="price-muted font-mono">{fmt(row.min_price)}</td>
                                <td className="price-muted font-mono">{fmt(row.max_price)}</td>
                                <td className="price-value font-mono">
                                    {row.modal_price != null ? fmt(row.modal_price) : t('watchlist.no_price')}
                                </td>
                                <td><MSPBadge status={row.msp_status} mspPrice={row.msp_price} /></td>
                                <td><FreshnessBadge fetchedAt={row.fetched_at} /></td>
                                <td>
                                    {row.source ? (
                                        <span className={`source-chip ${row.source}`}>
                                            {row.source === 'csv_fallback' ? 'CSV' : row.source}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td onClick={(e) => e.stopPropagation()}>
                                    {showWatchlist ? (
                                        <WatchlistButton commodityId={row.commodity_id} marketId={row.market_id} />
                                    ) : (
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => onRemove?.(row.id)}
                                        >
                                            {t('watchlist.remove')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.pages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange(pagination.page - 1)}
                    >
                        {t('common.prev')}
                    </button>
                    <span className="pagination-info">
                        {t('common.page', { current: pagination.page, total: pagination.pages })}
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={pagination.page >= pagination.pages}
                        onClick={() => onPageChange(pagination.page + 1)}
                    >
                        {t('common.next')}
                    </button>
                </div>
            )}
        </>
    );
}
