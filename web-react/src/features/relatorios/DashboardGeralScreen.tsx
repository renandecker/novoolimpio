import React, { useState, useEffect } from 'react';
import Sidebar from '../../shared/components/Sidebar';
import { Header } from '../../components/Header.jsx';
import { StatCard } from '../../components/StatCard';
import { SalesChart } from '../../components/SalesChart';
import { RecentSalesTable } from '../../components/RecentSalesTable';
import { DollarSign, Users, ShoppingBag, RefreshCw } from 'lucide-react';

export default function DashboardGeralScreen() {
  const [data, setData] = useState({
    receita: '45.200',
    receitaTrend: '45,20%',
    novosClientes: '+1.230',
    clientesTrend: '+1.230',
    vendas: '340',
    vendasTrend: '-0,05%',
    usuarios: 1230
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/relatorios/painel').catch(() => null);
      if (response && response.ok) {
        const ct = response.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await response.text();
          throw new Error(`API retornou HTML em vez de JSON (proxy /api nao configurado?). Inicio: ${text.slice(0, 80).replace(/\s+/g, ' ')}`);
        }
        const result = await response.json();
        if (result && result.length > 0) {
          setData(result[0]);
        }
      } else if (response && !response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50/50 w-full">
      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-8 flex-1">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
              <p className="text-sm text-gray-500 mt-1">Acompanhe as métricas principais do seu negócio em tempo real.</p>
            </div>
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl border border-red-200 text-sm">
              Erro ao sincronizar com API: {error}. Exibindo dados locais de contingência.
            </div>
          )}

          {/* Grid de Cards Métricos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Receita" 
              value={`R$ ${data?.receita || '45.200'}`} 
              icon={DollarSign} 
              trend={data?.receitaTrend || '45,20%'}
              positive={true}
            />
            <StatCard 
              title="Novos Clientes" 
              value={data?.novosClientes || '+1.230'} 
              icon={Users} 
              trend={data?.clientesTrend || '+1.230'}
              positive={true}
            />
            <StatCard 
              title="Vendas Mensais" 
              value={data?.vendas || '340'} 
              icon={ShoppingBag} 
              trend={data?.vendasTrend || '-0,05%'}
              positive={false}
            />
          </div>

          {/* Seção de Gráficos e Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesChart />
            <RecentSalesTable />
          </div>
        </main>
      </div>
    </div>
  );
}
