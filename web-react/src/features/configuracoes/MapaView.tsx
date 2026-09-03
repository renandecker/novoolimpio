import {useEffect, useRef, useState} from 'react';
import {MapContainer, TileLayer, Marker, Popup} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import './MapaView.css';

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

const DefaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function MapaView({data}: MapaViewProps) {
    const mapRef = useRef<L.Map | null>(null);
    const [center, setCenter] = useState<[number, number]>([0, 0]);
    const [zoom, setZoom] = useState(13);

    useEffect(() => {
        if (data.coordenadaCentro) {
            const [lat, lng] = data.coordenadaCentro.split(',').map(Number);
            if (!isNaN(lat) && !isNaN(lng)) {
                setCenter([lat, lng]);
            }
        }
        if (data.zoom) {
            const z = parseInt(data.zoom, 10);
            if (!isNaN(z)) setZoom(z);
        }
    }, [data]);

    const createPulseIcon = (color: string, size: number) => {
        return L.divIcon({
            className: 'pulse-marker',
            html: `<div style="
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color};
                border: 2px solid white;
                box-shadow: 0 0 0 rgba(${hexToRgb(color)}, 0.6);
                animation: pulse 2s infinite;
            "></div>
            <style>
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(${hexToRgb(color)}, 0.6); }
                    70% { box-shadow: 0 0 0 10px rgba(${hexToRgb(color)}, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(${hexToRgb(color)}, 0); }
                }
            </style>`,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2],
        });
    };

    const hexToRgb = (hex: string) => {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        return `${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}`;
    };

    const altura = data.altura || 600;

    if (!data.regras || data.regras.length === 0) {
        return (
            <div className="mapa-view-container" style={{height: `${altura}px`}}>
                <div className="mapa-empty">
                    <p>Nenhum marcador encontrado para este mapa.</p>
                    <p className="mapa-empty-hint">Verifique se as regras de mapa estão configuradas corretamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mapa-view-container" style={{height: `${altura}px`}}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                ref={mapRef}
                className="mapa-leaflet"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {data.regras.map((regra) => (
                    <LayerGroup key={regra.regraId} regra={regra} createPulseIcon={createPulseIcon} />
                ))}
            </MapContainer>
            <MapaLegend regras={data.regras} />
        </div>
    );
}

function LayerGroup({regra, createPulseIcon}: { regra: RegraPontos; createPulseIcon: (color: string, size: number) => L.DivIcon }) {
    const {marcadores, cor, markerTamanho, descricao} = regra;

    return (
        <>
            {marcadores.map((marcador, index) => (
                <Marker
                    key={`${regra.regraId}-${index}`}
                    position={[parseFloat(marcador.latitude), parseFloat(marcador.longitude)]}
                    icon={createPulseIcon(cor, markerTamanho)}
                >
                    <Popup>{marcador.popup}</Popup>
                </Marker>
            ))}
        </>
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