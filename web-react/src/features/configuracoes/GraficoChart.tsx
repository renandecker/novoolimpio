import {useMemo} from 'react';
import {AgCharts} from 'ag-charts-react';
import type {AgChartOptions} from 'ag-charts-enterprise';
import 'ag-charts-enterprise';
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

function normalizarLinhas(linhas: LinhaGrafico[]): { categoria: string; valor: number }[] {
    return (linhas || []).map((linha) => ({
        categoria: String(linha.categoria ?? 'Não informado'),
        valor: limpar(linha.valor),
    }));
}

function categoriaValor(data: { categoria: string; valor: number }[]) {
    return {
        type: 'category' as const,
        xKey: 'categoria',
        yKey: 'valor',
        yName: 'Valor',
    };
}

export default function GraficoChart({tipo, linhas, linhasCombinado, exibirLegenda, exibirValor, exibirPercentual, valorAcumulado, posicao}: GraficoChartProps) {
    const dados = useMemo(() => normalizarLinhas(linhas), [linhas]);
    const dadosCombinado = useMemo(() => normalizarLinhas(linhasCombinado || []), [linhasCombinado]);

    const options = useMemo<AgChartOptions>(() => {
        const categoria = posicao && ['top', 'bottom', 'left', 'right'].includes(posicao.toLowerCase())
            ? posicao.toLowerCase() as 'top' | 'bottom' | 'left' | 'right'
            : 'right';

        switch (tipo.toUpperCase()) {
            case 'PIZZA':
            case 'CIRCULAR': {
                const doughnut = tipo.toUpperCase() === 'CIRCULAR';
                return {
                    data: dados,
                    series: [{
                        type: doughnut ? 'donut' : 'pie',
                        angleKey: 'valor',
                        calloutLabelKey: 'categoria',
                        ...(doughnut ? {innerRadiusRatio: 0.6} : {}),
                        ...(exibirPercentual ? {sectorLabelKey: 'valor', sectorLabel: {formatter: ({value}: any) => `${Math.round(value)}%`}} : {}),
                    }],
                    legend: {enabled: exibirLegenda !== false, position: categoria},
                };
            }
            case 'LINHA':
                return {
                    data: dados,
                    series: [{
                        type: 'line',
                        xKey: 'categoria',
                        yKey: 'valor',
                        yName: 'Valor',
                        marker: {enabled: true},
                    }],
                    legend: {enabled: exibirLegenda !== false, position: categoria},
                };
            case 'COMBINADO': {
                const series: any[] = [{
                    type: 'bar',
                    xKey: 'categoria',
                    yKey: 'valor',
                    yName: 'Principal',
                    grouped: true,
                }];
                if (dadosCombinado.length > 0) {
                    series.push({
                        type: 'line',
                        xKey: 'categoria',
                        yKey: 'valor',
                        yName: 'Combinado',
                    } as any);
                }
                return {
                    data: dados,
                    series,
                    legend: {enabled: exibirLegenda !== false, position: categoria},
                };
            }
            case 'BARRA_HORIZONTAL': {
                return {
                    data: dados,
                    series: [{
                        type: 'bar',
                        direction: 'horizontal',
                        ...categoriaValor(dados),
                    }],
                    legend: {enabled: exibirLegenda !== false, position: categoria},
                };
            }
            case 'GRAFICO':
            case 'BARRA_VERTICAL':
            default: {
                return {
                    data: dados,
                    series: [{
                        type: 'bar',
                        ...categoriaValor(dados),
                        grouped: true,
                    }],
                    legend: {enabled: exibirLegenda !== false, position: categoria},
                };
            }
        }
    }, [tipo, dados, dadosCombinado, exibirLegenda, exibirPercentual, posicao]);

    if (dados.length === 0 && dadosCombinado.length === 0) {
        return <p>Nenhum dado disponível para exibição no gráfico.</p>;
    }

    return (
        <div style={{height: 460, width: '100%'}}>
            <AgCharts options={options} style={{height: '100%', width: '100%'}}/>
        </div>
    );
}
