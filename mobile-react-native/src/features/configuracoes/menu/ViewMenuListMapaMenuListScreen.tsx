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

const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';

function montarHtml(nodes: {id: number; parentId: number | null; name: string}[]): string {
    const dadosJson = JSON.stringify(nodes).replace(/</g, '\\u003c');
    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <script src="${ECHARTS_CDN}"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, Roboto, Arial, sans-serif; background: #fff; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; background: #f4f4f4; align-items: center; border-bottom: 1px solid #ddd; }
    #toolbar select { font-size: 12px; padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }
    #myChart { width: 100%; height: calc(100vh - 55px); }
  </style>
</head>
<body>
  <div id="toolbar">
    <label style="font-size: 12px; font-weight: bold;">Direção:</label>
    <select id="direcao">
      <option value="VERTICAL">Vertical (Top-Bottom)</option>
      <option value="HORIZONTAL">Horizontal (Left-Right)</option>
      <option value="TOGGLE_REVERSE">Invertido (Bottom-Top)</option>
    </select>
  </div>
  <div id="myChart"></div>
  <script>
    var rawNodes = ${dadosJson};
    var myChart = echarts.init(document.getElementById('myChart'));

    function buildTree(nodes) {
      var map = {};
      nodes.forEach(function(n) {
        map[n.id] = { name: n.name, children: [] };
      });
      var roots = [];
      nodes.forEach(function(n) {
        var node = map[n.id];
        if (n.parentId !== null && n.parentId !== undefined && String(n.parentId) !== '' && map[n.parentId]) {
          map[n.parentId].children.push(node);
        } else {
          roots.push(node);
        }
      });
      if (roots.length > 1) {
        return [{ name: 'Menu Principal', children: roots }];
      }
      return roots;
    }

    function getOption(dir) {
      var orient = 'TB';
      if (dir === 'HORIZONTAL') orient = 'LR';
      if (dir === 'TOGGLE_REVERSE') orient = 'BT';

      return {
        tooltip: { trigger: 'item', triggerOn: 'mousemove' },
        series: [{
          type: 'tree',
          data: buildTree(rawNodes),
          top: '5%',
          left: '12%',
          bottom: '5%',
          right: '20%',
          symbolSize: 12,
          orient: orient,
          label: { position: 'left', verticalAlign: 'middle', align: 'right', fontSize: 12, color: '#0f172a' },
          leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
          emphasis: { focus: 'descendant' },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
          itemStyle: { color: '#1B65BF', borderColor: '#1B65BF' },
          lineStyle: { color: '#cbd5e1', width: 2, curveness: 0.5 }
        }]
      };
    }

    myChart.setOption(getOption('VERTICAL'));

    document.getElementById('direcao').addEventListener('change', function(e) {
      myChart.setOption(getOption(e.target.value));
    });

    window.addEventListener('resize', function() { myChart.resize(); });
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

    const nodes = useMemo(() =>
        modulos.map(m => ({
            id: m.id,
            parentId: m.antecessorId,
            name: m.rotulo,
        })),
        [modulos],
    );

    const htmlContent = useMemo(() => montarHtml(nodes), [nodes]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mapa Menu</Text>
            {loading && <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            {!loading && nodes.length === 0 ? <Text style={styles.empty}>Nenhum módulo encontrado.</Text> : null}

            {nodes.length > 0 && (
                <View style={styles.chartContainer}>
                    <WebView
                        originWhitelist={['*']}
                        source={{html: htmlContent}}
                        style={styles.webView}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        padding: Spacing.md,
    },
    title: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    error: {
        color: 'crimson',
        textAlign: 'center',
        marginTop: 20,
    },
    empty: {
        textAlign: 'center',
        color: Colors.textMuted,
        marginTop: 20,
    },
    chartContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    webView: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});
