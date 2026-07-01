import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import PriceTable from '../components/PriceTable';
import SparklineChart from '../components/SparklineChart';
import { useWatchlist } from '../hooks/useWatchlist';

export default function WatchlistPage() {
    const { t } = useTranslation();
    const { items, loading, refresh } = useWatchlist();
    const [selectedRow, setSelectedRow] = useState(null);
    const [error, setError] = useState(null);

    const tableData = items.map((item) => ({
        id: item.id,
        commodity_id: item.commodity_id,
        commodity_en: item.name_en,
        commodity_hi: item.name_hi,
        market_id: item.market_id,
        market_name: item.market_name,
        state: item.state,
        district: item.district,
        min_price: item.min_price,
        max_price: item.max_price,
        modal_price: item.modal_price,
        price_date: item.price_date,
        fetched_at: item.fetched_at,
        source: item.source,
        msp_price: item.msp_price,
        msp_status: item.msp_status,
        whatsapp_enabled: item.whatsapp_enabled,
        price_threshold_pct: item.price_threshold_pct,
    }));

    const handleRemove = async (id) => {
        try {
            await api.removeWatchlist(id);
            if (selectedRow?.id === id) setSelectedRow(null);
            await refresh();
        } catch (err) {
            setError(err.response?.data?.error || t('errors.fetch_failed'));
        }
    };

    const handleToggleAlert = async (row) => {
        try {
            await api.updateWatchlist(row.id, { 
                whatsapp_enabled: !row.whatsapp_enabled 
            });
            await refresh();
        } catch (err) {
            setError(err.response?.data?.error || t('errors.fetch_failed'));
        }
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="mb-6">
                    <h1>{t('watchlist.title')} ⭐</h1>
                    <p>{t('watchlist.subtitle')}</p>
                </div>

                {loading && items.length === 0 && (
                    <div className="empty-state">{t('common.loading')}</div>
                )}

                {!loading && items.length === 0 && (
                    <div className="empty-state card">
                        <span className="emoji">⭐</span>
                        <h3>{t('watchlist.empty')}</h3>
                        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            {t('nav.home')}
                        </Link>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <SparklineChart
                            commodity={selectedRow?.commodity_en || selectedRow?.name_en}
                            market={selectedRow?.market_name}
                        />

                        {error && (
                            <div className="empty-state" style={{ marginBottom: '1rem' }}>
                                <p>{error}</p>
                            </div>
                        )}

                        <PriceTable
                            data={tableData}
                            loading={loading}
                            error={null}
                            selectedRow={selectedRow}
                            onRowClick={setSelectedRow}
                            showWatchlist={false} // This means "show actions instead of add-to-watchlist button"
                            onRemove={handleRemove}
                            isWatchlistView={true}
                            onToggleAlert={handleToggleAlert}
                        />
                    </>
                )}
            </div>
        </div>
    );
}
