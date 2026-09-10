import {useEffect, useMemo, useState} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';

interface ModuloMenu {
    id: number;
    antecessorId: number | null;
    rotulo: string;
}

const AG_CHARTS_ENTERPRISE_CDN = 'https://cdn.jsdelivr.net/npm/ag-charts-enterprise@14.1.0/dist/umd/ag-charts-enterprise.min.js';

export default function ViewMenuListMapaMenuListScreen() {
    const [modulos, setModulos] = useState<ModuloMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [direcao, setDirecao] = useState<'VERTICAL' | 'HORIZONTAL' | 'TOGGLE_REVERSE'>('VERTICAL');
    const [collapsed, setCollapsed] = useState<string[]>([]);
    const [selectedNoId, setSelectedNoId] = useState<string>('');

    useEffect(() => {
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<ModuloMenu[]>('/api/basico/modulo/menu');
                if (ativo) setModulos(resp.data);
            } catch (erro) {
                if (ativo) setError('Erro ao carregar o menu.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, []);

    const nodes = useMemo(() =>
        modulos.map(m => ({
            id: m.id,
            parentId: m.antecessorId,
            name: m.rotulo,
        })),
        [modulos],
    );

    const idsComFilhos = useMemo(() => {
        const pais = new Set<string>();
        nodes.forEach(n => {
            if (n.parentId !== null && n.parentId !== undefined && String(n.parentId) !== '') {
                pais.add(String(n.parentId));
            }
        });
        return Array.from(pais);
    }, [nodes]);

    useEffect(() => {
        if (nodes.length === 0) return;

        // Load AG Charts script if not already present
        let scriptTag = document.getElementById('ag-charts-script') as HTMLScriptElement | null;
        if (!scriptTag) {
            scriptTag = document.createElement('script');
            scriptTag.id = 'ag-charts-script';
            scriptTag.src = AG_CHARTS_ENTERPRISE_CDN;
            document.head.appendChild(scriptTag);
        }

        let chartInstance: any = null;

        const initChart = () => {
            if (!(window as any).agCharts) {
                setTimeout(initChart, 100);
                return;
            }
            try {
                (window as any).agCharts.LicenseManager.setLicenseKey('USING_AG_CHARTS_DEVELOPER_LICENSE');
                const container = document.getElementById('myMapaMenuChart');
                if (!container) return;

                let direction = 'vertical';
                let reverse = false;
                if (direcao === 'HORIZONTAL') {
                    direction = 'horizontal';
                } else if (direcao === 'TOGGLE_REVERSE') {
                    direction = 'vertical';
                    reverse = true;
                }

                const options = {
                    container,
                    data: nodes,
                    initialState: {collapsed},
                    series: [{
                        type: 'organization',
                        idKey: 'id',
                        parentIdKey: 'parentId',
                        direction,
                        reverse,
                        innerSpacing: 20,
                        outerSpacing: 40,
                        depthSpacing: 52,
                        node: {
                            width: 190,
                            cornerRadius: 12,
                            title: {key: 'name', textAlign: 'left', fontSize: 14, fontWeight: 'bold'},
                            itemStyler: () => ({fill: '#1B65BF', fillOpacity: 0.15, stroke: '#1B65BF', strokeWidth: 2}),
                        },
                        link: {itemStyler: () => ({stroke: '#1B65BF'})},
                        expander: {text: {showAllChildren: true, showDirectChildren: true}},
                    }],
                };

                chartInstance = (window as any).agCharts.AgCharts.create(options);
            } catch (e) {
                console.error('Erro ao instanciar AG Charts:', e);
            }
        };

        const timer = setTimeout(initChart, 200);

        return () => {
            clearTimeout(timer);
            if (chartInstance && typeof chartInstance.destroy === 'function') {
                try { chartInstance.destroy(); } catch {}
            }
            const container = document.getElementById('myMapaMenuChart');
            if (container) container.innerHTML = '';
        };
    }, [nodes, direcao, collapsed]);

    const expandAll = () => setCollapsed([]);
    const collapseAll = () => setCollapsed(idsComFilhos);
    const toggleNode = () => {
        if (!selectedNoId) return;
        setCollapsed(prev => {
            const exists = prev.includes(selectedNoId);
            if (exists) return prev.filter(id => id !== selectedNoId);
            return [...prev, selectedNoId];
        });
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Mapa Menu</h1>
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}
                {nodes.length === 0 && !loading && <p>Nenhum módulo encontrado.</p>}

                {nodes.length > 0 && (
                    <div style={{padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center'}}>
                            <div>
                                <label style={{marginRight: '8px', fontWeight: 'bold', fontSize: '13px'}}>Direção:</label>
                                <select
                                    value={direcao}
                                    onChange={e => setDirecao(e.target.value as any)}
                                    style={{padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px'}}
                                >
                                    <option value="VERTICAL">Vertical</option>
                                    <option value="HORIZONTAL">Horizontal</option>
                                    <option value="TOGGLE_REVERSE">Toggle Reverse</option>
                                </select>
                            </div>
                            <button
                                onClick={expandAll}
                                style={{padding: '6px 12px', background: '#1B65BF', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'}}
                            >
                                Expand All
                            </button>
                            <button
                                onClick={collapseAll}
                                style={{padding: '6px 12px', background: '#1B65BF', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'}}
                            >
                                Collapse All
                            </button>
                            <div>
                                <select
                                    value={selectedNoId}
                                    onChange={e => setSelectedNoId(e.target.value)}
                                    style={{padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px', marginRight: '8px'}}
                                >
                                    <option value="">Selecione um nó...</option>
                                    {idsComFilhos.map(id => {
                                        const no = nodes.find(n => String(n.id) === id);
                                        return <option key={id} value={id}>{no ? no.name : id}</option>;
                                    })}
                                </select>
                                <button
                                    onClick={toggleNode}
                                    style={{padding: '6px 12px', background: '#1B65BF', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'}}
                                >
                                    Toggle Nó
                                </button>
                            </div>
                        </div>

                        <div id="myMapaMenuChart" style={{width: '100%', height: '600px'}}></div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
