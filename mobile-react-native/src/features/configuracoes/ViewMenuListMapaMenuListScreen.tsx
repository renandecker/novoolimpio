import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {api} from '../api';
import {Colors, Spacing, Typography} from '../theme';

interface ModuloMenu {
    id: number;
    antecessorId: number | null;
    rotulo: string;
}

const AG_CHARTS_ENTERPRISE_CDN = 'https://cdn.jsdelivr.net/npm/ag-charts-enterprise@14.1.0/dist/umd/ag-charts-enterprise.min.js';

function montarHtml(nodes: {id: number; parentId: number | null; name: string}[]): string {
    const dadosJson = JSON.stringify(nodes).replace(/</g, '\\u003c');
    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <script src="${AG_CHARTS_ENTERPRISE_CDN}"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, Roboto, Arial, sans-serif; }
    #myChart { width: 100%; height: calc(100vh - 56px); }
  </style>
</head>
<body>
  <div id="myChart"></div>
  <script>
    var dados = ${dadosJson};
    var chart = agCharts.AgCharts.create({
      container: document.getElementById('myChart'),
      data: dados,
      series: [{
        type: 'organization',
        idKey: 'id',
        parentIdKey: 'parentId',
        direction: 'vertical',
        innerSpacing: 20,
        outerSpacing: 40,
        depthSpacing: 52,
        node: {
          width: 180,
          cornerRadius: 10,
          title: {key: 'name', textAlign: 'left', fontSize: 13, fontWeight: 'bold'},
        },
      }],
    });
  </script>
</body>
</html>`;
}

export default function ViewMenuListMapaMenuListScreen() {
    const [modulos, setModulos] = useState<ModuloMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<ModuloMenu[]>('/api/basico/modulo/menu');
                if (ativo) setModulos(resp.data);
            } catch (erro) {
                if (ativo) setError('Erro ao carregar o menu.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, []);

    const html = useMemo(() => (modulos.length > 0 ? montarHtml(modulos.map(m => ({id: m.id, parentId: m.antecessorId, name: m.rotulo}))) : ''), [modulos]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={Colors.primary} size="large"/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );
    }

    if (modulos.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Nenhum módulo encontrado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <WebView originWhitelist={['*']} source={{html}} style={styles.webview}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    webview: {flex: 1},
    center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.lg},
    info: {fontSize: Typography.sizes.lg, textAlign: 'center'},
    error: {fontSize: Typography.sizes.lg, color: 'crimson', textAlign: 'center'},
});