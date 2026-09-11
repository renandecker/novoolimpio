import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Database, Download, Expand } from 'lucide-react';
import { GaugeChart, type GaugeConfiguracao } from './GaugeChart';
import { executarSqlIndicador, type IndicadorGauge, DEFAULT_GAUGE_CONFIG } from './indicadorGauge';
import { useApi } from '../../shared/services/api';

export default function IndicadorGaugeViewScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { get: loadIndicador } = useApi('/api/relatorios/indicador-gauge');

  const [indicador, setIndicador] = useState<IndicadorGauge | null>(null);
  const [loading, setLoading] = useState(true);
  const [gaugeData, setGaugeData] = useState<{ valorAtual: number; valorMinimo: number; valorMaximo: number } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await loadIndicador(parseInt(id));
      setIndicador(resp.data);
    } catch (err) {
      setError('Erro ao carregar indicador');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGaugeData = async () => {
    if (!indicador?.sql) return;
    setRefreshing(true);
    try {
      const result = await executarSqlIndicador(indicador.sql);
      setGaugeData(result);
    } catch (err) {
      console.error('Erro ao buscar dados do gauge:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, loadIndicador]);

  useEffect(() => {
    if (indicador) {
      fetchGaugeData();
    }
  }, [indicador]);

  const handleRefresh = () => {
    fetchGaugeData();
  };

  const handleExport = () => {
    if (!gaugeData || !indicador) return;
    const data = {
      indicador: indicador.nome,
      valorAtual: gaugeData.valorAtual,
      valorMinimo: gaugeData.valorMinimo,
      valorMaximo: gaugeData.valorMaximo,
      percentual: ((gaugeData.valorAtual - gaugeData.valorMinimo) / (gaugeData.valorMaximo - gaugeData.valorMinimo) * 100).toFixed(2) + '%',
      dataHora: new Date().toLocaleString('pt-BR'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${indicador.nome.replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <RotateCcw className="animate-spin mx-auto text-blue-600" size={32} />
        <p className="mt-4 text-gray-500">Carregando indicador...</p>
      </div>
    );
  }

  if (error || !indicador) {
    return (
      <div className="p-12 text-center">
        <Database className="mx-auto text-gray-300" size={48} />
        <p className="mt-4 text-gray-500">{error || 'Indicador não encontrado'}</p>
        <button
          onClick={() => navigate('/view/relatorios/indicador-gauge/list')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Voltar à Lista
        </button>
      </div>
    );
  }

  const config = { ...DEFAULT_GAUGE_CONFIG, ...indicador.configuracao };
  const percent = gaugeData 
    ? (gaugeData.valorAtual - gaugeData.valorMinimo) / (gaugeData.valorMaximo - gaugeData.valorMinimo)
    : config.percent;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/view/relatorios/indicador-gauge/list')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{indicador.nome}</h1>
              <p className="text-sm text-gray-500">Indicador Gauge • {indicador.configuracao?.nrOfLevels ?? 3} níveis</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              aria-label="Atualizar dados"
            >
              <RotateCcw size={20} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Exportar JSON"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => window.open(`/view/relatorios/indicador-gauge/form/${id}`, '_blank')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Editar"
            >
              <Expand size={20} />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Gauge Chart</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Última atualização: {new Date().toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-center items-center min-h-[300px]">
                <GaugeChart
                  config={config}
                  value={gaugeData?.valorAtual ?? 0}
                  minValue={gaugeData?.valorMinimo ?? 0}
                  maxValue={gaugeData?.valorMaximo ?? 100}
                  label={indicador.nome}
                  width={400}
                  height={300}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="text-blue-600" size={18} />
                Valores Atuais
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Valor Atual</div>
                  <div className="text-3xl font-bold text-gray-900 font-mono">
                    {gaugeData?.valorAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Valor Mínimo</div>
                  <div className="text-xl font-semibold text-gray-700 font-mono">
                    {gaugeData?.valorMinimo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Valor Máximo</div>
                  <div className="text-xl font-semibold text-gray-700 font-mono">
                    {gaugeData?.valorMaximo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '—'}
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-500 uppercase mb-1">Percentual</div>
                  <div className="text-3xl font-bold text-blue-600 font-mono">
                    {(percent * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="text-amber-600" size={18} />
                Configuração
              </h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Níveis</dt>
                  <dd className="font-medium text-gray-900">{config.nrOfLevels}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Largura do Arco</dt>
                  <dd className="font-medium text-gray-900">{config.arcWidth}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Animado</dt>
                  <dd className="font-medium text-gray-900">{config.animate ? 'Sim' : 'Não'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cor do Texto</dt>
                  <dd className="font-medium text-gray-900 flex items-center gap-2">
                    <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.textColor, border: '1px solid #e2e8f0' }} />
                    {config.textColor}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Cor do Ponteiro</dt>
                  <dd className="font-medium text-gray-900 flex items-center gap-2">
                    <span style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: config.needleColor, border: '1px solid #e2e8f0' }} />
                    {config.needleColor}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Database className="text-purple-600" size={18} />
                Cores dos Níveis
              </h3>
              <div className="flex flex-wrap gap-2">
                {config.colors.map((color, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        backgroundColor: color,
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <span className="text-sm font-mono text-gray-700">{color}</span>
                    <span className="text-xs text-gray-400">Nível {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Database className="text-green-600" size={18} />
            Consulta SQL
          </h3>
          <pre className="bg-gray-950 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm font-mono max-h-64 overflow-y-auto">
            {indicador.sql}
          </pre>
        </div>
      </main>
    </div>
  );
}