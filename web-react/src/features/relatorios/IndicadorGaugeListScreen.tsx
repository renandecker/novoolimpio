import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BarChart2 } from 'lucide-react';
import { DataTable, type DataTableColumn } from '../../shared/components/DataTable';
import { PermissionGate } from '../../shared/services/permissions';
import { listarIndicadoresGauge, excluirIndicadorGauge, type IndicadorGauge } from './indicadorGauge';
import type { PagedResponse } from '../../shared/types/types';
import { swalConfirm } from '../../shared/components/swal';

const COLORS_PREVIEW = [
  '#22c55e', '#eab308', '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#14b8a6',
];

function formatDate(value: unknown): string {
  if (!value) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : String(value);
}

function renderColors(colors: string[]): React.ReactNode {
  if (!colors || !colors.length) return '-';
  return (
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
      {colors.slice(0, 5).map((color, i) => (
        <div
          key={i}
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            backgroundColor: color,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}
          title={color}
        />
      ))}
      {colors.length > 5 && (
        <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center', marginLeft: '4px' }}>
          +{colors.length - 5}
        </span>
      )}
    </div>
  );
}

const COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome', minWidth: 200 },
  {
    key: 'configuracao',
    label: 'Cores',
    render: (item) => renderColors((item as any).configuracao?.colors ?? []),
    minWidth: 150,
  },
  {
    key: 'configuracao',
    label: 'Níveis',
    render: (item) => (item as any).configuracao?.nrOfLevels ?? '-',
    minWidth: 80,
  },
  {
    key: 'configuracao',
    label: 'Largura Arco',
    render: (item) => (item as any).configuracao?.arcWidth ?? '-',
    minWidth: 100,
  },
  {
    key: 'createdAt',
    label: 'Criado em',
    render: (item) => formatDate((item as any).createdAt),
    minWidth: 130,
  },
  {
    key: 'updatedAt',
    label: 'Atualizado em',
    render: (item) => formatDate((item as any).updatedAt),
    minWidth: 130,
  },
];

export default function IndicadorGaugeListScreen() {
  const [busca, setBusca] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<PagedResponse<IndicadorGauge> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await listarIndicadoresGauge(page, 10, busca);
      setData(result);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
      setData({ content: [], totalElements: 0, totalPages: 0, page: 0, size: 10 });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [page, busca]);

  const handleDelete = async (id: number) => {
    if (!(await swalConfirm('Tem certeza que deseja excluir este indicador?', {title: 'Excluir indicador', confirmText: 'Excluir', danger: true}))) return;
    setDeletingId(id);
    try {
      await excluirIndicadorGauge(id);
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      alert('Erro ao excluir indicador');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PermissionGate permission="READ">
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <BarChart2 className="text-blue-600" size={24} />
              Indicadores Gauge
            </h1>
            <p className="text-sm text-gray-500 mt-1">Gerencie indicadores do tipo gauge (velocímetro) com consulta SQL</p>
          </div>
          <a
            href="/view/relatorios/formIndicadorGauge"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all self-start"
          >
            <Plus size={18} /> Novo Indicador
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPage(0); }}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">Carregando...</div>
          ) : data?.content.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <BarChart2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium">Nenhum indicador encontrado</p>
              <p className="text-sm mt-1">{busca ? 'Tente alterar a busca' : 'Clique em "Novo Indicador" para criar o primeiro'}</p>
            </div>
          ) : (
            <>
              <DataTable
                data={data.content}
                columns={COLUMNS}
                keyField="id"
                actions={[
                  {
                    key: 'view',
                    label: 'Visualizar',
                    icon: BarChart2,
                    onClick: (item) => window.open(`/view/relatorios/formIndicadorGauge/${item.id}`, '_blank'),
                    className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
                  },
                  {
                    key: 'edit',
                    label: 'Editar',
                    icon: Edit,
                    onClick: (item) => window.location.href = `/view/relatorios/formIndicadorGauge/${item.id}`,
                    className: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                  },
                  {
                    key: 'delete',
                    label: 'Excluir',
                    icon: Trash2,
                    onClick: (item) => handleDelete(item.id),
                    className: 'bg-red-100 text-red-700 hover:bg-red-200',
                    disabled: deletingId === item.id,
                  },
                ]}
                emptyMessage="Nenhum indicador cadastrado"
              />
              
              {data.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Página {page + 1} de {data.totalPages} • Total: {data.totalElements}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(data.totalPages - 1, p + 1))}
                      disabled={page >= data.totalPages - 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Próxima
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}