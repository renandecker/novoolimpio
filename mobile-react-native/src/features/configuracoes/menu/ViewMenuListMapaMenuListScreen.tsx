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
  <script>
    agCharts.LicenseManager.setLicenseKey('USING_AG_CHARTS_DEVELOPER_LICENSE');
  </script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, Roboto, Arial, sans-serif; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; background: #f4f4f4; align-items: center; }
    #toolbar select, #toolbar button { font-size: 12px; padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }
    #toolbar button { background: #1B65BF; color: #fff; border: none; }
    #myChart { width: 100%; height: calc(100vh - 96px); }
  </style>
</head>
<body>
  <div id="toolbar">
    <select id="direcao">
      <option value="VERTICAL">Vertical</option>
      <option value="HORIZONTAL">Horizontal</option>
      <option value="TOGGLE_REVERSE">Toggle Reverse</option>
    </select>
    <button id="expandAll">Expand All</button>
    <button id="collapseAll">Collapse All</button>
    <select id="noSelecionado"></select>
    <button id="toggleNo">Toggle Nó</button>
  </div>
  <div id="myChart"></div>
  <script>
    var dados = ${dadosJson};
    var collapsed = [];

    function idsComFilhos() {
      var pais = {};
      dados.forEach(function (n) { if (n.parentId !== null && n.parentId !== undefined && String(n.parentId) !== '') pais[String(n.parentId)] = true; });
      return Object.keys(pais);
    }

    function direcaoParaSerie(direcao) {
      if (direcao === 'HORIZONTAL') return {direction: 'horizontal', reverse: false};
      if (direcao === 'TOGGLE_REVERSE') return {direction: 'vertical', reverse: true};
      return {direction: 'vertical', reverse: false};
    }

    function montarOpcoes() {
      var direcao = document.getElementById('direcao').value;
      var dr = direcaoParaSerie(direcao);
      return {
        container: document.getElementById('myChart'),
        data: dados,
        initialState: {collapsed: collapsed},
        series: [{
          type: 'organization',
          idKey: 'id',
          parentIdKey: 'parentId',
          direction: dr.direction,
          reverse: dr.reverse,
          innerSpacing: 20,
          outerSpacing: 40,
          depthSpacing: 52,
          node: {
            width: 180,
            cornerRadius: 10,
            title: {key: 'name', textAlign: 'left', fontSize: 13, fontWeight: 'bold'},
            itemStyler: function () { return {fill: '#1B65BF', fillOpacity: 0.15, stroke: '#1B65BF', strokeWidth: 2}; },
          },
          link: {itemStyler: function () { return {stroke: '#1B65BF'}; }},
          expander: {text: {showAllChildren: true, showDirectChildren: true}},
        }],
      };
    }

    var chart = agCharts.AgCharts.create(montarOpcoes());

    function atualizar() { chart = agCharts.AgCharts.update(chart, montarOpcoes()); }

    document.getElementById('direcao').addEventListener('change', atualizar);

    var selectNo = document.getElementById('noSelecionado');
    idsComFilhos().forEach(function (id) {
      var no = dados.find(function (n) { return String(n.id) === id; });
      var opt = document.createElement('option');
      opt.value = id;
      opt.textContent = no ? (no.name || id) : id;
      selectNo.appendChild(opt);
    });

    document.getElementById('expandAll').addEventListener('click', function () { collapsed = []; atualizar(); });
    document.getElementById('collapseAll').addEventListener('click', function () { collapsed = idsComFilhos(); atualizar(); });
    document.getElementById('toggleNo').addEventListener('click', function () {
      var id = selectNo.value;
      if (!id) return;
      var idx = collapsed.indexOf(id);
      if (idx >= 0) collapsed.splice(idx, 1); else collapsed.push(id);
      atualizar();
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