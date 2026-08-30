import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

export function Pagination({
  currentPage = 1,
  totalPages = 12,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  // Gera os números de página a exibir (ex: 1, 2, 3, 4 ou uma janela dinâmica baseada na página atual)
  let pages: number[] = [];
  if (totalPages <= 5) {
    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    if (currentPage <= 3) {
      pages = [1, 2, 3, 4];
    } else if (currentPage >= totalPages - 2) {
      pages = [totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
    }
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white text-xs border-t border-slate-100 font-sans text-slate-600 w-full">
      
      {/* Lado Esquerdo: Seletor de Itens */}
      <div className="flex items-center gap-2">
        <span className="text-slate-500 font-medium">Mostrando</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
          className="border border-slate-200 rounded px-2 py-1 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-slate-500 font-medium">por página</span>
      </div>

      {/* Lado Direito: Botão Anterior, Números, Próxima e Total de Páginas */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} /> Anterior
          </button>

          {/* Números das Páginas */}
          <div className="flex items-center gap-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`w-7 h-7 flex items-center justify-center rounded-lg border font-semibold transition ${
                  currentPage === page
                    ? 'border-slate-900 bg-white text-slate-900 shadow-xs'
                    : 'border-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-1 text-slate-400">...</span>
            )}
          </div>

          <button
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Próxima <ChevronRight size={14} />
          </button>
        </div>

        <span className="text-slate-500 font-medium border-l border-slate-200 pl-3">
          Total de páginas: {totalPages}
        </span>
      </div>

    </div>
  );
}
