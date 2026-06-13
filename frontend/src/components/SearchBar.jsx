import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const FOCUS_STATES = ['', 'Maharashtra', 'Madhya Pradesh', 'Delhi'];

export default function SearchBar({ onSearch, initialCrop = '', initialMarket = '', initialState = '' }) {
    const { t } = useTranslation();
    const [crop, setCrop] = useState(initialCrop);
    const [market, setMarket] = useState(initialMarket);
    const [state, setState] = useState(initialState);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch({ commodity: crop.trim(), market: market.trim(), state: state.trim() });
    };

    const handleClear = () => {
        setCrop('');
        setMarket('');
        setState('');
        onSearch({ commodity: '', market: '', state: '' });
    };

    return (
        <form className="search-bar" onSubmit={handleSubmit}>
            <div style={{ flex: 1, minWidth: '220px' }}>
                <label className="form-label">{t('table.commodity')}</label>
                <input
                    id="crop-search"
                    className="input"
                    placeholder={t('search.placeholder')}
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                />
            </div>
            <div style={{ flex: 1, minWidth: '160px' }}>
                <label className="form-label">{t('search.state_label')}</label>
                <select
                    id="state-search"
                    className="input"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                >
                    {FOCUS_STATES.map((s) => (
                        <option key={s || 'all'} value={s}>
                            {s || t('search.state_all')}
                        </option>
                    ))}
                </select>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">{t('table.market')}</label>
                <input
                    id="market-search"
                    className="input"
                    placeholder={t('search.market_placeholder')}
                    value={market}
                    onChange={(e) => setMarket(e.target.value)}
                />
            </div>
            <div className="flex gap-2" style={{ alignSelf: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" id="search-btn">
                    🔍 {t('search.btn')}
                </button>
                {(crop || market || state) && (
                    <button type="button" className="btn btn-ghost" onClick={handleClear}>
                        {t('search.clear')}
                    </button>
                )}
            </div>
        </form>
    );
}
