import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, RotateCcw, Database, Code, BarChart2, Palette, SlidersHorizontal } from 'lucide-react';
import { FormLayout } from '../../shared/components/FormLayout';
import { GaugeChart, GAUGE_COLORS, type GaugeConfig } from './GaugeChart';
import {
  salvarIndicadorGauge,
  atualizarIndicadorGauge,
  carregarIndicadorGauge,
  executarSqlIndicador,
  type IndicadorGauge,
  type GaugeConfiguracao,
  DEFAULT_GAUGE_CONFIG,
} from './indicadorGauge';

const NR_OF_LEVELS_OPTIONS = [2, 3, 4, 5];
const ARC_WIDTH_OPTIONS = [
  { value: 0.1, label: 'Fino (0.1)' },
  { value: 0.2, label: 'Médio-fino (0.2)' },
  { value: 0.3, label: 'Médio (0.3)' },
  { value: 0.4, label: 'Médio-grosso (0.4)' },
  { value: 0.5, label: 'Grosso (0.5)' },
];
const TIPO_EXIBICAO_OPTIONS: { value: GaugeConfiguracao['tipoExibicao']; label: string }[] = [
  { value: 'valor', label: 'Valor' },
  { value: 'percentual', label: 'Percentual' },
  { value: 'ambos', label: 'Valor e Percentual' },
];

const GAUGE_PREVIEW_SQL = `SELECT
    COALESCE(SUM(valor_total), 0) AS valor_atual,
    0 AS valor_minimo,
    50000 AS valor_maximo -- Meta predefinida
FROM vendas
WHERE DATE_TRUNC('month', data_venda) = DATE_TRUNC('month', CURRENT_DATE);`;

export default function IndicadorGaugeFormScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [entity, setEntity] = useState<Partial<IndicadorGauge>>({
    nome: '',
    sql: GAUGE_PREVIEW_SQL,
    configuracao: { ...DEFAULT_GAUGE_CONFIG },
  });
  const [salvando, setSalvando] = useState(false);
  const [testResult, setTestResult] = useState<{ valorAtual: number; valorMinimo: number; valorMaximo: number } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isEditing && id) {
      carregarIndicadorGauge(parseInt(id))
        .then((resp) => {
          setEntity({
            nome: resp.nome,
            sql: resp.sql,
            configuracao: { ...DEFAULT_GAUGE_CONFIG, ...resp.configuracao },
          });
        })
        .catch(() => {
          alert('Erro ao carregar indicador');
          navigate('/view/indicador/listIndicadorGauge');
        });
    }
  }, [id, isEditing, navigate]);

  const handleConfigChange = <K extends keyof GaugeConfiguracao>(key: K, value: GaugeConfiguracao[K]) => {
    setEntity((prev) => ({
      ...prev,
      configuracao: { ...(prev.configuracao ?? DEFAULT_GAUGE_CONFIG), [key]: value },
    }));
  };

  const handleColorChange = (index: number, color: string) => {
    const colors = [...(entity.configuracao?.colors ?? DEFAULT_GAUGE_CONFIG.colors)];
    colors[index] = color;
    handleConfigChange('colors', colors);
  };

  const handleTestSql = async () => {
    if (!entity.sql?.trim()) {
      alert('Informe a consulta SQL');
      return;
    }
    setTesting(true);
    try {
      const result = await executarSqlIndicador(entity.sql);
      setTestResult(result);
    } catch (error) {
      console.error('Erro ao testar SQL:', error);
      alert('Erro ao executar SQL. Verifique a sintaxe.');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (vals: Record<string, unknown>) => {
    const nome = String(vals.nome ?? entity.nome ?? '').trim();
    const sql = String(vals.sql ?? entity.sql ?? '').trim();
    const configuracao = entity.configuracao ?? DEFAULT_GAUGE_CONFIG;

    if (!nome) {
      alert('Informe o nome do indicador');
      return;
    }
    if (!sql) {
      alert('Informe a consulta SQL');
      return;
    }
    if (!configuracao.colors?.length || configuracao.colors.length < 2) {
      alert('Configure pelo menos 2 cores');
      return;
    }

    setSalvando(true);
    try {
      if (isEditing && id) {
        await atualizarIndicadorGauge(parseInt(id), { nome, sql, configuracao });
      } else {
        await salvarIndicadorGauge({ nome, sql, configuracao });
      }
      alert(isEditing ? 'Indicador atualizado com sucesso!' : 'Indicador criado com sucesso!');
      navigate('/view/indicador/listIndicadorGauge');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar indicador');
    } finally {
      setSalvando(false);
    }
  };

  const config: GaugeConfig = entity.configuracao ?? DEFAULT_GAUGE_CONFIG;
  const previewValue = testResult
    ? (testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo)
    : config.percent;
  const previewMin = testResult?.valorMinimo ?? 0;
  const previewMax = testResult?.valorMaximo ?? 100;

  const SegmentButton = ({
    label,
    active,
    onClick,
    style = {},
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
    style?: React.CSSProperties;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid #cbd5e1',
        backgroundColor: active ? '#2563eb' : '#fff',
        color: active ? '#fff' : '#475569',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        ...style,
      }}
      onMouseOver={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = '#f1f5f9';
      }}
      onMouseOut={(e) => {
        if (!active) e.currentTarget.style.backgroundColor = '#fff';
      }}
    >
      {label}
    </button>
  );

  const ColorOptionButton = ({
    color,
    active,
    onClick,
  }: {
    color: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '28px',
        height: '28px',
        borderRadius: '6px',
        border: active ? '2px solid #1e293b' : '2px solid transparent',
        backgroundColor: color,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
      title={color}
    />
  );

  return (
    <FormLayout
      title={isEditing ? 'Editar Indicador Gauge' : 'Novo Indicador Gauge'}
      tabs={[
        {
          key: 'definicao',
          label: 'Definição',
          icon: Database,
          fields: [
            { name: 'nome', label: 'Nome do Indicador *', required: true, placeholder: 'Ex: Meta de Vendas Mensal' },
            {
              name: 'sql',
              label: 'Consulta SQL *',
              type: 'textarea',
              required: true,
              placeholder: 'SELECT ...',
              help: 'O SQL deve retornar 3 colunas: valor_atual, valor_minimo, valor_maximo',
              rows: 8,
            },
          ],
          customContent: (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                <button
                  type="button"
                  onClick={handleTestSql}
                  disabled={testing || !entity.sql?.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={16} className={testing ? 'animate-spin' : ''} />
                  {testing ? 'Testando...' : 'Testar SQL'}
                </button>
                <button
                  type="button"
                  onClick={() => setEntity((prev) => ({ ...prev, sql: GAUGE_PREVIEW_SQL }))}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Code size={16} /> Usar Exemplo
                </button>
              </div>

              {testResult && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <Database size={16} className="text-green-600" /> Resultado do Teste
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                    <div>
                      <div className="text-xs text-green-600 font-medium">Valor Atual</div>
                      <div className="text-lg font-bold text-green-900 font-mono">{testResult.valorAtual.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-600 font-medium">Valor Mínimo</div>
                      <div className="text-lg font-bold text-green-900 font-mono">{testResult.valorMinimo.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-600 font-medium">Valor Máximo</div>
                      <div className="text-lg font-bold text-green-900 font-mono">{testResult.valorMaximo.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-green-600 font-medium">Percentual</div>
                      <div className="text-lg font-bold text-green-900 font-mono">
                        {(((testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo)) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ),
        },
        {
          key: 'aparencia',
          label: 'Aparência',
          icon: Palette,
          customContent: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '4px' }}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Tipo de Exibição *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TIPO_EXIBICAO_OPTIONS.map((opt) => (
                    <SegmentButton
                      key={opt.value}
                      label={opt.label}
                      active={config.tipoExibicao === opt.value}
                      onClick={() => handleConfigChange('tipoExibicao', opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Níveis de Cor *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {NR_OF_LEVELS_OPTIONS.map((n) => (
                    <SegmentButton
                      key={n}
                      label={`${n} níveis`}
                      active={config.nrOfLevels === n}
                      onClick={() => handleConfigChange('nrOfLevels', n)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Largura do Arco *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ARC_WIDTH_OPTIONS.map((opt) => (
                    <SegmentButton
                      key={opt.value}
                      label={opt.label}
                      active={config.arcWidth === opt.value}
                      onClick={() => handleConfigChange('arcWidth', opt.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Animar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <SegmentButton
                    label="Sim"
                    active={config.animate}
                    onClick={() => handleConfigChange('animate', true)}
                  />
                  <SegmentButton
                    label="Não"
                    active={!config.animate}
                    onClick={() => handleConfigChange('animate', false)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">Cores dos Níveis</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Array.from({ length: config.nrOfLevels }, (_, i) => i).map((levelIndex) => (
                    <div key={levelIndex} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex],
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', minWidth: '70px' }}>Nível {levelIndex + 1}</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {GAUGE_COLORS.map((color) => (
                          <ColorOptionButton
                            key={color}
                            color={color}
                            active={(config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex]) === color}
                            onClick={() => handleColorChange(levelIndex, color)}
                          />
                        ))}
                      </div>
                      <input
                        type="color"
                        value={config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex]}
                        onChange={(e) => handleColorChange(levelIndex, e.target.value)}
                        style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                        title="Escolher cor personalizada"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        },
        {
          key: 'cores-avancadas',
          label: 'Cores Avançadas',
          icon: SlidersHorizontal,
          customContent: (
            <div className="form-grid">
              {([
                ['textColor', 'Cor do Texto'],
                ['needleColor', 'Cor do Ponteiro'],
                ['needleBaseColor', 'Cor da Base do Ponteiro'],
              ] as [keyof GaugeConfiguracao, string][]).map(([key, label]) => (
                <label key={key} className="form-field">
                  <span className="form-label">{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="color"
                      value={config[key] as string}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      style={{ width: '48px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', cursor: 'pointer', padding: 0 }}
                    />
                    <input
                      type="text"
                      value={config[key] as string}
                      onChange={(e) => handleConfigChange(key, e.target.value)}
                      className="form-input"
                    />
                  </div>
                </label>
              ))}
            </div>
          ),
        },
        {
          key: 'preview',
          label: 'Pré-visualização',
          icon: BarChart2,
          customContent: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 className="font-medium text-gray-800 mb-4">{entity.nome || 'Indicador Gauge'}</h4>
                <GaugeChart
                  config={config}
                  value={testResult?.valorAtual ?? previewValue}
                  minValue={previewMin}
                  maxValue={previewMax}
                />
              </div>
            </div>
          ),
        },
      ]}
      initialValues={entity}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/view/indicador/listIndicadorGauge')}
      submitLabel="Salvar"
      cancelLabel="Voltar"
      saving={salvando}
      error=""
    />
  );
}