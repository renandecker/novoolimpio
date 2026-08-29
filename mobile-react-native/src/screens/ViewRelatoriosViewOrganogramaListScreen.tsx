import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {WebView} from 'react-native-webview';
import {api} from '../api';
import {Colors, Spacing, Typography} from '../theme';

// -----------------------------------------------------------------------------------------
// Visualização do Organograma no app mobile.
// A biblioteca AG Charts Org Chart é web (DOM/Canvas), então aqui ela roda dentro de uma
// WebView carregando o bundle UMD do ag-charts-enterprise via CDN. Os dados (já com a cor
// por departamento) são buscados pelo app (autenticado) e injetados na página — nada é salvo.
// -----------------------------------------------------------------------------------------

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

const AG_CHARTS_ENTERPRISE_CDN = 'https://cdn.jsdelivr.net/npm/ag-charts-enterprise@14.1.0/dist/umd/ag-charts-enterprise.min.js';

function montarHtml(dados: OrganogramaDados): string {
    const dadosJson = JSON.stringify(dados.nos).replace(/</g, '\\u003c');
    const direcaoInicial = dados.direcao || 'VERTICAL';
    return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
  <script src="${AG_CHARTS_ENTERPRISE_CDN}"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, Roboto, Arial, sans-serif; }
    #toolbar { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; background: #f4f4f4; align-items: center; }
    #toolbar select, #toolbar button { font-size: 13px; padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }
    #toolbar button { background: #1B65BF; color: #fff; border: none; }
    #myChart { width: 100%; height: calc(100vh - 96px); }
  </style>
</head>
<body>
  <div id="toolbar">
    <select id="direcao">
      <option value="HORIZONTAL">Horizontal</option>
      <option value="VERTICAL">Vertical</option>
      <option value="TOGGLE_REVERSE">Toggle Reverse</option>
    </select>
    <button id="expandAll">Expand All</button>
    <button id="collapseAll">Collapse All</button>
    <select id="noSelecionado"></select>
    <button id="toggleCto">Toggle CTO</button>
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
            width: 190,
            cornerRadius: 12,
            image: {key: 'avatar', position: 'left', width: 40, height: 40, cornerRadius: 20},
            title: {key: 'name', textAlign: 'left', fontSize: 14, fontWeight: 'bold'},
            subtitle: {key: 'job', textAlign: 'left', fontStyle: 'italic'},
            labels: [{key: 'department', textAlign: 'left'}, {key: 'location', textAlign: 'left'}],
            itemStyler: function (p) {
              return {fill: p.datum.cor, fillOpacity: 0.2, stroke: p.datum.cor, strokeWidth: 2};
            },
          },
          link: {itemStyler: function (p) { return {stroke: p.fromDatum ? p.fromDatum.cor : undefined}; }},
          expander: {text: {showAllChildren: true, showDirectChildren: true}},
        }],
      };
    }

    var chart = agCharts.AgCharts.create(montarOpcoes());

    function atualizar() { chart = agCharts.AgCharts.update(chart, montarOpcoes()); }

    document.getElementById('direcao').value = '${direcaoInicial}';
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
    document.getElementById('toggleCto').addEventListener('click', function () {
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

export default function ViewRelatoriosViewOrganogramaListScreen() {
    const route = useRoute();
    const id = (route.params as {id?: string} | undefined)?.id;

    const [dados, setDados] = useState<OrganogramaDados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get(`/api/relatorios/organograma/${id}/dados`);
                if (ativo) setDados(resp.data as OrganogramaDados);
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                if (ativo) setError('Erro ao carregar os dados do organograma.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => {
            ativo = false;
        };
    }, [id]);

    const html = useMemo(() => (dados ? montarHtml(dados) : ''), [dados]);

    if (!id) {
        return (
            <View style={styles.center}>
                <Text style={styles.info}>Selecione um organograma na listagem para visualizar.</Text>
            </View>
        );
    }

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

    return (
        <View style={styles.container}>
            {dados && <WebView originWhitelist={['*']} source={{html}} style={styles.webview}/>}
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
