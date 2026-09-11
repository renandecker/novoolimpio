import {useEffect, useMemo, useState} from 'react';
import ReactECharts from 'echarts-for-react';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';

interface ModuloMenu {
    id: number;
    antecessorId: number | null;
    rotulo: string;
}

export default function ViewMenuListMapaMenuListScreen() {
    const [modulos, setModulos] = useState<ModuloMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [direcao, setDirecao] = useState<'VERTICAL' | 'HORIZONTAL' | 'TOGGLE_REVERSE'>('VERTICAL');

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

    // Construir árvore para o Apache ECharts (Tree Chart)
    const treeData = useMemo(() => {
        if (!modulos.length) return [];
        const map = new Map<number, any>();
        modulos.forEach(m => {
            map.set(m.id, {
                name: m.rotulo,
                id: m.id,
                children: []
            });
        });

        const roots: any[] = [];
        modulos.forEach(m => {
            const node = map.get(m.id);
            if (m.antecessorId !== null && map.has(m.antecessorId)) {
                map.get(m.antecessorId).children.push(node);
            } else {
                roots.push(node);
            }
        });

        // Se houver múltiplos raízes, criar um nó raiz virtual
        if (roots.length > 1) {
            return [{
                name: 'Menu Principal',
                children: roots
            }];
        }
        return roots;
    }, [modulos]);

    const option = useMemo(() => {
        let orient = 'TB'; // Top to Bottom (Vertical)
        if (direcao === 'HORIZONTAL') {
            orient = 'LR'; // Left to Right
        } else if (direcao === 'TOGGLE_REVERSE') {
            orient = 'BT'; // Bottom to Top
        }

        return {
            tooltip: {
                trigger: 'item',
                triggerOn: 'mousemove'
            },
            series: [
                {
                    type: 'tree',
                    data: treeData,
                    top: '5%',
                    left: '10%',
                    bottom: '5%',
                    right: '20%',
                    symbolSize: 12,
                    orient: orient,
                    label: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 13,
                        color: '#0f172a'
                    },
                    leaves: {
                        label: {
                            position: 'right',
                            verticalAlign: 'middle',
                            align: 'left'
                        }
                    },
                    emphasis: {
                        focus: 'descendant'
                    },
                    expandAndCollapse: true,
                    animationDuration: 550,
                    animationDurationUpdate: 750,
                    itemStyle: {
                        color: '#1B65BF',
                        borderColor: '#1B65BF'
                    },
                    lineStyle: {
                        color: '#cbd5e1',
                        width: 2,
                        curveness: 0.5
                    }
                }
            ]
        };
    }, [treeData, direcao]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Mapa Menu</h1>
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}
                {modulos.length === 0 && !loading && <p>Nenhum módulo encontrado.</p>}

                {modulos.length > 0 && (
                    <div style={{padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center'}}>
                            <div>
                                <label style={{marginRight: '8px', fontWeight: 'bold', fontSize: '13px'}}>Direção:</label>
                                <select
                                    value={direcao}
                                    onChange={e => setDirecao(e.target.value as any)}
                                    style={{padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px'}}
                                >
                                    <option value="VERTICAL">Vertical (Top-Bottom)</option>
                                    <option value="HORIZONTAL">Horizontal (Left-Right)</option>
                                    <option value="TOGGLE_REVERSE">Invertido (Bottom-Top)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{width: '100%', height: '600px'}}>
                            <ReactECharts option={option} style={{height: '100%', width: '100%'}} />
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
