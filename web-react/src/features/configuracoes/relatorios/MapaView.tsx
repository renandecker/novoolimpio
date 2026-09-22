import {useEffect, useRef, useState} from 'react';
import * as maplibregl from 'maplibre-gl';
import {Map, Marker, Popup} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../../MapaView.css';

type MapaPontosResponse = {
    coordenadaCentro: string;
    zoom: string;
    altura: number;
    markerTamanho: number;
    regras: RegraPontos[];
};

type RegraPontos = {
    regraId: number;
    descricao: string;
    cor: string;
    markerTamanho: number;
    marcadores: Marcador[];
};

type Marcador = {
    latitude: string;
    longitude: string;
    popup: string;
    valorFormatado: string;
};

type MapaViewProps = {
    data: MapaPontosResponse;
};

export default function MapaView({data}: MapaViewProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map | null>(null);
    const markersRef = useRef<Marker[]>([]);
    const [center, setCenter] = useState<[number, number]>([0, 0]);
    const [zoom, setZoom] = useState(13);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (data.coordenadaCentro) {
            const [lat, lng] = data.coordenadaCentro.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setCenter([lng, lat]);
            }
        }
        if (data.zoom) {
            const z = parseInt(data.zoom, 10);
            if (!isNaN(z)) setZoom(z);
        }
    }, [data]);

    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = new Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    'osm': {
                        type: 'raster',
                        tiles: ['https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        attribution: '&copy; OpenStreetMap contributors'
                    }
                },
                layers: [{
                    id: 'osm-layer',
                    type: 'raster',
                    source: 'osm',
                    minzoom: 0,
                    maxzoom: 19
                }]
            },
            center: center,
            zoom: zoom,
            attributionControl: false
        });

        map.addControl(new maplibregl.AttributionControl({compact: true}), 'bottom-right');
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.on('load', () => {
            setMapLoaded(true);
            updateMarkers(map);
        });

        mapRef.current = map;

        return () => {
            markersRef.current.forEach(m => m.remove());
            markersRef.current = [];
            map.remove();
            mapRef.current = null;
            setMapLoaded(false);
        };
    }, []);

    const updateMarkers = (map: Map) => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        if (!data.regras || data.regras.length === 0) return;

        data.regras.forEach((regra) => {
            if (!regra.marcadores || regra.marcadores.length === 0) return;

            regra.marcadores.forEach((marcador) => {
                const lat = parseFloat(marcador.latitude);
                const lng = parseFloat(marcador.longitude);

                if (isNaN(lat) || isNaN(lng)) return;

                const el = document.createElement('div');
                el.className = 'maplibre-marker';
                el.style.width = `${regra.markerTamanho}px`;
                el.style.height = `${regra.markerTamanho}px`;
                el.style.backgroundColor = regra.cor;
                el.style.borderRadius = '50%';
                el.style.border = '2px solid white';
                el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                el.style.cursor = 'pointer';
                el.style.transition = 'transform 0.2s';
                el.title = regra.descricao;

                el.onmouseenter = () => el.style.transform = 'scale(1.3)';
                el.onmouseleave = () => el.style.transform = 'scale(1)';

                const popup = new Popup({closeButton: false, closeOnClick: false, offset: [0, -15]})
                    .setHTML(marcador.popup);

                const marker = new Marker({element: el, anchor: 'center'})
                    .setLngLat([lng, lat])
                    .setPopup(popup)
                    .addTo(map);

                markersRef.current.push(marker);
            });
        });
    };

    useEffect(() => {
        if (mapRef.current && mapLoaded) {
            updateMarkers(mapRef.current);
        }
    }, [data, mapLoaded]);

    const altura = data.altura || 600;

    if (!data.regras || data.regras.length === 0) {
        return (
            <div className="mapa-view-container" style={{height: `${altura}px`}}>
                <div className="mapa-empty">
                    <p>Nenhum marcador encontrado para este mapa.</p>
                    <p className="mapa-empty-hint">Verifique se as regras de mapa est&aacute;o configuradas corretamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mapa-view-container" style={{height: `${altura}px`}}>
            <div ref={mapContainerRef} className="mapa-maplibre" style={{width: '100%', height: '100%'}} />
            <MapaLegend regras={data.regras} />
        </div>
    );
}

function MapaLegend({regras}: { regras: RegraPontos[] }) {
    return (
        <div className="mapa-legend">
            {regras.map((regra) => (
                <div key={regra.regraId} className="mapa-legend-item">
                    <div
                        className="mapa-legend-color"
                        style={{
                            backgroundColor: regra.cor,
                            width: `${regra.markerTamanho}px`,
                            height: `${regra.markerTamanho}px`,
                        }}
                    />
                    <span>{regra.descricao} ({regra.marcadores.length})</span>
                </div>
            ))}
        </div>
    );
}