import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchBar from '../components/SearchBar';
import PriceTable from '../components/PriceTable';
import SparklineChart from '../components/SparklineChart';
import { usePrices } from '../hooks/usePrices';

export default function HomePage() {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({ commodity: 'Wheat', market: '', state: '' });
    const [sort, setSort] = useState('price_date');
    const [order, setOrder] = useState('desc');
    const [page, setPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);

    const { data, pagination, loading, error } = usePrices({
        ...filters,
        sort,
        order,
        page,
        limit: 50,
    });

    const handleSearch = (vals) => {
        setFilters(vals);
        setPage(1);
        setSelectedRow(null);
    };

    const handleSort = (col) => {
        if (sort === col) setOrder(order === 'desc' ? 'asc' : 'desc');
        else { setSort(col); setOrder('desc'); }
        setPage(1);
    };

    return (
        <div className="page-wrapper">
            <div className="container">
                <div className="hero">
                    <h1>
                        {t('hero.title')} <span className="highlight">{t('hero.highlight')}</span> {t('hero.title_suffix')}
                    </h1>
                    <p>{t('hero.subtitle')}</p>
                </div>

                <SearchBar
                    onSearch={handleSearch}
                    initialCrop={filters.commodity}
                    initialMarket={filters.market}
                    initialState={filters.state}
                />

                <SparklineChart
                    commodity={selectedRow?.commodity_en || filters.commodity}
                    market={selectedRow?.market_name || filters.market}
                />

                <div style={{ marginTop: '1.5rem' }}>
                    {loading && data.length > 0 && (
                        <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            ↻ {t('table.loading')}
                        </div>
                    )}
                    <PriceTable
                        data={data}
                        loading={loading}
                        error={error}
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                        selectedRow={selectedRow}
                        onRowClick={setSelectedRow}
                        pagination={pagination}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </div>
    );
}
