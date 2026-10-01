import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {api} from '../../shared/services/api';
import {Colors, Spacing, Typography} from '../../shared/styles/theme';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper, ReportFilterSqlValues} from '../../shared/types/types';

interface OrganogramaNo {
    id: string | number;
    parentId: string | number | null;
    name?: string;
    job?: string;
    department?: string;
    location?: string;
    status?: string;
    avatar?: string;
    cor?: string;
    [key: string]: unknown;
}

interface OrganogramaDados {
    id: number;
    nome: string;
    direcao: string;
    colunas: string[];
    nos: OrganogramaNo[];
}

const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js';

function montarHtml(dados: OrganogramaDados): string {
    const dadosJson = JSON.stringify(dados.nos).replace(/</g, '\\u003c');
    const direcaoInicial = dados.direcao || 'VERTICAL';
    const nomeOrganograma = dados.nome || 'Organograma';

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
    var nomeOrg = ${JSON.stringify(nomeOrganograma)};
    var myChart = echarts.init(document.getElementById('myChart'));

    function buildTree(nodes) {
      var map = {};
      nodes.forEach(function(n) {
        var nodeId = String(n.id);
        var label = n.name ? n.name + (n.job ? '\\n(' + n.job + ')' : '') : nodeId;
        map[nodeId] = {
          name: label,
          itemStyle: { color: n.cor || '#1B65BF' },
          children: []
        };
      });

      var roots = [];
      nodes.forEach(function(n) {
        var nodeId = String(n.id);
        var node = map[nodeId];
        var parentId = n.parentId !== null && n.parentId !== undefined && String(n.parentId) !== '' ? String(n.parentId) : null;
        if (parentId !== null && map[parentId]) {
          map[parentId].children.push(node);
        } else {
          roots.push(node);
        }
      });

      if (roots.length > 1) {
        return [{ name: nomeOrg, children: roots }];
      }
      return roots;
    }

    function getOption(dir) {
      var orient = 'TB';
      var d = (dir || '').toUpperCase();
      if (d === 'HORIZONTAL') orient = 'LR';
      if (d === 'TOGGLE_REVERSE') orient = 'BT';

      return {
        tooltip: { trigger: 'item', triggerOn: 'mousemove' },
        series: [{
          type: 'tree',
          data: buildTree(rawNodes),
          top: '5%',
          left: '12%',
          bottom: '5%',
          right: '20%',
          symbolSize: 14,
          orient: orient,
          label: { position: 'left', verticalAlign: 'middle', align: 'right', fontSize: 12, color: '#0f172a' },
          leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
          emphasis: { focus: 'descendant' },
          expandAndCollapse: true,
          animationDuration: 550,
          animationDurationUpdate: 750,
          lineStyle: { color: '#cbd5e1', width: 2, curveness: 0.5 }
        }]
      };
    }

    var initialDir = ${JSON.stringify(direcaoInicial)};
    myChart.setOption(getOption(initialDir));
    document.getElementById('direcao').value = initialDir;

    document.getElementById('direcao').addEventListener('change', function(e) {
      myChart.setOption(getOption(e.target.value));
    });

    window.addEventListener('resize', function() { myChart.resize(); });
  </script>
</body>
</html>`;
}

export default function ViewRelatoriosViewOrganogramaListScreen() {
    const route = useRoute<any>();
    const id = route.params?.id;

    const [dados, setDados] = useState<OrganogramaDados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [filtrosAplicados, setFiltrosAplicados] = useState<ReportFilterSqlValues | undefined>(undefined);

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        (async () => {
            try {
                const resp = await api.get<FiltroRelatorioWrapper[]>('/api/relatorios/filtros/viewOrganograma', {
                    params: {organogramaId: id},
                });
                if (ativo) setFiltros(resp.data);
            } catch (erro) {
                console.error('Erro ao carregar filtros do organograma:', erro);
            }
        })();
        return () => { ativo = false; };
    }, [id]);

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<OrganogramaDados>(`/api/relatorios/organograma/${id}/dados`, {
                    params: filtrosAplicados && Object.keys(filtrosAplicados).length > 0
                        ? {filtros: JSON.stringify(filtrosAplicados)}
                        : {},
                });
                if (!ativo) return;
                setDados(resp.data);
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                if (ativo) setError('Erro ao carregar os dados do organograma. Verifique o SQL cadastrado.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, [id, filtrosAplicados]);

    const htmlContent = useMemo(() => {
        if (!dados) return '';
        return montarHtml(dados);
    }, [dados]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Organograma{dados ? `: ${dados.nome}` : ''}</Text>
            {!id && <Text style={styles.empty}>Selecione um organograma na listagem para visualizar.</Text>}
            {filtros.length > 0 && (
                <ReportFilters
                    filtros={filtros}
                    onFiltersChange={setFiltros}
                    onApplyFilters={(valores) => {
                        setFiltrosAplicados(valores && Object.keys(valores).length > 0 ? valores : undefined);
                    }}
                />
            )}
            {loading && <ActivityIndicator size="large" color={Colors.primary} style={{marginTop: 20}} />}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {dados && (
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
        backgroundColor: Colors.bgPrimary,
        padding: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    error: {
        color: Colors.error,
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
