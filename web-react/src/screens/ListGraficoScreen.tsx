import React, {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from './api';
import {Button, Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {FiltrosController} from './filtrosController';

type GraficoInfo = {
    id: number;
    nome: string;
    tipo: 'PIZZA' | 'LINHA' | 'COMBINADO' | 'BARRA_VERTICAL' | 'BARRA_HORIZONTAL' | 'CIRCULAR';
    altura: number;
};

type FiltroRelatorio = {
    filtroRelatorio: { tipo: string; fixo: boolean; exibirFiltro: boolean; informacao: string | null };
    selected: boolean;
    informacao: string | null;
};

export function ListGraficoScreen() {
    const navigate = useNavigate();
    const [graficos, setGraficos] = useState<GraficoInfo[]>([]);
    const [filtros, setFiltros] = useState<FiltroRelatorio[]>([]);
    const [filtroSelecionado, setFiltroSelecionado] = useState<any>(null);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [chartType, setChartType] = useState<'pie' | 'line' | 'bar' | 'donut'>('pie');
    const [model, setModel] = useState<any>(null);

    useEffect(() => {
        fetchGraficos();
    }, []);

    const fetchGraficos = async () => {
        try {
            const response = await api.get('/api/relatorios/grafico');
            setGraficos(response.data);
        } catch (error) {
            console.error('Erro ao carregar gráficos:', error);
        }
    };

    const aplicarFiltro = async () => {
        if (!filtroSelecionado) return;
        setShowFilterDialog(false);
    };

    const getChartModel = (tipo: string) => {
        switch (tipo) {
            case 'PIZZA':
                return {type: 'pie', model};
            case 'LINHA':
                return {type: 'line', model};
            case 'COMBINADO':
                return {type: 'bar', model};
            case 'BARRA_VERTICAL':
                return {type: 'bar', model};
            case 'BARRA_HORIZONTAL':
                return {type: 'bar', model};
            case 'CIRCULAR':
                return {type: 'donut', model};
            default:
                return {type: 'pie', model};
        }
    };

    return (
        <div>
            <h1>Relatórios - Gráfico</h1>

            {/* Toolbar with filters and chart type selector */}
            <div className="toolbar">
                <Button variant="primary" onClick={() => setShowFilterDialog(true)}>Filtros</Button>
                <Button variant="secondary">Exportar PDF</Button>
            </div>

            {/* Chart type selector */}
            <div className="chart-selector">
                <button onClick={() => setChartType('pie')}>Pizza</button>
                <button onClick={() => setChartType('line')}>Linha</button>
                <button onClick={() => setChartType('bar')}>Barra</button>
                <button onClick={() => setChartType('donut')}>Circular</button>
            </div>

            {/* Filters panel */}
            {showFilterDialog && (
                <div className="filter-dialog">
                    <h4>Filtros do Gráfico</h4>
                    <Button onClick={aplicarFiltro}>Aplicar Filtro</Button>
                </div>
            )}

            {/* Chart display */}
            {graficos.length > 0 && (
                <div className="chart-container">
                    {graficos.map((g) => (
                        <div key={g.id} className="chart-item">
                            <h4>{g.nome}</h4>
                            <div
                                style={{
                                    width: '100%',
                                    height: `${g.altura}px`,
                                    marginTop: '10px',
                                }}
                            >
                                {/* Chart would be rendered here based on type */}
                                <p>Tipo: {g.tipo}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {graficos.length === 0 && <Alert variant="info">Nenhum gráfico disponível</Alert>}
        </div>
    );
}