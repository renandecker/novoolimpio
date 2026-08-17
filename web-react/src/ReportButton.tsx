import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listarRelatoriosDisponiveis, type RelatorioDisponivel } from './relatorios';

const ReportIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
);

export function ReportButton() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const list = useQuery({
    queryKey: ['relatorios', 'disponiveis'],
    queryFn: listarRelatoriosDisponiveis,
    enabled: open,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const items = list.data ?? [];

  const handleItemClick = (item: RelatorioDisponivel) => {
    setOpen(false);
    navigate(`/relatorios/${item.tipo.toLowerCase()}/${item.id}`);
  };

  return (
    <div className="report-container" ref={containerRef}>
      <button
        type="button"
        className="app-header-bell"
        title="Relatórios"
        aria-label="Relatórios"
        onClick={() => setOpen(!open)}
      >
        <ReportIcon />
      </button>

      {open && (
        <div className="report-dropdown">
          <div className="bell-dropdown-header">
            <span>Relatórios</span>
          </div>
          <div className="bell-dropdown-list">
            {list.isLoading && items.length === 0 ? (
              <p className="bell-empty">Carregando...</p>
            ) : items.length === 0 ? (
              <p className="bell-empty">Nenhum relatório disponível.</p>
            ) : (
              items.map((item) => (
                <button
                  key={`${item.tipo}-${item.id}`}
                  type="button"
                  className="report-item"
                  onClick={() => handleItemClick(item)}
                >
                  <span className="report-item-tipo">{item.tipo}</span>
                  <span className="report-item-nome">{item.nome}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
