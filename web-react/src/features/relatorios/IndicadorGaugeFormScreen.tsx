import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, RotateCcw, Database, Code, BarChart2, Palette, SlidersHorizontal } from 'lucide-react';
import { FormLayout } from '../../shared/components/FormLayout';
import { AutoComplete } from '../../shared/components/AutoComplete';
import { GAUGE_COLORS, type GaugeConfiguracao } from './GaugeChart';
import { salvarIndicadorGauge, atualizarIndicadorGauge, executarSqlIndicador, type IndicadorGauge, DEFAULT_GAUGE_CONFIG } from './indicadorGauge';
import { useApi } from '../../shared/services/api';
import { API_PATHS } from '../../shared/services/apiPaths';

const NR_OF_LEVELS_OPTIONS = [
  { value: 2, label: '2 Níveis' },
  { value: 3, label: '3 Níveis' },
  { value: 4, label: '4 Níveis' },
  { value: 5, label: '5 Níveis' },
];

const ARC_WIDTH_OPTIONS = [
  { value: 0.1, label: 'Fino (0.1)' },
  { value: 0.2, label: 'Médio-fino (0.2)' },
  { value: 0.3, label: 'Médio (0.3)' },
  { value: 0.4, label: 'Médio-grosso (0.4)' },
  { value: 0.5, label: 'Grosso (0.5)' },
];

interface ColorOption {
  value: string;
  label: string;
}

const COLOR_OPTIONS: ColorOption[] = GAUGE_COLORS.map(color => ({
  value: color,
  label: color,
}));

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
  
  const { post: saveIndicador } = useApi('/api/relatorios/indicador-gauge');
  const { put: updateIndicador } = useApi('/api/relatorios/indicador-gauge');
  const { get: loadIndicador } = useApi('/api/relatorios/indicador-gauge');

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
      loadIndicador(parseInt(id)).then(resp => {
        setEntity({
          ...resp.data,
          configuracao: { ...DEFAULT_GAUGE_CONFIG, ...resp.data.configuracao },
        });
      }).catch(() => {
        alert('Erro ao carregar indicador');
        navigate('/view/relatorios/indicador-gauge/list');
      });
    }
  }, [id, isEditing, loadIndicador, navigate]);

  const handleConfigChange = <K extends keyof GaugeConfiguracao>(key: K, value: GaugeConfiguracao[K]) => {
    setEntity(prev => ({
      ...prev,
      configuracao: { ...prev.configuracao!, [key]: value },
    }));
  };

  const handleColorChange = (index: 0 | 1 | 2, color: string) => {
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

  const handleSubmit = async () => {
    if (!entity.nome?.trim()) {
      alert('Informe o nome do indicador');
      return;
    }
    if (!entity.sql?.trim()) {
      alert('Informe a consulta SQL');
      return;
    }
    if (!entity.configuracao?.colors?.length || entity.configuracao.colors.length < 2) {
      alert('Configure pelo menos 2 cores');
      return;
    }

    setSalvando(true);
    try {
      const payload = {
        nome: entity.nome,
        sql: entity.sql,
        configuracao: entity.configuracao,
      };

      if (isEditing && id) {
        await updateIndicador(parseInt(id), payload);
      } else {
        await saveIndicador(payload);
      }
      alert(isEditing ? 'Indicador atualizado com sucesso!' : 'Indicador criado com sucesso!');
      navigate('/view/relatorios/indicador-gauge/list');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar indicador');
    } finally {
      setSalvando(false);
    }
  };

  const config = entity.configuracao ?? DEFAULT_GAUGE_CONFIG;
  const previewValue = testResult 
    ? ((testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo))
    : config.percent;
  const previewMin = testResult?.valorMinimo ?? 0;
  const previewMax = testResult?.valorMaximo ?? 100;

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
                  onClick={() => setEntity(prev => ({ ...prev, sql: GAUGE_PREVIEW_SQL }))}
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
                        {((testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo) * 100).toFixed(1)}%
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
          fields: [
            {
              name: 'nrOfLevels',
              label: 'Níveis de Cor *',
              type: 'select',
              options: NR_OF_LEVELS_OPTIONS,
              required: true,
            },
            {
              name: 'arcWidth',
              label: 'Largura do Arco *',
              type: 'select',
              options: ARC_WIDTH_OPTIONS,
              required: true,
            },
            {
              name: 'animate',
              label: 'Animar',
              type: 'boolean',
              booleanLabels: { on: 'Sim', off: 'Não' },
            },
          ],
          customContent: (
            <div style={{ marginTop: '20px' }}>
              <h4 className="font-medium text-gray-800 mb-4">Cores dos Níveis</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                {Array.from({ length: config.nrOfLevels }, (_, i) => i).map((levelIndex) => (
                  <div key={levelIndex} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Cor do Nível {levelIndex + 1}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex],
                          border: '2px solid #e2e8f0',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        }}
                      />
                      <select
                        value={config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex]}
                        onChange={(e) => handleColorChange(levelIndex as 0 | 1 | 2, e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        {COLOR_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value} style={{ backgroundColor: opt.value, color: '#fff' }}>
                            {opt.value}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="color"
                      value={config.colors[levelIndex] ?? DEFAULT_GAUGE_CONFIG.colors[levelIndex]}
                      onChange={(e) => handleColorChange(levelIndex as 0 | 1 | 2, e.target.value)}
                      className="mt-2 w-20 h-8 rounded-lg border border-gray-200 cursor-pointer"
                      title="Escolher cor personalizada"
                    />
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          key: 'cores-avancadas',
          label: 'Cores Avançadas',
          icon: SlidersHorizontal,
          fields: [
            {
              name: 'textColor',
              label: 'Cor do Texto',
              type: 'color',
            },
            {
              name: 'needleColor',
              label: 'Cor do Ponteiro',
              type: 'color',
            },
            {
              name: 'needleBaseColor',
              label: 'Cor da Base do Ponteiro',
              type: 'color',
            },
          ],
        },
        {
          key: 'preview',
          label: 'Pré-visualização',
          icon: BarChart2,
          fields: [],
          customContent: (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', padding: '20px' }}>
              <div style={{ textAlign: 'center' }}>
                <h4 className="font-medium text-gray-800 mb-4">{entity.nome || 'Indicador Gauge'}</h4>
                <div style={{ width: '300px', height: '200px', margin: '0 auto' }}>
                  <svg width="300" height="200" viewBox="0 0 300 200">
                    <defs>
                      {config.animate && (
                        <style>{`
                          .gauge-arc { animation: drawArc 1s ease-out forwards; }
                          .gauge-needle { animation: rotateNeedle 1s ease-out forwards; transform-origin: 150px 100px; }
                          @keyframes drawArc { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
                          @keyframes rotateNeedle { from { transform: rotate(-90deg); } to { transform: rotate(${getNeedleAngle(config, previewValue, 180)}deg); } }
                        `}</style>
                      )}
                    </defs>
                    {getLevelConfig(config, 180).map((level, i) => (
                      <path
                        key={i}
                        d={describeArc(150, 100, 120, level.startAngle, level.endAngle)}
                        stroke={level.color}
                        strokeWidth={config.arcWidth * 240}
                        fill="none"
                        strokeLinecap="round"
                        className={config.animate ? 'gauge-arc' : ''}
                        style={{
                          strokeDasharray: `${(level.endAngle - level.startAngle) / 180 * 2 * Math.PI * 120} ${2 * Math.PI * 120}`,
                          strokeDashoffset: config.animate ? `${2 * Math.PI * 120}` : '0',
                        }}
                      />
                    ))}
                    <circle cx="150" cy="100" r={120 * 0.15} fill={config.needleBaseColor} />
                    <path
                      d={getNeedlePath(config, previewValue, 180)}
                      fill={config.needleColor}
                      className={config.animate ? 'gauge-needle' : ''}
                      style={{ transformOrigin: '150px 100px' }}
                    />
                    <text x="150" y="110" textAnchor="middle" fill={config.textColor} fontSize="28" fontWeight="bold" fontFamily="system-ui, sans-serif">
                      {previewMin + (previewMax - previewMin) * previewValue}.toLocaleString('pt-BR')
                    </text>
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Valor: {(previewMin + (previewMax - previewMin) * previewValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {previewMax.toLocaleString('pt-BR')} ({(previewValue * 100).toFixed(1)}%)
                </p>
              </div>
            </div>
          ),
        },
      ]}
      initialValues={entity}
      onSubmit={(vals) => setEntity({ ...entity, ...vals })}
      onCancel={() => navigate('/view/relatorios/indicador-gauge/list')}
      submitLabel="Salvar"
      cancelLabel="Voltar"
      submitDisabled={salvando}
      submitIcon={salvando ? <RotateCcw className="animate-spin" size={18} /> : <Save size={18} />}
    />
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
}

function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
}

function getLevelConfig(config: GaugeConfiguracao, totalAngle: number) {
  const levels = config.nrOfLevels;
  const anglePerLevel = totalAngle / levels;
  return config.colors.map((color, i) => ({
    color,
    startAngle: -90 + (i * anglePerLevel),
    endAngle: -90 + ((i + 1) * anglePerLevel),
  }));
}

function getNeedleAngle(config: GaugeConfiguracao, percent: number, totalAngle: number) {
  const clampedPercent = Math.max(0, Math.min(1, percent));
  return -90 + (clampedPercent * totalAngle);
}

function getNeedlePath(config: GaugeConfiguracao, percent: number, totalAngle: number) {
  const centerX = 150;
  const centerY = 100;
  const radius = 120;
  const needleAngle = getNeedleAngle(config, percent, totalAngle);
  const needleLength = radius * 0.9;
  const needleBaseRadius = radius * 0.15;
  
  const needleTip = polarToCartesian(centerX, centerY, needleLength, needleAngle);
  const needleBase1 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle - 90);
  const needleBase2 = polarToCartesian(centerX, centerY, needleBaseRadius, needleAngle + 90);
  
  return `M ${needleBase1.x} ${needleBase1.y} L ${needleTip.x} ${needleTip.y} L ${needleBase2.x} ${needleBase2.y} Z`;
}