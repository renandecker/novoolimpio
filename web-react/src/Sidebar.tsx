import { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from './auth';
import './Sidebar.css';

type Modulo = { id: number; antecessorId: number | null; rotulo: string; descricao: string; icone: string; ajuda: string; outcome: string; ordem: number };

const normalizeName = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const normalizeOutcome = (outcome: string) => outcome.replace(/(\.xhtml)+$/i, '').replace(/\/$/, '') || '/default';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
);

const ICON_RULES: Array<[RegExp, string]> = [
  [/^paginainicial$/, '🏠'],
  [/^callcenter$/, '☎️'],
  [/^centraldeservico$/, '🛎️'],
  [/favorito/, '⭐'],
  [/senha/, '🔑'],
  [/impressora|digitalizacao|imprimir/, '🖨️'],
  [/mensagem|comunicacao/, '✉️'],
  [/^ligacao$/, '🎧'],
  [/^resultado.*ligacao/, '📊'],
  [/telefone/, '📞'],
  [/^tipodocanal$/, '📡'],
  [/campanha|marketing/, '📣'],
  [/^bairro$/, '🏘️'],
  [/^logradouro$/, '🛣️'],
  [/^mapa|^regiao$|gestaodelocais/, '🗺️'],
  [/^pais$|^estado$|^cidade$/, '🏙️'],
  [/unidade/, '🏢'],
  [/etnia|^genero$|^estadocivil$/, '🌍'],
  [/professor/, '👨‍🏫'],
  [/turma/, '🏫'],
  [/sala/, '🚪'],
  [/^periodo$|gestaodeperiodo/, '🗓️'],
  [/^horario$|^turno|^tempoaula$|^tipodepausa$/, '⏰'],
  [/agenda|^calendario|compromisso|^feriado$/, '📅'],
  [/^matricula$|^rematricula$|gestaodematricula|^escolaridade$|gestaodealuno/, '🎓'],
  [/oferecimentodeacao|prospecto/, '🎯'],
  [/^curso$|^tipodecurso$|gestaodecurso|^oferecimento|curricul|componentecurricular|^tipodematrizcurricular$|^grupocomponente|^grupodooferecimento$/, '🎓'],
  [/^pessoa$|^pessoafisica$|^usuario$|^perfil$|^coordenador$|^consultor$|^fornecedor$|^desistente$|^cpfalunosantigos$|^minhaconta$|^dados/, '👤'],
  [/pessoa/, '👥'],
  [/^caixa$|fluxodecaixa|gerenciafluxocaixa|configuracaocaixa/, '💵'],
  [/^contacorrente$|^contagestaocontas$/, '🏦'],
  [/pagamento|^parcela|^bandeira$|^valorproduto$|^diaspara/, '💳'],
  [/cobranca|^financeiro$|^gestaovendas$|^movimentofinanceiro$/, '💰'],
  [/^estoque$|^produto|^pacote$|^marca$|^entrega$|controleestoque/, '📦'],
  [/^reservalivros$/, '🔖'],
  [/^devolucaolivros$/, '↩️'],
  [/livro|^biblioteca$|referencia/, '📚'],
  [/^grafico$|^indicador$|^estrategia$/, '📈'],
  [/^tabelas$/, '📋'],
  [/^filtros$/, '🔍'],
  [/^meta/, '🎯'],
  [/^dashboard$|^estruturarelatorio$|^extrator$|^organograma$|^tiposrelatorios$|^gerirnaps|^relatorio/, '📊'],
  [/^auditoria|^historico$/, '📜'],
  [/^documento|contrato|^arquivoprocon$/, '📄'],
  [/^modulo$|^estruturadosistema$|^paineis/, '🧩'],
  [/^gestaoconstrucao$|^configurac|^gestao$|^administrac/, '⚙️'],
  [/^basico$/, '📋'],
  [/^comercial$/, '🛒'],
  [/^academico$/, '🎓'],
  [/^aluno$/, '🎓'],
  [/^acao$|^tipodaacao$/, '🎯'],
  [/^nap$|atendimento|negociacao/, '🤝'],
  [/^centralnap$/, '📝'],
  [/^categoria|^subcategoria|^grupo$/, '🗂️'],
  [/^movimentacao/, '🔄'],
  [/^campo$/, '🧩'],
  [/^etapas/, '📋'],
  [/^resultado|^status|^crit|^grau$|^requisito|^motivo$/, '✅'],
  [/^saidas$/, '💸'],
  [/^custoporservico$/, '💲'],
  [/^avaliacao|^atividade$/, '📝'],
];

function menuIcon(rotulo: string, icone?: string): string {
  const stored = (icone ?? '').trim();
  if (stored && !stored.startsWith('ui-icon') && !stored.startsWith('fa ')) return stored;
  const name = normalizeName(rotulo);
  for (const [rule, emoji] of ICON_RULES) if (rule.test(name)) return emoji;
  return '📁';
}

export default function Sidebar() {
  const { session } = useAuth();
  const modulos = (session?.modules ?? []) as Modulo[];
  const defaultPath = session?.defaultOutcome || '/default';
  const [portalOpen, setPortalOpen] = useState(true);
  const [search, setSearch] = useState('');

  const childrenByParent = useMemo(() => {
    const map = new Map<number, Modulo[]>();
    for (const m of modulos) {
      if (m.antecessorId != null) {
        const list = map.get(m.antecessorId) ?? [];
        list.push(m);
        map.set(m.antecessorId, list);
      }
    }
    for (const list of map.values()) list.sort((a, b) => a.ordem - b.ordem);
    return map;
  }, [modulos]);

  const topModulos = modulos.filter(m => m.antecessorId == null).sort((a, b) => a.ordem - b.ordem);

  const flatItems = useMemo(() => {
    const items: { label: string; parent: string | null; path: string; icon: string; keywords: string }[] = [
      { label: 'Início', parent: null, path: defaultPath, icon: '🏠', keywords: 'inicio paginainicial' },
    ];
    if (modulos.length === 0) {
      items.push(
        { label: 'Dashboard', parent: 'Portal do Aluno', path: '/aluno/dashboard', icon: '📊', keywords: 'portal aluno dashboard' },
        { label: 'Boletim', parent: 'Portal do Aluno', path: '/aluno/boletim', icon: '📄', keywords: 'portal aluno boletim notas' },
        { label: 'Frequência', parent: 'Portal do Aluno', path: '/aluno/frequencia', icon: '📅', keywords: 'portal aluno frequencia' },
        { label: 'Financeiro', parent: 'Portal do Aluno', path: '/aluno/financeiro', icon: '💰', keywords: 'portal aluno financeiro parcelas' },
      );
    }
    const walk = (modulo: Modulo, parent: string | null) => {
      items.push({
        label: modulo.rotulo,
        parent,
        path: normalizeOutcome(modulo.outcome),
        icon: menuIcon(modulo.rotulo, modulo.icone),
        keywords: `${modulo.rotulo} ${modulo.descricao} ${modulo.outcome}`,
      });
      for (const child of childrenByParent.get(modulo.id) ?? []) walk(child, modulo.rotulo);
    };
    for (const m of topModulos) walk(m, null);
    return items;
  }, [modulos, childrenByParent, topModulos, defaultPath]);

  const query = search.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!query) return null;
    const tokens = query.split(/\s+/);
    return flatItems.filter(item => {
      const haystack = `${item.label} ${item.parent ?? ''} ${item.keywords}`.toLowerCase();
      return tokens.every(t => haystack.includes(t));
    });
  }, [query, flatItems]);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">O</span>
        <span className="sidebar-title">Olímpio</span>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-search">
          <span className="sidebar-search-icon"><SearchIcon /></span>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Buscar menu ou tela..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Buscar menu ou tela"
          />
          {search && (
            <button type="button" className="sidebar-search-clear" onClick={() => setSearch('')} aria-label="Limpar busca">
              ×
            </button>
          )}
        </div>
        {searchResults ? (
          searchResults.length === 0 ? (
            <div className="sidebar-search-empty">Nenhum item encontrado</div>
          ) : (
            searchResults.map((item, index) => (
              <Link
                key={`${item.path}-${item.label}-${index}`}
                className="sidebar-item sidebar-search-result"
                to={item.path || '#'}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">
                  {item.parent && <span className="sidebar-search-parent">{item.parent} › </span>}
                  {item.label}
                </span>
              </Link>
            ))
          )
        ) : (
          <>
            <Link className="sidebar-item" to={defaultPath}>
              <span className="sidebar-icon">🏠</span>
              <span className="sidebar-label">Início</span>
            </Link>
            {modulos.length === 0 && (
              <div className="sidebar-group">
                <button className="sidebar-item sidebar-group-header" onClick={() => setPortalOpen(prev => !prev)}>
                  <span className="sidebar-icon">🎓</span>
                  <span className="sidebar-label">Portal do Aluno</span>
                  <span className="sidebar-arrow">{portalOpen ? '▾' : '▸'}</span>
                </button>
                {portalOpen && (
                  <div className="sidebar-submenu">
                    <Link className="sidebar-item sidebar-subitem" to="/aluno/dashboard"><span className="sidebar-icon">📊</span><span className="sidebar-label">Dashboard</span></Link>
                    <Link className="sidebar-item sidebar-subitem" to="/aluno/boletim"><span className="sidebar-icon">📄</span><span className="sidebar-label">Boletim</span></Link>
                    <Link className="sidebar-item sidebar-subitem" to="/aluno/frequencia"><span className="sidebar-icon">📅</span><span className="sidebar-label">Frequência</span></Link>
                  </div>
                )}
              </div>
            )}
            {topModulos.map(modulo => (
              <SidebarItem key={modulo.id} modulo={modulo} childrenByParent={childrenByParent} depth={0} />
            ))}
          </>
        )}
      </nav>
    </aside>
  );
}

function SidebarItem({ modulo, childrenByParent, depth }: { modulo: Modulo; childrenByParent: Map<number, Modulo[]>; depth: number }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const children = childrenByParent.get(modulo.id) ?? [];
  const isGroup = children.length > 0;
  const isSub = depth > 0;
  const outcome = normalizeOutcome(modulo.outcome);
  const active = Boolean(outcome) && location.pathname.includes(outcome);

  if (!isGroup) {
    return (
      <Link
        className={`sidebar-item ${isSub ? 'sidebar-subitem' : ''} ${active ? 'active' : ''}`}
        to={outcome || '#'}
      >
        <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
        <span className="sidebar-label">{modulo.rotulo}</span>
      </Link>
    );
  }

  return (
    <div className="sidebar-group">
      <button className={`sidebar-item sidebar-group-header ${isSub ? 'sidebar-subitem' : ''}`} onClick={() => setOpen(prev => !prev)}>
        <span className="sidebar-icon">{menuIcon(modulo.rotulo, modulo.icone)}</span>
        <span className="sidebar-label">{modulo.rotulo}</span>
        <span className="sidebar-arrow">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="sidebar-submenu">
          {children.map(child => (
            <SidebarItem key={child.id} modulo={child} childrenByParent={childrenByParent} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}