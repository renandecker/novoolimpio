import React, {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from './api';
import {Button, Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

type MapaInfo = {
    id: number;
    nome: string;
    coordenada: string;
    zoom: number;
    markerTamanho: number;
    altura: number;
};

type FiltroRelatorio = {
    filtroRelatorio: { tipo: string; fixo: boolean; exibirFiltro: boolean; informacao: string | null };
    selected: boolean;
    informacao: string | null;
};

export function ListMapaScreen() {
    const navigate = useNavigate();
    const [mapas, setMapas] = useState<MapaInfo[]>([]);
    const [filtros, setFiltros] = useState<FiltroRelatorio[]>([]);
    const [filtroSelecionado, setFiltroSelecionado] = useState<any>(null);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [coordenada, setCoordenada] = useState('');
    const [zoom, setZoom] = useState(10);
    const [markerTamanho, setMarkerTamanho] = useState(10);

    useEffect(() => {
        fetchMapas();
    }, []);

    const fetchMapas = async () => {
        try {
            const response = await api.get('/api/relatorios/mapa');
            setMapas(response.data);
        } catch (error) {
            console.error('Erro ao carregar mapas:', error);
        }
    };

    const aplicarFiltro = async () => {
        if (!filtroSelecionado) return;
        setShowFilterDialog(false);
    };

    return (
        <div>
            <h1>Relatórios - Mapa</h1>

            {/* Toolbar with filters */}
            <div className="toolbar">
                <Button variant="primary" onClick={() => setShowFilterDialog(true)}>Filtros</Button>
                <Button variant="secondary">Salvar Mapa</Button>
            </div>

            {/* Filters panel */}
            {showFilterDialog && (
                <div className="filter-dialog">
                    <h4>Filtros do Mapa</h4>
                    <div className="form-group">
                        <label>Coordenada:</label>
                        <input
                            type="text"
                            value={coordenada}
                            onChange={(e) => setCoordenada(e.target.value)}
                            placeholder="Latitude,Longitude"
                        />
                    </div>
                    <div className="form-group">
                        <label>Zoom:</label>
                        <input
                            type="number"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            min="1"
                            max="20"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tamanho Marker:</label>
                        <input
                            type="number"
                            value={markerTamanho}
                            onChange={(e) => setMarkerTamanho(Number(e.target.value))}
                            min="1"
                        />
                    </div>
                    <Button onClick={aplicarFiltro} primary>Aplicar</Button>
                    <Button onClick={() => setShowFilterDialog(false)}>Cancelar</Button>
                </div>
            )}

            {/* Map display */}
            {mapas.length > 0 && (
                <div className="map-container">
                    {mapas.map((m) => (
                        <div key={m.id} className="map-item">
                            <h4>{m.nome}</h4>
                            <p>Coordenada: {m.coordenada}</p>
                            <p>Zoom: {m.zoom}</p>
                            <p>Tamanho Marker: {m.markerTamanho}</p>
                        </div>
                    ))}
                </div>
            )}

            {mapas.length === 0 && <Alert variant="info">Nenhum mapa disponível</Alert>}
        </div>
    );
}