import {useCallback, useMemo} from 'react';
import {useMenuIcon} from './hooks/useIcones';

const normalizeName = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '');

const FALLBACK_ICON_RULES: Array<[RegExp, string]> = [
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

function fallbackIcon(rotulo: string): string {
    const name = normalizeName(rotulo);
    for (const [rule, emoji] of FALLBACK_ICON_RULES) if (rule.test(name)) return emoji;
    return '📁';
}

export function moduleIcon(rotulo: string, icone?: string): string {
    const stored = (icone ?? '').trim();
    if (stored && !stored.startsWith('ui-icon') && !stored.startsWith('fa ')) return stored;
    const name = normalizeName(rotulo);
    for (const [rule, emoji] of FALLBACK_ICON_RULES) if (rule.test(name)) return emoji;
    return '📁';
}

export function useModuleIcon() {
    const {menuIcon} = useMenuIcon();
    
    const getIcon = useCallback((rotulo: string, icone?: string): string => {
        return menuIcon(rotulo, icone);
    }, [menuIcon]);
    
    return {getIcon};
}