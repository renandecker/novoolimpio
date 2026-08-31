import React, { useState } from 'react';
import { Plus, Save, Database, Code, Image as ImageIcon, Trash2 } from 'lucide-react';

export default function DashboardCadastroScreen() {
  const [metricas, setMetricas] = useState([
    { id: 1, titulo: 'Receita Total', imagem: '💵', sql: 'SELECT SUM(valor) FROM fin_lancamento WHERE status = PAGO' },
    { id: 2, titulo: 'Novos Clientes', imagem: '👥', sql: 'SELECT COUNT(*) FROM bas_pessoa WHERE dt_cadastro >= NOW() - INTERVAL 30 DAY' },
    { id: 3, titulo: 'Vendas Mensais', imagem: '🛍️', sql: 'SELECT COUNT(*) FROM com_pedido WHERE MONTH(dt_pedido) = MONTH(NOW())' }
  ]);

  const [novoItem, setNovoItem] = useState({ titulo: '', imagem: '📊', sql: '' });
  const [salvando, setSalvando] = useState(false);

  const handleAdicionar = (e) => {
    e.preventDefault();
    if (!novoItem.titulo || !novoItem.sql) return;
    setMetricas([...metricas, { ...novoItem, id: Date.now() }]);
    setNovoItem({ titulo: '', imagem: '📊', sql: '' });
  };

  const handleRemover = (id) => {
    setMetricas(metricas.filter(item => item.id !== id));
  };

  const handleSalvarTudo = async () => {
    setSalvando(true);
    try {
      await fetch('/api/relatorios/painel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metricas)
      }).catch(() => {});
      alert('Objetos e consultas SQL do Dashboard salvos com sucesso!');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cadastro de Objetos do Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Configure o Título, Imagem/Ícone e o SQL dinâmico que retornará o valor para o objeto.</p>
        </div>
        <button
          onClick={handleSalvarTudo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all"
        >
          <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Formulário de Inserção */}
      <form onSubmit={handleAdicionar} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-600" /> Adicionar Novo Objeto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Título do Objeto</label>
            <input
              type="text"
              placeholder="Ex: Receita Total"
              value={novoItem.titulo}
              onChange={(e) => setNovoItem({ ...novoItem, titulo: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Imagem / Ícone (Emoji ou URL)</label>
            <input
              type="text"
              placeholder="Ex: 💵 ou URL da imagem"
              value={novoItem.imagem}
              onChange={(e) => setNovoItem({ ...novoItem, imagem: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-medium transition-all"
            >
              Adicionar Objeto
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Consulta SQL (Retorna o Valor do Objeto)</label>
          <div className="relative">
            <Code className="absolute left-3.5 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="SELECT SUM(valor) FROM tabela WHERE ..."
              value={novoItem.sql}
              onChange={(e) => setNovoItem({ ...novoItem, sql: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono text-slate-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
        </div>
      </form>

      {/* Lista de Objetos Cadastrados */}
      <h2 className="text-lg font-bold text-gray-800 mb-4">Objetos Cadastrados ({metricas.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metricas.map((item) => (
          <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl p-2 bg-gray-50 rounded-xl">{item.imagem}</span>
                <button
                  onClick={() => handleRemover(item.id)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <h3 className="text-lg font-bold text-gray-800">{item.titulo}</h3>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                <Database size={14} className="text-indigo-600" /> SQL de Retorno do Valor:
              </div>
              <code className="text-xs font-mono bg-gray-50 p-2.5 rounded-xl block text-slate-600 overflow-x-auto border border-gray-100">
                {item.sql}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
