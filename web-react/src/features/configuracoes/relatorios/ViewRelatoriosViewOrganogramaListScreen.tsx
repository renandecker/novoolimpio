import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';

interface OrganogramaNo {
    id: string | number;
    parentId: string | number | null;
    name?: string;
    job?: string;
    department?: string;
    location?: string;
    status?: string;
    avatar?: string;
    cor?: string;
    [key: string]: unknown;
}

interface OrganogramaDados {
    id: number;
    nome: string;
    direcao: string;
    colunas: string[];
    nos: OrganogramaNo[];
}

export default function ViewRelatoriosViewOrganogramaListScreen() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [dados, setDados] = useState<OrganogramaDados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [direcao, setDirecao] = useState<string>('VERTICAL');

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<OrganogramaDados>(`/api/relatorios/organograma/${id}/dados`);
                if (!ativo) return;
                setDados(resp.data);
                if (resp.data.direcao) {
                    setDirecao(resp.data.direcao);
                }
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                if (ativo) setError('Erro ao carregar os dados do organograma. Verifique o SQL cadastrado.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, [id]);

    const treeData = useMemo(() => {
        if (!dados || !dados.nos || !dados.nos.length) return [];
        const map = new Map<string, any>();
        dados.nos.forEach(n => {
            const nodeId = String(n.id);
            const label = n.name ? `${n.name}${n.job ? `\n(${n.job})` : ''}` : nodeId;
            map.set(nodeId, {
                name: label,
                itemStyle: {
                    color: n.cor || '#1B65BF'
                },
                children: []
            });
        });

        const roots: any[] = [];
        dados.nos.forEach(n => {
            const nodeId = String(n.id);
            const node = map.get(nodeId);
            const parentId = n.parentId !== null && n.parentId !== undefined && String(n.parentId) !== '' ? String(n.parentId) : null;
            if (parentId !== null && map.has(parentId)) {
                map.get(parentId).children.push(node);
            } else {
                roots.push(node);
            }
        });

        if (roots.length > 1) {
            return [{
                name: dados.nome || 'Organograma',
                children: roots
            }];
        }
        return roots;
    }, [dados]);

    const option = useMemo(() => {
        let orient = 'TB';
        const dir = (direcao || '').toUpperCase();
        if (dir === 'HORIZONTAL') {
            orient = 'LR';
        } else if (dir === 'TOGGLE_REVERSE') {
            orient = 'BT';
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
                    symbolSize: 14,
                    orient: orient,
                    label: {
                        position: 'left',
                        verticalAlign: 'middle',
                        align: 'right',
                        fontSize: 12,
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
                <h1>Organograma{dados ? `: ${dados.nome}` : ''}</h1>
                {!id && <p>Selecione um organograma na listagem para visualizar.</p>}
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}

                {dados && (
                    <div style={{padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', alignItems: 'center'}}>
                            <div>
                                <label style={{marginRight: '8px', fontWeight: 'bold', fontSize: '13px'}}>Direção:</label>
                                <select
                                    value={direcao}
                                    onChange={e => setDirecao(e.target.value)}
                                    style={{padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '13px'}}
                                >
                                    <option value="VERTICAL">Vertical (Top-Bottom)</option>
                                    <option value="HORIZONTAL">Horizontal (Left-Right)</option>
                                    <option value="TOGGLE_REVERSE">Invertido (Bottom-Top)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{width: '100%', height: '650px'}}>
                            <ReactECharts option={option} style={{height: '100%', width: '100%'}} />
                        </div>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
