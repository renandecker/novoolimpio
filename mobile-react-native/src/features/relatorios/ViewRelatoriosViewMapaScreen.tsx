import React, {useRef, useState, useEffect} from 'react';
import {View, StyleSheet, ActivityIndicator, Text, SafeAreaView} from 'react-native';
import {WebView} from 'react-native-webview';
import {useRoute, useNavigation} from '@react-navigation/native';
import {api} from '../../shared/services/api';
import type {MapaPontosResponse} from './relatorios';

type RouteParams = {
    id: string;
};

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
        body { margin: 0; padding: 0; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #map { height: 100%; width: 100%; }
        .legend { 
            position: absolute; 
            bottom: 20px; 
            right: 20px; 
            z-index: 1000; 
            background: white; 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.15); 
            padding: 12px 16px; 
            max-width: 280px; 
            font-size: 12px; 
        }
        .legend-item { 
            display: flex; 
            align-items: center; 
            gap: 8px; 
            margin-bottom: 6px; 
        }
        .legend-item:last-child { margin-bottom: 0; }
        .legend-color { 
            flex-shrink: 0; 
            border-radius: 50%; 
            border: 2px solid white; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.2); 
        }
        .pulse-marker { 
            animation: pulse 2s infinite; 
        }
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(var(--marker-color), 0.6); }
            70% { box-shadow: 0 0 0 10px rgba(var(--marker-color), 0); }
            100% { box-shadow: 0 0 0 0 rgba(var(--marker-color), 0); }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <div id="legend" class="legend"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
        var map = L.map('map').setView([0, 0], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var markers = [];
        var legendContainer = document.getElementById('legend');

        function hexToRgb(hex) {
            var cleanHex = hex.replace('#', '');
            var bigint = parseInt(cleanHex, 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        }

        function createPulseIcon(color, size) {
            var rgb = hexToRgb(color).join(',');
            return L.divIcon({
                className: 'pulse-marker',
                html: '<div style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:' + color + ';border:2px solid white;box-shadow:0 0 0 rgba(' + rgb + ',0.6);"></div>',
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
            });
        }

        function renderMap(data) {
            if (!data || !data.regras || data.regras.length === 0) {
                document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;color:#666;"><p>Nenhum marcador encontrado</p><p style="font-size:12px;">Verifique as regras do mapa</p></div>';
                return;
            }

            var center = data.coordenadaCentro ? data.coordenadaCentro.split(',').map(Number) : [0, 0];
            var zoom = parseInt(data.zoom) || 13;
            
            map.setView(center, zoom);

            markers.forEach(function(m) { map.removeLayer(m); });
            markers = [];
            legendContainer.innerHTML = '';

            data.regras.forEach(function(regra) {
                if (!regra.marcadores || regra.marcadores.length === 0) return;

                var icon = createPulseIcon(regra.cor, regra.markerTamanho || 10);
                
                regra.marcadores.forEach(function(marcador) {
                    var lat = parseFloat(marcador.latitude);
                    var lng = parseFloat(marcador.longitude);
                    if (isNaN(lat) || isNaN(lng)) return;
                    
                    var marker = L.marker([lat, lng], {icon: icon})
                        .bindPopup(marcador.popup)
                        .addTo(map);
                    markers.push(marker);
                });

                var item = document.createElement('div');
                item.className = 'legend-item';
                item.innerHTML = '<div class="legend-color pulse-marker" style="background:' + regra.cor + ';width:' + (regra.markerTamanho || 10) + 'px;height:' + (regra.markerTamanho || 10) + 'px;--marker-color:' + hexToRgb(regra.cor).join(',') + ';"></div><span>' + regra.descricao + ' (' + regra.marcadores.length + ')</span>';
                legendContainer.appendChild(item);
            });

            if (markers.length > 0) {
                var group = new L.featureGroup(markers);
                map.fitBounds(group.getBounds().pad(0.1));
            }
        }

        window.renderMap = renderMap;
    </script>
</body>
</html>
`;

export default function ViewRelatoriosViewMapaScreen() {
    const route = useRoute<{ params: RouteParams }>();
    const navigation = useNavigation();
    const {id} = route.params;
    const [mapData, setMapData] = useState<MapaPontosResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await api.get<MapaPontosResponse>(`/api/relatorios/mapa/${id}/pontos`);
                setMapData(response.data);
                setError(null);
            } catch (err) {
                setError('Erro ao carregar o mapa');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (mapData && webViewRef.current) {
            webViewRef.current.injectJavaScript(`renderMap(${JSON.stringify(mapData)});`);
        }
    }, [mapData]);

    const onMessage = (event: { nativeEvent: { data: string } }) => {
        try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'mapReady') {
                // Map is ready
            }
        } catch (e) {
            // Ignore parse errors
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3a85bd" />
                    <Text style={styles.loadingText}>Carregando mapa...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{html: MAP_HTML}}
                onMessage={onMessage}
                style={styles.webView}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3a85bd" />
                        <Text style={styles.loadingText}>Inicializando mapa...</Text>
                    </View>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#666',
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: '#e15759',
        fontSize: 16,
        textAlign: 'center',
    },
});