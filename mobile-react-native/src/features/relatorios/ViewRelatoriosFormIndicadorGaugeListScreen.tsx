import React, { useState, useEffect } from 'react';
import { FormLayout, FormTabConfig } from '../FormLayout';
import { AutoComplete } from '../AutoComplete';
import { useApi } from '../../shared/services/api';
import { API_PATHS } from '../../shared/services/apiPaths';
import { DataTable } from '../DataTable';
import { MasterDetail } from '../MasterDetail';
import type { ApiItem } from '../types';

const NR_OF_LEVELS_OPTIONS = [
    { value: '2', label: '2 Níveis' },
    { value: '3', label: '3 Níveis' },
    { value: '4', label: '4 Níveis' },
    { value: '5', label: '5 Níveis' },
];

const ARC_WIDTH_OPTIONS = [
    { value: '0.1', label: 'Fino (0.1)' },
    { value: '0.2', label: 'Médio-fino (0.2)' },
    { value: '0.3', label: 'Médio (0.3)' },
    { value: '0.4', label: 'Médio-grosso (0.4)' },
    { value: '0.5', label: 'Grosso (0.5)' },
];

const GAUGE_COLORS = [
    '#22c55e', '#16a34a', '#15803d', '#166534',
    '#84cc16', '#65a30d', '#4d7c0f', '#3f6212',
    '#eab308', '#ca8a04', '#a16207', '#854d0e',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#f43f5e', '#e11d48', '#be123c', '#9f1239',
    '#ec4899', '#db2777', '#be185d', '#9d174d',
    '#a855f7', '#9333ea', '#7e22ce', '#6b21a8',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
    '#06b6d4', '#0891b2', '#0e7490', '#155e75',
    '#14b8a6', '#0d9488', '#0f766e', '#115e59',
    '#f97316', '#ea580c', '#c2410c', '#9a3412',
];

const COLOR_OPTIONS = GAUGE_COLORS.map(color => ({ value: color, label: color }));

const DEFAULT_CONFIG = {
    nrOfLevels: 3,
    colors: ['#22c55e', '#eab308', '#ef4444'],
    arcWidth: 0.3,
    percent: 0.7,
    textColor: '#1e293b',
    needleColor: '#475569',
    needleBaseColor: '#475569',
    animate: true,
};

const EXAMPLE_SQL = `SELECT 
    COALESCE(SUM(valor_total), 0) AS valor_atual,
    0 AS valor_minimo,
    50000 AS valor_maximo -- Meta predefinida
FROM vendas
WHERE DATE_TRUNC('month', data_venda) = DATE_TRUNC('month', CURRENT_DATE);`;

interface IndicadorGaugeFormData {
    entity: {
        id?: number;
        nome?: string;
        sql?: string;
        configuracao?: {
            nrOfLevels: number;
            colors: string[];
            arcWidth: number;
            percent: number;
            textColor: string;
            needleColor: string;
            needleBaseColor: string;
            animate: boolean;
        };
    };
    usuarios: ApiItem[];
    unidades: ApiItem[];
    perfis: ApiItem[];
    filtros: any[];
}

export default function ViewRelatoriosFormIndicadorGaugeListScreen() {
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [filtros, setFiltros] = useState<any[]>([]);
    const [testResult, setTestResult] = useState<{ valorAtual: number; valorMinimo: number; valorMaximo: number } | null>(null);
    const [testing, setTesting] = useState(false);

    const { post: saveIndicador, put: updateIndicador, get: loadIndicador } = useApi('/api/relatorios/indicador-gauge');
    const { post: saveFiltro } = useApi(API_PATHS.relatorios.filtro);
    const { delete: deleteFiltro } = useApi(API_PATHS.relatorios.filtro);

    const [entity, setEntity] = useState<IndicadorGaugeFormData['entity']>({
        nome: '',
        sql: EXAMPLE_SQL,
        configuracao: { ...DEFAULT_CONFIG },
    });
    const [filtroNome, setFiltroNome] = useState('');
    const [filtroDimensao, setFiltroDimensao] = useState<any>(null);

    const isEditing = !!entity.id;

    const handleConfigChange = <K extends keyof IndicadorGaugeFormData['entity']['configuracao']>(
        key: K,
        value: IndicadorGaugeFormData['entity']['configuracao'][K]
    ) => {
        setEntity(prev => ({
            ...prev,
            configuracao: { ...prev.configuracao!, [key]: value },
        }));
    };

    const handleColorChange = (index: number, color: string) => {
        const colors = [...(entity.configuracao?.colors ?? DEFAULT_CONFIG.colors)];
        colors[index] = color;
        handleConfigChange('colors', colors);
    };

    const addNivel = () => {
        if (entity.configuracao && entity.configuracao.nrOfLevels < 5) {
            const newColors = [...entity.configuracao.colors, DEFAULT_CONFIG.colors[entity.configuracao.nrOfLevels % DEFAULT_CONFIG.colors.length]];
            handleConfigChange('nrOfLevels', entity.configuracao.nrOfLevels + 1);
            handleConfigChange('colors', newColors);
        }
    };

    const removeNivel = () => {
        if (entity.configuracao && entity.configuracao.nrOfLevels > 2) {
            const newColors = entity.configuracao.colors.slice(0, -1);
            handleConfigChange('nrOfLevels', entity.configuracao.nrOfLevels - 1);
            handleConfigChange('colors', newColors);
        }
    };

    const handleTestSql = async () => {
        if (!entity.sql?.trim()) {
            alert('Informe a consulta SQL');
            return;
        }
        setTesting(true);
        try {
            const resp = await fetch('/api/relatorios/indicador-gauge/executar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sql: entity.sql }),
            });
            if (resp.ok) {
                const result = await resp.json();
                setTestResult(result);
            } else {
                alert('Erro ao executar SQL');
            }
        } catch (error) {
            console.error('Erro ao testar SQL:', error);
            alert('Erro ao executar SQL. Verifique a sintaxe.');
        } finally {
            setTesting(false);
        }
    };

    const handleSubmit = async () => {
        if (!entity.nome || entity.nome.length < 3) {
            alert('Nome deve ter pelo menos 3 caracteres');
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

        try {
            const payload = {
                nome: entity.nome,
                sql: entity.sql,
                configuracao: entity.configuracao,
                usuarios,
                unidades,
                perfis,
                filtros,
            };

            if (isEditing) {
                await updateIndicador(entity.id!, payload);
                alert('Indicador atualizado com sucesso!');
            } else {
                await saveIndicador(payload);
                alert('Indicador criado com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar indicador:', error);
            alert('Erro ao salvar indicador');
        }
    };

    const addFiltro = async () => {
        if (!filtroNome.trim() || !filtroDimensao) {
            alert('Informe nome e dimensão para o filtro');
            return;
        }
        try {
            const resp = await saveFiltro({
                nome: filtroNome,
                dimensaoId: filtroDimensao.id,
                estruturaId: 0,
            });
            setFiltros([...filtros, resp.data]);
            setFiltroNome('');
            setFiltroDimensao(null);
        } catch (error) {
            console.error('Erro ao adicionar filtro:', error);
            alert('Erro ao adicionar filtro');
        }
    };

    const removeFiltro = async (filtro: any) => {
        try {
            await deleteFiltro(filtro.id);
            setFiltros(filtros.filter(f => f.id !== filtro.id));
        } catch (error) {
            console.error('Erro ao remover filtro:', error);
            alert('Erro ao remover filtro');
        }
    };

    const config = entity.configuracao ?? DEFAULT_CONFIG;

    return (
        <FormLayout
            title={isEditing ? 'Editar Indicador Gauge' : 'Novo Indicador Gauge'}
            tabs={[
                {
                    key: 'definicao',
                    label: 'Definição',
                    fields: [
                        { name: 'nome', label: 'Nome do Indicador *', required: true },
                        {
                            name: 'sql',
                            label: 'Consulta SQL *',
                            type: 'textarea',
                            required: true,
                            rows: 10,
                            help: 'O SQL deve retornar 3 colunas: valor_atual, valor_minimo, valor_maximo',
                        },
                    ],
                    customContent: (
                        <>
                            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ marginBottom: '12px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Testar Consulta SQL</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={handleTestSql}
                                        disabled={testing || !entity.sql?.trim()}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: testing || !entity.sql?.trim() ? '#94a3b8' : '#22c55e',
                                            color: '#fff',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        {testing ? '⏳ Testando...' : '▶ Testar SQL'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEntity(prev => ({ ...prev, sql: EXAMPLE_SQL }))}
                                        style={{
                                            padding: '10px 16px',
                                            backgroundColor: '#f1f5f9',
                                            color: '#334155',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                        }}
                                    >
                                        📋 Usar Exemplo
                                    </button>
                                </div>
                                {testResult && (
                                    <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Resultado do Teste</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Valor Atual</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>{testResult.valorAtual.toLocaleString('pt-BR')}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Valor Mínimo</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>{testResult.valorMinimo.toLocaleString('pt-BR')}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Valor Máximo</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', fontFamily: 'monospace' }}>{testResult.valorMaximo.toLocaleString('pt-BR')}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: '#166534', fontWeight: '600' }}>Percentual</div>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#2563eb', fontFamily: 'monospace' }}>
                                                    {((testResult.valorAtual - testResult.valorMinimo) / (testResult.valorMaximo - testResult.valorMinimo) * 100).toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ),
                },
                {
                    key: 'aparencia',
                    label: 'Aparência',
                    fields: [
                        { name: 'configuracao.nrOfLevels', label: 'Níveis de Cor *', type: 'select', options: NR_OF_LEVELS_OPTIONS, required: true },
                        { name: 'configuracao.arcWidth', label: 'Largura do Arco *', type: 'select', options: ARC_WIDTH_OPTIONS, required: true },
                        { name: 'configuracao.animate', label: 'Animar', type: 'boolean', booleanLabels: { on: 'Sim', off: 'Não' } },
                    ],
                    customContent: (
                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Cores dos Níveis</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {Array.from({ length: config.nrOfLevels }, (_, i) => i).map((levelIndex) => (
                                    <div key={levelIndex} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                            <div
                                                style={{
                                                    width: '44px',
                                                    height: '44px',
                                                    borderRadius: '10px',
                                                    backgroundColor: config.colors[levelIndex] ?? DEFAULT_CONFIG.colors[levelIndex],
                                                    border: '2px solid #e2e8f0',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                            <select
                                                value={config.colors[levelIndex] ?? DEFAULT_CONFIG.colors[levelIndex]}
                                                onChange={(e) => handleColorChange(levelIndex, e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    minWidth: '150px',
                                                    padding: '10px 12px',
                                                    border: '1px solid #cbd5e1',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    backgroundColor: '#fff',
                                                    color: '#1e293b',
                                                }}
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
                                            value={config.colors[levelIndex] ?? DEFAULT_CONFIG.colors[levelIndex]}
                                            onChange={(e) => handleColorChange(levelIndex, e.target.value)}
                                            style={{
                                                width: '50px',
                                                height: '36px',
                                                borderRadius: '8px',
                                                border: '1px solid #cbd5e1',
                                                cursor: 'pointer',
                                            }}
                                            title="Escolher cor personalizada"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                                <button
                                    type="button"
                                    onClick={addNivel}
                                    disabled={config.nrOfLevels >= 5}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: config.nrOfLevels >= 5 ? '#f1f5f9' : '#3b82f6',
                                        color: config.nrOfLevels >= 5 ? '#94a3b8' : '#fff',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        border: 'none',
                                    }}
                                >
                                    ➕ Adicionar Nível
                                </button>
                                <button
                                    type="button"
                                    onClick={removeNivel}
                                    disabled={config.nrOfLevels <= 2}
                                    style={{
                                        padding: '10px 16px',
                                        backgroundColor: config.nrOfLevels <= 2 ? '#f1f5f9' : '#ef4444',
                                        color: config.nrOfLevels <= 2 ? '#94a3b8' : '#fff',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        border: 'none',
                                    }}
                                >
                                    ➖ Remover Nível
                                </button>
                            </div>
                        </div>
                    ),
                },
                {
                    key: 'cores-avancadas',
                    label: 'Cores Avançadas',
                    fields: [
                        { name: 'configuracao.textColor', label: 'Cor do Texto', type: 'color' },
                        { name: 'configuracao.needleColor', label: 'Cor do Ponteiro', type: 'color' },
                        { name: 'configuracao.needleBaseColor', label: 'Cor da Base do Ponteiro', type: 'color' },
                    ],
                },
                {
                    key: 'permissao',
                    label: 'Permissão',
                    fields: [],
                    customContent: (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Usuários</h4>
                                <MasterDetail
                                    label="Usuário"
                                    source={API_PATHS.view.usuario}
                                    valueKey="id"
                                    searchKeys={['login', 'nome']}
                                    columns={[{ key: 'login', label: 'Login' }, { key: 'nome', label: 'Nome' }]}
                                    items={usuarios}
                                    onChange={setUsuarios}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Unidades</h4>
                                <MasterDetail
                                    label="Unidade"
                                    source={API_PATHS.view.unidade}
                                    valueKey="id"
                                    searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                                    columns={[{ key: 'sucinto', label: 'Sucinto' }, { key: 'nomeFantasia', label: 'Nome Fantasia' }]}
                                    items={unidades}
                                    onChange={setUnidades}
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '12px' }}>Perfis</h4>
                                <MasterDetail
                                    label="Perfil"
                                    source={API_PATHS.basico.perfil}
                                    valueKey="id"
                                    searchKeys={['descricao']}
                                    columns={[{ key: 'descricao', label: 'Descrição' }]}
                                    items={perfis}
                                    onChange={setPerfis}
                                />
                            </div>
                        </>
                    ),
                },
                {
                    key: 'filtros',
                    label: 'Filtros',
                    fields: [
                        { name: 'nome', label: 'Nome *', required: true },
                        { name: 'dimensaoId', label: 'Dimensão', type: 'autoComplete', autoCompleteSource: '/api/relatorios/dimensao', autoCompleteSearchKeys: ['nomeVisualizacao', 'nome'], autoCompleteColumns: [{ key: 'id', label: 'ID' }, { key: 'nomeVisualizacao', label: 'Nome Visualização' }] },
                    ],
                    customContent: (
                        <>
                            <DataTable
                                data={filtros}
                                columns={[
                                    { key: 'id', label: 'ID' },
                                    { key: 'nome', label: 'Nome' },
                                    { key: 'estruturaNome', label: 'Estrutura' },
                                    { key: 'dimensaoNome', label: 'Dimensão' },
                                ]}
                                actions={[
                                    { key: 'remove', label: 'Remover', icon: 'trash', className: 'btnred', onClick: removeFiltro },
                                ]}
                            />
                        </>
                    ),
                    nextLabel: 'Concluir',
                },
            ]}
            initialValues={entity}
            onSubmit={handleSubmit}
            onCancel={() => console.log('Cancelar')}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}