import {useMemo} from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    BarChart,
    LineChart,
    PieChart,
    Bar,
    Line,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';
import type {LinhaGrafico} from '../../features/relatorios/relatorios';

type GraficoChartProps = {
    tipo: string;
    linhas: LinhaGrafico[];
    linhasCombinado?: LinhaGrafico[];
    exibirLegenda?: boolean;
    exibirValor?: boolean;
    exibirPercentual?: boolean;
    valorAcumulado?: boolean;
    posicao?: string;
};

const PALETA = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ac',
];

function limpar(valor: unknown): number {
    if (valor === null || valor === undefined) return 0;
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
}

function normalizarLinhas(linhas: LinhaGrafico[]): { categoria: string; valor: number; valorCombinado?: number }[] {
    return (linhas || []).map((linha) => ({
        categoria: String(linha.categoria ?? 'Não informado'),
        valor: limpar(linha.valor),
    }));
}

export default function GraficoChart({tipo, linhas, linhasCombinado, exibirLegenda, exibirValor, exibirPercentual, valorAcumulado, posicao}: GraficoChartProps) {
    const dados = useMemo(() => normalizarLinhas(linhas), [linhas]);
    const dadosCombinado = useMemo(() => normalizarLinhas(linhasCombinado || []), [linhasCombinado]);

    // Mesclar dados combinados se existirem
    const dadosMesclados = useMemo(() => {
        if (!dadosCombinado.length) return dados;
        const mapa = new Map<string, any>();
        dados.forEach(d => mapa.set(d.categoria, { ...d }));
        dadosCombinado.forEach(d => {
            if (mapa.has(d.categoria)) {
                mapa.get(d.categoria).valorCombinado = d.valor;
            } else {
                mapa.set(d.categoria, { categoria: d.categoria, valor: 0, valorCombinado: d.valor });
            }
        });
        return Array.from(mapa.values());
    }, [dados, dadosCombinado]);

    const tipoUpper = tipo.toUpperCase();
    const mostrarLegenda = exibirLegenda !== false;
    const vertical = tipoUpper === 'BARRA_VERTICAL' || tipoUpper === 'GRAFICO';
    const horizontal = tipoUpper === 'BARRA_HORIZONTAL';
    const pizza = tipoUpper === 'PIZZA' || tipoUpper === 'CIRCULAR';
    const circular = tipoUpper === 'CIRCULAR';
    const linha = tipoUpper === 'LINHA';
    const combinado = tipoUpper === 'COMBINADO';

    if (dados.length === 0 && dadosCombinado.length === 0) {
        return <p>Nenhum dado disponível para exibição no gráfico.</p>;
    }

    return (
        <div style={{height: 460, width: '100%'}}>
            <ResponsiveContainer width="100%" height="100%">
                {pizza ? (
                    <PieChart>
                        <Tooltip />
                        {mostrarLegenda && <Legend />}
                        <Pie
                            data={dados}
                            dataKey="valor"
                            nameKey="categoria"
                            cx="50%"
                            cy="50%"
                            outerRadius={140}
                            {...(circular ? {innerRadius: 80} : {})}
                            label={exibirPercentual ? ({percent}) => `${Math.round((percent || 0) * 100)}%` : true}
                        >
                            {dados.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PALETA[index % PALETA.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                ) : linha ? (
                    <LineChart data={dados} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip />
                        {mostrarLegenda && <Legend />}
                        <Line type="monotone" dataKey="valor" name="Valor" stroke={PALETA[0]} strokeWidth={2} dot={{r: 4}} />
                    </LineChart>
                ) : combinado ? (
                    <ComposedChart data={dadosMesclados.length ? dadosMesclados : dados} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip />
                        {mostrarLegenda && <Legend />}
                        <Bar dataKey="valor" name="Principal" fill={PALETA[0]} />
                        <Line type="monotone" dataKey="valorCombinado" name="Combinado" stroke={PALETA[1]} strokeWidth={2} />
                    </ComposedChart>
                ) : horizontal ? (
                    <BarChart layout="vertical" data={dados} margin={{top: 20, right: 30, left: 40, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="categoria" type="category" width={100} />
                        <Tooltip />
                        {mostrarLegenda && <Legend />}
                        <Bar dataKey="valor" name="Valor" fill={PALETA[0]}>
                            {dados.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PALETA[index % PALETA.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                ) : (
                    <BarChart data={dados} margin={{top: 20, right: 30, left: 20, bottom: 5}}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="categoria" />
                        <YAxis />
                        <Tooltip />
                        {mostrarLegenda && <Legend />}
                        <Bar dataKey="valor" name="Valor" fill={PALETA[0]}>
                            {dados.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PALETA[index % PALETA.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
}
