import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {AgCharts} from 'ag-charts-react';
import type {AgChartOptions} from 'ag-charts-enterprise';
import 'ag-charts-enterprise';
import {PermissionGate} from '../permissions';
import {api} from '../api';

// -----------------------------------------------------------------------------------------
// Tela de visualização do Organograma (AG Charts Org Chart)
// https://www.ag-grid.com/charts/react/org-chart/
//
// Os dados (nós já com a cor por departamento) vêm prontos da API em tempo real:
//   GET /api/relatorios/organograma/{id}/dados
// Nada aqui é salvo no banco: direção, espaçamento e recolher/expandir são só de tela.
// -----------------------------------------------------------------------------------------

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

const DIRECAO_OPTIONS = [
    {value: 'HORIZONTAL', label: 'Horizontal'},
    {value: 'VERTICAL', label: 'Vertical'},
    {value: 'TOGGLE_REVERSE', label: 'Toggle Reverse'},
];

function direcaoParaSerie(direcao: string): {direction: 'horizontal' | 'vertical'; reverse: boolean} {
    switch (direcao) {
        case 'HORIZONTAL':
            return {direction: 'horizontal', reverse: false};
        case 'TOGGLE_REVERSE':
            return {direction: 'vertical', reverse: true};
        default:
            return {direction: 'vertical', reverse: false};
    }
}

export default function ViewRelatoriosViewOrganogramaListScreen() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [dados, setDados] = useState<OrganogramaDados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const [direcao, setDirecao] = useState('VERTICAL');
    const [innerSpacing, setInnerSpacing] = useState(20);
    const [outerSpacing, setOuterSpacing] = useState(40);
    const [depthSpacing, setDepthSpacing] = useState(52);
    const [collapsedIds, setCollapsedIds] = useState<string[]>([]);
    const [chartVersion, setChartVersion] = useState(0);
    const [noSelecionado, setNoSelecionado] = useState('');

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
                setDirecao(resp.data.direcao || 'VERTICAL');
                setCollapsedIds([]);
                setChartVersion((v) => v + 1);
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                if (ativo) setError('Erro ao carregar os dados do organograma. Verifique o SQL cadastrado.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [id]);

    // Ids que possuem ao menos um filho (só eles têm "expander" no gráfico).
    const idsComFilhos = useMemo(() => {
        if (!dados) return [] as string[];
        const pais = new Set<string>();
        dados.nos.forEach((no) => {
            if (no.parentId !== null && no.parentId !== undefined && String(no.parentId) !== '') {
                pais.add(String(no.parentId));
            }
        });
        return Array.from(pais);
    }, [dados]);

    const expandirTodos = () => {
        setCollapsedIds([]);
        setChartVersion((v) => v + 1);
    };

    const recolherTodos = () => {
        setCollapsedIds(idsComFilhos);
        setChartVersion((v) => v + 1);
    };

    const alternarNoSelecionado = () => {
        if (!noSelecionado) return;
        setCollapsedIds((prev) =>
            prev.includes(noSelecionado) ? prev.filter((x) => x !== noSelecionado) : [...prev, noSelecionado]
        );
        setChartVersion((v) => v + 1);
    };

    const options = useMemo<AgChartOptions | null>(() => {
        if (!dados) return null;
        const {direction, reverse} = direcaoParaSerie(direcao);
        return {
            data: dados.nos,
            initialState: {collapsed: collapsedIds as unknown as never[]},
            series: [
                {
                    type: 'organization',
                    idKey: 'id',
                    parentIdKey: 'parentId',
                    direction,
                    reverse,
                    innerSpacing,
                    outerSpacing,
                    depthSpacing,
                    node: {
                        width: 200,
                        cornerRadius: 12,
                        image: {key: 'avatar', position: 'left', width: 44, height: 44, cornerRadius: 22},
                        title: {key: 'name', textAlign: 'left', fontSize: 15, fontWeight: 'bold'},
                        subtitle: {key: 'job', textAlign: 'left', fontStyle: 'italic'},
                        labels: [
                            {key: 'department', textAlign: 'left'},
                            {key: 'location', textAlign: 'left'},
                            {
                                key: 'status',
                                textAlign: 'right',
                                itemStyler: ({datum}: any) => {
                                    const remoto = datum.status === 'Remote' || datum.status === 'Remoto';
                                    return {
                                        fill: remoto ? '#fff3e0' : '#e8f5e9',
                                        stroke: remoto ? '#ff9800' : '#4caf50',
                                        color: remoto ? '#e65100' : '#2e7d32',
                                        cornerRadius: 8,
                                        padding: 4,
                                        fontWeight: 'bold',
                                    };
                                },
                            },
                        ],
                        // Cor por departamento: já vem calculada pela API (campo "cor" da paleta de 40 cores).
                        itemStyler: ({datum}: any) => ({
                            fill: datum.cor,
                            fillOpacity: 0.2,
                            stroke: datum.cor,
                            strokeWidth: 2,
                        }),
                    },
                    link: {
                        itemStyler: ({fromDatum}: any) => ({stroke: fromDatum?.cor}),
                    },
                    expander: {text: {showAllChildren: true, showDirectChildren: true}},
                } as any,
            ],
        };
    }, [dados, direcao, innerSpacing, outerSpacing, depthSpacing, collapsedIds]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Organograma{dados ? `: ${dados.nome}` : ''}</h1>
                {!id && <p>Selecione um organograma na listagem para visualizar.</p>}
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}

                {dados && (
                    <>
                        <div className="organograma-toolbar" style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', margin: '12px 0 20px'}}>
                            <label>
                                Direção
                                <select value={direcao} onChange={(e) => setDirecao(e.target.value)} style={{display: 'block'}}>
                                    {DIRECAO_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Espaçamento entre irmãos ({innerSpacing}px)
                                <input type="range" min={0} max={80} value={innerSpacing}
                                       onChange={(e) => setInnerSpacing(Number(e.target.value))} style={{display: 'block'}}/>
                            </label>
                            <label>
                                Espaçamento entre primos ({outerSpacing}px)
                                <input type="range" min={0} max={120} value={outerSpacing}
                                       onChange={(e) => setOuterSpacing(Number(e.target.value))} style={{display: 'block'}}/>
                            </label>
                            <label>
                                Espaçamento entre níveis ({depthSpacing}px)
                                <input type="range" min={20} max={140} value={depthSpacing}
                                       onChange={(e) => setDepthSpacing(Number(e.target.value))} style={{display: 'block'}}/>
                            </label>
                            <button type="button" className="btnblue" onClick={expandirTodos}>Expand All</button>
                            <button type="button" className="btnblue" onClick={recolherTodos}>Collapse All</button>
                            <label>
                                Nó
                                <select value={noSelecionado} onChange={(e) => setNoSelecionado(e.target.value)} style={{display: 'block'}}>
                                    <option value="">Selecione...</option>
                                    {dados.nos.filter((no) => idsComFilhos.includes(String(no.id))).map((no) => (
                                        <option key={String(no.id)} value={String(no.id)}>{String(no.name ?? no.id)}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" className="btnblack" onClick={alternarNoSelecionado} disabled={!noSelecionado}>
                                Toggle CTO
                            </button>
                        </div>

                        {options && (
                            <div style={{height: '640px', width: '100%'}}>
                                <AgCharts key={chartVersion} options={options} style={{height: '100%', width: '100%'}}/>
                            </div>
                        )}

                        {dados.nos.length === 0 && (
                            <p>O SQL cadastrado não retornou nenhum registro.</p>
                        )}
                    </>
                )}
            </main>
        </PermissionGate>
    );
}
