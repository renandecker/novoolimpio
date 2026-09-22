import React, {useMemo, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle, G, Line, Path, Polyline, Rect, Text as SvgText} from 'react-native-svg';
import type {LinhaGrafico} from './relatorios';
import {Colors, Typography, Spacing} from '../../shared/styles/theme';

type GraficoChartProps = {
    tipo: string;
    linhas: LinhaGrafico[];
    linhasCombinado?: LinhaGrafico[];
    exibirLegenda?: boolean;
    exibirValor?: boolean;
    exibirPercentual?: boolean;
    valorAcumulado?: boolean;
    posicao?: string;
    height?: number;
};

type Dado = {
    categoria: string;
    valor: number;
    valorCombinado?: number;
};

const PALETA = [
    '#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f',
    '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ac',
];

const AXIS = '#d0d0d0';
const GRID = '#e7e7e7';
const LABEL = '#6b7280';

function limpar(valor: unknown): number {
    if (valor === null || valor === undefined) return 0;
    const n = Number(valor);
    return Number.isFinite(n) ? n : 0;
}

function normalizar(linhas: LinhaGrafico[]): Dado[] {
    return (linhas || []).map((linha) => ({
        categoria: String(linha.categoria ?? 'Não informado'),
        valor: limpar(linha.valor),
    }));
}

function acumular(dados: Dado[]): Dado[] {
    let soma = 0;
    return dados.map((d) => {
        soma += d.valor;
        return {...d, valor: soma};
    });
}

function mesclar(dados: Dado[], combinado: Dado[]): Dado[] {
    if (!combinado.length) return dados;
    const mapa = new Map<string, Dado>();
    dados.forEach((d) => mapa.set(d.categoria, {...d}));
    combinado.forEach((d) => {
        const existente = mapa.get(d.categoria);
        if (existente) {
            existente.valorCombinado = d.valor;
        } else {
            mapa.set(d.categoria, {categoria: d.categoria, valor: 0, valorCombinado: d.valor});
        }
    });
    return Array.from(mapa.values());
}

function niceMax(valor: number): number {
    if (valor <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(valor)));
    const n = valor / pow;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * pow;
}

function tickValues(maxVal: number, count: number): number[] {
    const step = maxVal / count;
    const arr: number[] = [];
    for (let i = 0; i <= count; i++) arr.push(i * step);
    return arr;
}

function valorCurto(v: number): string {
    if (Math.abs(v) >= 1000000) return `${(v / 1000000).toLocaleString('pt-BR', {maximumFractionDigits: 1})}M`;
    if (Math.abs(v) >= 1000) return `${(v / 1000).toLocaleString('pt-BR', {maximumFractionDigits: 1})}k`;
    return v.toLocaleString('pt-BR', {maximumFractionDigits: 0});
}

function valorCompleto(v: number): string {
    return v.toLocaleString('pt-BR', {maximumFractionDigits: 0, minimumFractionDigits: 0});
}

function elipse(texto: string, maxChars: number): string {
    return texto.length > maxChars ? `${texto.slice(0, maxChars - 1)}…` : texto;
}

function polarToCartesian(cx: number, cy: number, r: number, angulo: number): { x: number; y: number } {
    const rad = (angulo - 90) * Math.PI / 180;
    return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function describeArc(cx: number, cy: number, r: number, inicio: number, fim: number): string {
    const start = polarToCartesian(cx, cy, r, fim);
    const end = polarToCartesian(cx, cy, r, inicio);
    const large = fim - inicio <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

function describePieSlice(cx: number, cy: number, r: number, inicio: number, fim: number): string {
    const a0 = polarToCartesian(cx, cy, r, inicio);
    const a1 = polarToCartesian(cx, cy, r, fim);
    const large = fim - inicio <= 180 ? '0' : '1';
    return `M ${cx} ${cy} L ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${a1.x} ${a1.y} Z`;
}

function Legend({dados}: { dados: Dado[] }) {
    if (dados.length === 0) return null;
    return (
        <View style={styles.legend}>
            {dados.map((d, i) => (
                <View key={`${d.categoria}-${i}`} style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: PALETA[i % PALETA.length]}]}/>
                    <Text style={styles.legendText} >{d.categoria}</Text>
                </View>
            ))}
        </View>
    );
}

function GraficoCartesiano({tipo, dados, maxV, width, height, exibirValor}: {
    tipo: string;
    dados: Dado[];
    maxV: number;
    width: number;
    height: number;
    exibirValor: boolean;
}) {
    const horizontal = tipo.toUpperCase() === 'BARRA_HORIZONTAL';
    const vertical = !horizontal;
    const linha = tipo.toUpperCase() === 'LINHA';
    const combinado = tipo.toUpperCase() === 'COMBINADO';
    const n = dados.length;

    let padLeft = 44;
    let padRight = 10;
    let padTop = exibirValor ? 26 : 12;
    let padBottom = 26;
    if (horizontal) {
        padLeft = 104;
        padRight = 60;
        padTop = 12;
        padBottom = 26;
    }

    const plotW = Math.max(0, width - padLeft - padRight);
    const plotH = Math.max(0, height - padTop - padBottom);
    const ticks = tickValues(maxV, 5);
    const y = (v: number) => padTop + plotH - (maxV > 0 ? (v / maxV) * plotH : 0);

    const band = n > 0 ? plotW / n : 0;
    const xCenter = (i: number) => padLeft + band * i + band / 2;
    const rowH = n > 0 ? plotH / n : 0;
    const yCenter = (i: number) => padTop + rowH * i + rowH / 2;

    const pontosLinha = dados.map((d, i) => `${xCenter(i)} ${y(linha ? d.valor : (d.valorCombinado ?? 0))}`);
    let maxCaracteresX = 8;
    if (n > 10) maxCaracteresX = 5;
    if (n > 14) maxCaracteresX = 4;
    const mostrarRotuloX = (i: number) => n <= 16 || i % Math.ceil(n / 16) === 0;

    const lins: React.ReactNode[] = [];
    const rotulos = horizontal ? dados.map((d, i) => (
        <SvgText
            key={`c-${i}`}
            x={padLeft - 6}
            y={yCenter(i) + 3}
            fontSize={9}
            fill={LABEL}
            textAnchor="end"
            >
            {elipse(d.categoria, 14)}
        </SvgText>
    )) : dados.map((d, i) =>
        mostrarRotuloX(i) ? (
            <SvgText
                key={`c-${i}`}
                x={xCenter(i)}
                y={height - 6}
                fontSize={9}
                fill={LABEL}
                textAnchor="middle"
                >
                {elipse(d.categoria, maxCaracteresX)}
            </SvgText>
        ) : null
    );

    ticks.forEach((t) => {
        const yy = y(t);
        lins.push(
            <Line key={`g-${t}`} x1={padLeft} y1={yy} x2={width - padRight} y2={yy} stroke={GRID} strokeWidth={1}/>
        );
        lins.push(
            <SvgText key={`l-${t}`} x={padLeft - 6} y={yy + 3} fontSize={9} fill={LABEL} textAnchor="end">
                {valorCurto(t)}
            </SvgText>
        );
    });

    const barras = !linha ? dados.map((d, i) => {
        const cor = PALETA[i % PALETA.length];
        if (!vertical) {
            const bw = Math.max(1, (d.valor / maxV) * plotW);
            const bh = Math.max(1, rowH * 0.55);
            return (
                <G key={`b-${i}`}>
                    <Rect
                        x={padLeft}
                        y={yCenter(i) - bh / 2}
                        width={bw}
                        height={bh}
                        fill={cor}
                        rx={1}
                    />
                    {exibirValor && (
                        <SvgText x={padLeft + bw + 3} y={yCenter(i) + 3} fontSize={9} fill={LABEL}>
                            {valorCurto(d.valor)}
                        </SvgText>
                    )}
                </G>
            );
        }
        const bh = Math.max(1, (d.valor / maxV) * plotH);
        const bw = Math.max(1, band * 0.5);
        return (
            <G key={`b-${i}`}>
                <Rect
                    x={xCenter(i) - bw / 2}
                    y={y(d.valor)}
                    width={bw}
                    height={bh}
                    fill={cor}
                    rx={1}
                />
                {exibirValor && (
                    <SvgText x={xCenter(i)} y={y(d.valor) - 4} fontSize={9} fill={LABEL} textAnchor="middle">
                        {valorCurto(d.valor)}
                    </SvgText>
                )}
            </G>
        );
    }) : null;

    const linhasSvg = dados.map((d, i) => (
        <Circle
            key={`p-${i}`}
            cx={xCenter(i)}
            cy={y(linha ? d.valor : (d.valorCombinado ?? 0))}
            r={3}
            fill={linha ? PALETA[0] : PALETA[1]}
            stroke="#ffffff"
            strokeWidth={1}
        />
    ));

    const polylines = (linha || combinado) && dados.length > 1 ? (
        <Polyline
            points={pontosLinha.join(' ')}
            fill="none"
            stroke={linha ? PALETA[0] : PALETA[1]}
            strokeWidth={2}
        />
    ) : null;

    return (
        <Svg width={width} height={height}>
            <G>
                {lins}
                {barras}
                {polylines}
                {linhasSvg}
                {vertical && <Line x1={padLeft} y1={padTop + plotH} x2={width - padRight} y2={padTop + plotH} stroke={AXIS} strokeWidth={1}/>}
                {horizontal && <Line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke={AXIS} strokeWidth={1}/>}
                {rotulos}
            </G>
        </Svg>
    );
}

function GraficoCircular({dados, circular, width, height, exibirValor, exibirPercentual}: {
    dados: Dado[];
    circular: boolean;
    width: number;
    height: number;
    exibirValor: boolean;
    exibirPercentual: boolean;
}) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - (circular ? 30 : 12);
    const total = dados.reduce((soma, d) => soma + Math.max(0, d.valor), 0);
    if (total <= 0) return <Text style={styles.vazio}>Nenhum dado disponível para exibição no gráfico.</Text>;

    let inicio = 0; // ângulo em graus (0 = topo, sentido horário)
    const fator = 360 / total;

    const fatias = dados.map((d, i) => {
        const fracao = Math.max(0, d.valor);
        const fim = inicio + fracao * fator;
        const cor = PALETA[i % PALETA.length];
        const porc = total > 0 ? fracao / total : 0;
        const labelR = circular ? radius : radius * 0.62;
        const meio = (inicio + fim) / 2;
        const ponto = polarToCartesian(cx, cy, labelR, meio);

        let texto: string | null = null;
        if (exibirPercentual) {
            texto = `${Math.round(porc * 100)}%`;
        } else if (exibirValor) {
            texto = valorCurto(fracao);
        } else if (porc >= 0.08) {
            texto = elipse(d.categoria, 10);
        }

        let elemento: React.ReactNode;
        if (circular) {
            const largura = Math.max(26, Math.min(40, radius * 0.42));
            elemento = (
                <Path
                    d={describeArc(cx, cy, radius, inicio, fim)}
                    stroke={cor}
                    strokeWidth={largura}
                    fill="none"
                />
            );
        } else {
            elemento = (
                <Path
                    d={describePieSlice(cx, cy, radius, inicio, fim)}
                    fill={cor}
                    stroke="#ffffff"
                    strokeWidth={1}
                />
            );
        }

        inicio = fim;
        return (
            <G key={`f-${i}`}>
                {elemento}
                {texto && (circular || porc >= 0.05) && (
                    <SvgText
                        x={ponto.x}
                        y={ponto.y + 3}
                        fontSize={10}
                        fontWeight="600"
                        fill={circular || porc >= 0.18 ? '#ffffff' : '#1f2937'}
                        textAnchor="middle"
                        >
                        {texto}
                    </SvgText>
                )}
            </G>
        );
    });

    return (
        <View style={{alignItems: 'center'}}>
            <Svg width={width} height={height}>
                <G>{fatias}</G>
{circular && total > 0 && (
                    <>
                        <SvgText x={cx} y={cy + 2} fontSize={18} fontWeight="700" fill="#1f2937" textAnchor="middle">
                            {valorCurto(total)}
                        </SvgText>
                        <SvgText x={cx} y={cy + 18} fontSize={10} fill={LABEL} textAnchor="middle">
                            Total
                        </SvgText>
                    </>
                )}
            </Svg>
        </View>
    );
}

export default function GraficoChart({
                                         tipo,
                                         linhas,
                                         linhasCombinado,
                                         exibirLegenda,
                                         exibirValor,
                                         exibirPercentual,
                                         valorAcumulado,
                                         height = 260,
                                     }: GraficoChartProps) {
    const [width, setWidth] = useState(0);

    const base = useMemo(() => normalizar(linhas), [linhas]);
    const combinado = useMemo(() => {
        const c = normalizar(linhasCombinado || []);
        return valorAcumulado ? acumular(c) : c;
    }, [linhasCombinado, valorAcumulado]);
    const dados = useMemo(() => {
        const lista = valorAcumulado ? acumular(base) : base;
        return mesclar(lista, combinado);
    }, [base, combinado, valorAcumulado]);

    const maxV = useMemo(() => {
        const valores = dados.flatMap((d) => [d.valor, d.valorCombinado ?? 0]);
        return niceMax(Math.max(0, ...valores));
    }, [dados]);

    const tipoUpper = (tipo || '').toUpperCase();
    const pizza = tipoUpper === 'PIZZA';
    const circular = tipoUpper === 'CIRCULAR';
    const mostrarLegenda = exibirLegenda !== false;

    const temDados = dados.length > 0;
    const ehCircular = pizza || circular;

    let conteudo: React.ReactNode = null;
    if (!temDados) {
        conteudo = <Text style={styles.vazio}>Nenhum dado disponível para exibição no gráfico.</Text>;
    } else if (ehCircular) {
        conteudo = <GraficoCircular
            dados={dados}
            circular={circular}
            width={Math.max(200, width)}
            height={Math.max(200, height)}
            exibirValor={exibirValor === true}
            exibirPercentual={exibirPercentual === true}
        />;
    } else {
        conteudo = <GraficoCartesiano
            tipo={tipoUpper}
            dados={dados}
            maxV={maxV}
            width={Math.max(200, width)}
            height={height}
            exibirValor={exibirValor === true}
        />;
    }

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                const largura = event.nativeEvent.layout.width;
                if (largura > 0 && largura !== width) setWidth(largura);
            }}
        >
            {width > 0 && conteudo}
            {temDados && mostrarLegenda && <Legend dados={dados}/>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: Colors.bgSecondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.borderLight,
        paddingTop: Spacing.lg,
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    vazio: {
        color: Colors.textLight,
        fontSize: Typography.sizes.base,
        textAlign: 'center',
        paddingVertical: Spacing.xl,
    },
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        backgroundColor: '#f8f8f8',
        borderRadius: 999,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: Spacing.xs,
    },
    legendText: {
        fontSize: Typography.sizes.sm,
        color: Colors.textSecondary,
        flexShrink: 1,
    },
});