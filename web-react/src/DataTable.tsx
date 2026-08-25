import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import type {ApiItem} from './types';
import {api} from './api';
import {useModulePaged} from './useModulePaged';
import {executeAction, type Action} from './actions';
import {usePermissions, useCurrentOutcome} from './permissions';
import {BooleanField} from './BooleanField';
import {Base64FileUpload} from './Base64FileUpload';
import {PerfilModuloPermissions} from './useModulePaged';

export const PAGE_SIZES = [10, 20, 50, 100];

export const MAX_MAIN_COLUMNS = 6;

const FILE_KEY_RE = /foto|imagem|logo|assinatura|anexo|arquivo|_base64/i;

export interface DataTableColumnOption {
    value: string;
    label: string;
}

export interface DataTableColumn {
    key: string;
    label: string;
    options?: DataTableColumnOption[];
    render?: (item: ApiItem) => ReactNode;
}

export interface ComboSource {
    path: string;
    valueKey?: string;
    labelKey?: string;
}

export interface DataTableRowAction {
    key: string;
    title: string;
    className?: string;
    icon?: ReactNode;
    /** Permissão necessária para exibir a ação; quando omitida, sempre exibe. */
    permission?: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'EXECUTE';
    onClick: (item: ApiItem) => void | Promise<void>;
}

interface DataTableProps {
    path: string;
    columns?: DataTableColumn[];
    params?: Record<string, unknown>;
    module?: string;
    outcome?: string;
    combos?: Record<string, ComboSource>;
    colorColumns?: string[];
    maxMainColumns?: number;
    preview?: (values: Record<string, unknown>) => ReactNode;
    hideCreate?: boolean;
    /** Rota do formulário para navegar ao clicar em Editar (fluxo legado lista -> formulário). */
    editNavigateTo?: string;
    /** Rota do formulário para navegar ao clicar em Novo. */
    createNavigateTo?: string;
    /** Ações extras por linha (ex.: Atualizar/Troca do listLogradouro.xhtml). */
    extraRowActions?: DataTableRowAction[];
}

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const fkBase = (key: string): string | null => (key.startsWith('id_') ? key.slice(3) : null);

const fkDescription = (item: ApiItem, key: string): string | null => {
    const base = fkBase(key);
    if (!base) return null;
    const value = asRecord(item)[`${base}_descricao`];
    return value === null || value === undefined ? null : String(value);
};

const renderValue = (item: ApiItem, key: string): ReactNode => {
    const description = fkDescription(item, key);
    if (description !== null) return description;
    const value = asRecord(item)[key];
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const isHexColor = (value: unknown): value is string =>
    typeof value === 'string' && HEX_RE.test(value.trim());

const LEGACY_CLASS_RE = /^(legenda-[a-z]+|evento-[a-z]+|timeline[a-z]+|status[A-Z_]+)$/;

const STATUS_TOKENS = new Set([
    'CONCLUIDA',
    'PENDENTE',
    'LOTADA',
    'CANCELADA',
    'LIBERADA',
    'EM_ANDAMENTO',
    'INICIANDO',
    'FINALIZADA',
]);

export const legacyClassName = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    if (LEGACY_CLASS_RE.test(v)) return v;
    if (STATUS_TOKENS.has(v)) return `status${v}`;
    return null;
};

const readableOn = (hex: string): string => {
    const h = hex.trim().replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1a1a1a' : '#ffffff';
};

function ColorCell({value}: { value: unknown }) {
    if (!isHexColor(value)) return <span>{String(value ?? '')}</span>;
    const color = value.trim();
    return (
        <span
            className="color-cell"
            style={{backgroundColor: color, color: readableOn(color)}}
            title={color}
        >
      {color}
    </span>
    );
}

const renderCell = (item: ApiItem, column: DataTableColumn, colorColumns: Set<string>): ReactNode => {
    if (column.render) return column.render(item);
    if (colorColumns.has(column.key)) return <ColorCell value={asRecord(item)[column.key]}/>;
    const className = legacyClassName(asRecord(item)[column.key]);
    if (className) return <span className={className}>{renderValue(item, column.key)}</span>;
    return renderValue(item, column.key);
};

const descriptionSiblings = (item: ApiItem): Set<string> => {
    const record = asRecord(item);
    const siblings = new Set<string>();
    for (const key of Object.keys(record)) {
        const base = fkBase(key);
        if (base && record[`${base}_descricao`] !== undefined) siblings.add(`${base}_descricao`);
    }
    return siblings;
};

const deriveColumns = (item: ApiItem) => {
    const record = asRecord(item);
    const consumed = descriptionSiblings(item);
    return Object.keys(record)
        .filter((key) => key !== 'id' && key !== 'dadosJson' && !consumed.has(key))
        .map((key) => {
            const base = fkBase(key);
            const hasDescription = Boolean(base && record[`${base}_descricao`] !== undefined);
            return {key, label: hasDescription ? toTitle(base) : toTitle(key)};
        });
};

const editableColumns = (item: ApiItem | null, fallback: DataTableColumn[]) => {
    if (!item) return fallback;
    const byKey = new Map(fallback.map((column) => [column.key, column]));
    return Object.keys(asRecord(item))
        .filter((key) => key !== 'id' && key !== 'dadosJson' && !key.endsWith('_descricao'))
        .map((key) => {
            const existing = byKey.get(key);
            if (existing && existing.options) return existing;
            return {key, label: toTitle(key)};
        });
};

type ModalState =
    | { mode: 'create' }
    | { mode: 'edit'; item: ApiItem; cols: DataTableColumn[] }
    | { mode: 'delete'; item: ApiItem }
    | null;

export function DataTable({path, columns, params, module = 'basico', outcome, combos, colorColumns, maxMainColumns, preview, hideCreate = false, editNavigateTo, createNavigateTo, extraRowActions}: DataTableProps) {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [modal, setModal] = useState<ModalState>(null);
    const [executing, setExecuting] = useState<Action | null>(null);
    const [notice, setNotice] = useState<string>('');
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const colorColumnSet = new Set(colorColumns ?? []);
    const {can} = usePermissions();
    const routeOutcome = useCurrentOutcome();
    const screenOutcome = outcome ?? routeOutcome;

    const q = useModulePaged(path, page, size, params);
    const items = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);

    const cols: DataTableColumn[] =
        columns && columns.length > 0
            ? columns
            : items.length > 0
                ? deriveColumns(items[0])
                : [];

    const mainLimit = maxMainColumns ?? MAX_MAIN_COLUMNS;
    const mainCols = cols.slice(0, mainLimit);
    const subCols = cols.slice(mainLimit);
    const expandable = subCols.length > 0;

    // Fetch perfil module permissions from bas_perfil_modulo
    const [perfilModuloPermissions, setPerfilModuloPermissions] = useState<PerfilModuloPermissions | null>(null);
    const [perfilModuloLoading, setPerfilModuloLoading] = useState(false);

    useEffect(() => {
        const carregarPermissoes = async () => {
            setPerfilModuloLoading(true);
            try {
                const response = await api.get<PerfilModuloPermissions>(`/api/permissao/permissoes?caminho=${path}`);
                setPerfilModuloPermissions(response.data);
            } catch (error) {
                console.error('Erro ao carregar permissões do perfil-modulo:', error);
            } finally {
                setPerfilModuloLoading(false);
            }
        };
        carregarPermissoes();
    }, [path]);

    const canCreate = !hideCreate && (can('CREATE', screenOutcome) || (perfilModuloPermissions?.novo ?? false));
    const canUpdate = can('UPDATE', screenOutcome) || (perfilModuloPermissions?.editar ?? false);
    const canDelete = can('DELETE', screenOutcome) || (perfilModuloPermissions?.remover ?? false);
    const canRelatorio = can('EXECUTE', screenOutcome) || (perfilModuloPermissions?.relatorio ?? false);

    const feature = path.split('/').filter(Boolean)[2] ?? '';
    const resource = path.split('/').filter(Boolean)[3] ?? '';
    const entityTitle = toTitle(resource.replace(/^(form|list|colunas)/i, '') || resource);


    const runAction = (action: Action, item: ApiItem) => {
        setExecuting(action);
        setNotice('');
        executeAction(feature, action, JSON.stringify({id: item.id}), module, screenOutcome)
            .then(() => {
                setNotice(`Ação "${toTitle(action)}" executada no registro ${item.id}.`);
                q.refetch();
            })
            .catch((error) => setNotice(`Falha ao executar "${toTitle(action)}": ${apiErrorMessage(error)}`))
            .finally(() => setExecuting(null));
    };

const actionColumns: Array<{ key: string; label: string; render: (item: ApiItem) => ReactNode }> = [];
    if (canRelatorio) {
        actionColumns.push({
            key: 'ver',
            label: 'Ver',
            render: (item) => (
                <button
                    className="btn-action btnyellow"
                    title="Ver"
                    onClick={() => setViewModalItem(item)}
                >
                    <i className="fa fa-info-circle"/>
                </button>
            ),
        });
    }
  if (canUpdate) {
        actionColumns.push({
            key: 'editar',
            label: 'Editar',
            render: (item) => (
                <button
                    className="btn-action btngreen"
                    title="Editar"
                    onClick={() => editNavigateTo
                        ? navigate(`${editNavigateTo}?id=${item.id}`)
                        : setModal({mode: 'edit', item, cols: editableColumns(item, cols)})}
                >
                    ✎
                </button>
            ),
        });
    }
    for (const extra of extraRowActions ?? []) {
        if (extra.permission && !can(extra.permission, screenOutcome)) continue;
        actionColumns.push({
            key: extra.key,
            label: extra.title,
            render: (item) => (
                <button
                    type="button"
                    className={`btn-action ${extra.className ?? 'btnstop'}`}
                    title={extra.title}
                    onClick={async () => {
                        await extra.onClick(item);
                        q.refetch();
                    }}
                >
                    {extra.icon ?? '⚙'}
                </button>
            ),
        });
    }
    if (canDelete) {
        actionColumns.push({
            key: 'excluir',
            label: 'Excluir',
            render: (item) => (
                <button
                    className="btn-action btn-danger"
                    title="Excluir"
                    onClick={() => setModal({mode: 'delete', item})}
                >
                    ✕
                </button>
            ),
        });
    }

    const headerCount = (expandable ? 1 : 0) + 1 + cols.length + actionColumns.length;

    const apiErrorMessage = (error: unknown) =>
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error
            ?? (error as Error)?.message
            ?? 'erro desconhecido';

    const closeModal = () => setModal(null);

    const exportarDados = (item: ApiItem) => {
        // Exportar dados da tabela para JSON/visualização
        const {content} = q.data ?? {};
        const dados = content?.map((i: ApiItem) => ({id: i.id, nome: i.nome})) ?? [];
        const blob = new Blob([JSON.stringify(dados, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${entityTitle}-${item.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const [viewModalItem, setViewModalItem] = useState<ApiItem | null>(null);
    const [exportModal, setExportModal] = useState<{ item: ApiItem; tipo: 'PDF' | 'DOCX' | 'EXCEL' } | null>(null);

    const exportarPDF = (item: ApiItem) => {
        if (feature === 'listTabela') {
            setExportModal({ item, tipo: 'PDF' });
        } else {
            window.open(`/api/relatorios/relatorio/disponiveis/TABELA/${item.id}`, '_blank');
        }
    };

    const exportarDOCX = (item: ApiItem) => {
        if (feature === 'listTabela') {
            setExportModal({ item, tipo: 'DOCX' });
        }
    };

    const exportarExcel = (item: ApiItem) => {
        window.open(`/api/relatorios/relatorio/disponiveis/GRAFICO/${item.id}`, '_blank');
    };

    const executarExportacao = async (item: ApiItem, tipo: 'PDF' | 'DOCX' | 'EXCEL', templateId?: number) => {
        try {
            const response = await api.post<{ fileName: string; contentType: string; base64Data: string }>(
                `/api/relatorios/documentos/exportar/tabela/${item.id}`,
                { tipoExportacao: tipo, templateId, parametros: {} }
            );
            const { fileName, contentType, base64Data } = response.data;
            const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            setNotice(`Erro ao exportar: ${apiErrorMessage(error)}`);
        }
    };

    const fecharExportModal = () => setExportModal(null);

    const saveCreate = (values: Record<string, unknown>) => {
        q.create.mutate(
            {nome: 'Novo registro', ...values} as unknown as ApiItem,
            {
                onSuccess: () => {
                    if (path.includes('Layout') || path.includes('tema')) {
                        window.dispatchEvent(new CustomEvent('olimpio-tema-updated'));
                    }
                },
                onError: (error) => setNotice(`Erro ao criar: ${apiErrorMessage(error)}`)
            },
        );
        closeModal();
    };

    const saveEdit = (item: ApiItem, values: Record<string, unknown>) => {
        q.update.mutate(
            {id: item.id, body: {nome: item.nome ?? 'Registro', ...values} as unknown as ApiItem},
            {
                onSuccess: () => {
                    if (path.includes('Layout') || path.includes('tema')) {
                        window.dispatchEvent(new CustomEvent('olimpio-tema-updated'));
                    }
                },
                onError: (error) => setNotice(`Erro ao salvar: ${apiErrorMessage(error)}`)
            },
        );
        closeModal();
    };

    const confirmDelete = (item: ApiItem) => {
        q.remove.mutate(item.id, {onError: (error) => setNotice(`Erro ao excluir: ${apiErrorMessage(error)}`)});
        closeModal();
    };

    return (
        <div className="data-table">
            <div className="data-table-toolbar">
                {canCreate &&
                <button className="btn-primary btnstop"
                        onClick={() => createNavigateTo ? navigate(createNavigateTo) : setModal({mode: 'create'})}>
                    Novo
                </button>}
                {canRelatorio && (
                    <div className="export-toolbar-group" style={{display: 'inline-block', marginLeft: '10px', verticalAlign: 'middle'}}>
                        <button
                            type="button"
                            className="btn-action btnyellow"
                            style={{padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px'}}
                            title="Exportar PDF"
                            onClick={() => {
                                if (items.length > 0) exportarPDF(items[0]);
                            }}
                        >
                            <i className="fa fa-file-pdf-o"/> PDF
                        </button>
                        <button
                            type="button"
                            className="btn-action btnyellow"
                            style={{padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px'}}
                            title="Exportar DOCX"
                            onClick={() => {
                                if (items.length > 0) exportarDOCX(items[0]);
                            }}
                        >
                            <i className="fa fa-file-word-o"/> DOCX
                        </button>
                        <button
                            type="button"
                            className="btn-action btnyellow"
                            style={{padding: '6px 12px', borderRadius: '4px', cursor: 'pointer'}}
                            title="Exportar Excel"
                            onClick={() => {
                                if (items.length > 0) exportarExcel(items[0]);
                            }}
                        >
                            <i className="fa fa-file-excel-o"/> Excel
                        </button>
                    </div>
                )}
                {notice && <span className="data-table-notice">{notice}</span>}
            </div>
            {q.isError ? (
                <p>Erro ao carregar os dados.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        {expandable && <th className="col-toggle"></th>}
                        <th className="col-id">Id</th>
                        {mainCols.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                        {!expandable && subCols.map((column) => (
                            <th key={column.key}>{column.label}</th>
                        ))}
                        {actionColumns.map((column) => (
                            <th key={column.key} className="col-actions">{column.label}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {q.isLoading && items.length === 0 ? (
                        <tr>
                            <td colSpan={headerCount}>Carregando...</td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={headerCount}>Nenhum registro encontrado.</td>
                        </tr>
                    ) : (
                        items.flatMap((item) => {
                            const rowKey = String(item.id);
                            const isOpen = Boolean(expanded[rowKey]);
                            const row = (
                                <tr key={`${rowKey}-row`}>
                                    {expandable && (
                                        <td className="col-toggle">
                                            <button
                                                type="button"
                                                className="btn-row-toggle"
                                                title={isOpen ? 'Recolher' : 'Expandir'}
                                                onClick={() =>
                                                    setExpanded((prev) => ({...prev, [rowKey]: !prev[rowKey]}))
                                                }
                                            >
                                                {isOpen ? '▾' : '▸'}
                                            </button>
                                        </td>
                                    )}
                                    <td className="col-id">{item.id}</td>
                                    {mainCols.map((column) => (
                                        <td key={column.key}>{renderCell(item, column, colorColumnSet)}</td>
                                    ))}
                                    {!expandable && subCols.map((column) => (
                                        <td key={column.key}>{renderCell(item, column, colorColumnSet)}</td>
                                    ))}
                                    {actionColumns.map((column) => (
                                        <td key={column.key} className="col-actions">{column.render(item)}</td>
                                    ))}
                                </tr>
                            );
                            if (!expandable || !isOpen) return [row];
                            return [
                                row,
                                <tr key={`${rowKey}-detail`} className="row-detail">
                                    <td colSpan={headerCount}>
                                        <div className="sub-columns">
                                            {subCols.map((column) => (
                                                <div key={column.key} className="sub-column">
                                                    <span className="sub-column-label">{column.label}</span>
                                                    <span
                                                        className="sub-column-value">{renderCell(item, column, colorColumnSet)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>,
                            ];
                        })
                    )}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={headerCount} className="data-table-paginator">
                            <button
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || q.isFetching}
                            >
                                Anterior
                            </button>
                            <span>
                  Página {page + 1} de {totalPages}
                </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || q.isFetching}
                            >
                                Próxima
                            </button>
                            <label>
                                Registros por página
                                <select
                                    value={size}
                                    onChange={(event) => {
                                        setSize(Number(event.target.value));
                                        setPage(0);
                                    }}
                                >
                                    {PAGE_SIZES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <span>Total: {totalElements}</span>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            )}

            {modal?.mode === 'create' && (
                <RecordModal
                    title={`Novo ${entityTitle}`}
                    path={path}
                    fields={cols}
                    combos={combos}
                    preview={preview}
                    initial={{}}
                    submitLabel="Salvar"
                    onSubmit={(values) => saveCreate(values)}
                    onClose={closeModal}
                />
            )}
            {modal?.mode === 'edit' && (
                <RecordModal
                    title={`Editar ${entityTitle} #${modal.item.id}`}
                    path={path}
                    fields={modal.cols}
                    combos={combos}
                    preview={preview}
                    initial={asRecord(modal.item)}
                    submitLabel="Salvar"
                    onSubmit={(values) => saveEdit(modal.item, values)}
                    onClose={closeModal}
                />
            )}
            {modal?.mode === 'delete' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(event) => event.stopPropagation()}>
                        <h3>Excluir registro</h3>
                        <p>Deseja realmente excluir o registro #{modal.item.id}?</p>
                        <div className="modal-actions">
                            <button className="btnblue" onClick={closeModal}>Cancelar</button>
                            <button className="btn-danger" onClick={() => confirmDelete(modal.item)}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
            {exportModal && (
                <ExportModal
                    item={exportModal.item}
                    tipo={exportModal.tipo}
                    onClose={fecharExportModal}
                    onExport={executarExportacao}
                    entityTitle={entityTitle}
                />
            )}
            {viewModalItem && (
                <div className="modal-overlay" onClick={() => setViewModalItem(null)}>
                    <div className="modal form-modal" onClick={e => e.stopPropagation()}>
                        <div className="div_form">
                            <div className="form-title">Informações do Registro #{viewModalItem.id}</div>
                            <div className="table_form">
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '16px', maxHeight: '60vh', overflowY: 'auto'}}>
                                    {Object.entries(asRecord(viewModalItem)).map(([k, v]) => (
                                        <div key={k} style={{wordBreak: 'break-all'}}>
                                            <strong>{toTitle(k)}:</strong> {v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                        </div>
                                    ))}
                                </div>
                                <div className="form-footer" style={{marginTop: '16px'}}>
                                    <button type="button" className="btn-form-back" onClick={() => setViewModalItem(null)}>Fechar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface RefOption {
    id: number;
    label: string | null;
}

type RefsByColumn = Record<string, RefOption[]>;

function RecordModal({
                         title,
                         path,
                         fields,
                         initial,
                         submitLabel,
                         onSubmit,
                         onClose,
                         combos,
                         preview,
                     }: {
    title: string;
    path: string;
    fields: DataTableColumn[];
    initial: Record<string, unknown>;
    submitLabel: string;
    onSubmit: (values: Record<string, unknown>) => void;
    onClose: () => void;
    combos?: Record<string, ComboSource>;
    preview?: (values: Record<string, unknown>) => ReactNode;
}) {
    const [values, setValues] = useState<Record<string, unknown>>(() => {
        const copy: Record<string, unknown> = {};
        for (const field of fields) {
            const value = initial[field.key];
            if (fkBase(field.key) && (value === null || value === undefined)) {
                copy[field.key] = null;
                continue;
            }
            if (typeof value === 'boolean') {
                copy[field.key] = value;
                continue;
            }
            if (value === 'true' || value === 'false') {
                copy[field.key] = value === 'true';
                continue;
            }
            copy[field.key] = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
        }
        return copy;
    });

    const hasFk = fields.some((field) => fkBase(field.key) !== null);
    const refsQuery = useQuery({
        queryKey: [path, 'refs'],
        queryFn: async () => (await api.get<RefsByColumn>(`${path}/refs`)).data,
        enabled: hasFk,
    });
    const refs: RefsByColumn = refsQuery.data ?? {};

    const handleComboChange = (fieldKey: string, raw: string) => {
        setValues((prev) => ({...prev, [fieldKey]: raw === '' ? null : Number(raw)}));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">{title}</div>
                    <form
                        className="table_form"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmit(values);
                        }}
                    >
                        {fields.length === 0 ? (
                            <p className="form-empty">Nenhum campo disponível para edição.</p>
                        ) : (
                            <div className="form-grid">
                                {fields.map((field) => {
                                    const raw = initial[field.key];
                                    const base = fkBase(field.key);
                                    const refOptions = base ? refs[field.key] : undefined;
                                    const isFk = base !== null;
                                    const isBoolean = raw === true || raw === false || raw === 'true' || raw === 'false';
                                    const isFile = !isBoolean && ((typeof raw === 'string' && raw.startsWith('data:')) || FILE_KEY_RE.test(field.key));
                                    const combo = combos?.[field.key];
                                    const options = field.options;
                                    return (
                                        <label key={field.key} className="form-field">
                                            <span className="form-label">{field.label}</span>
                                            {combo ? (
                                                <ComboSelect
                                                    source={combo}
                                                    value={values[field.key]}
                                                    onChange={(rawValue) => setValues((prev) => ({
                                                        ...prev,
                                                        [field.key]: rawValue
                                                    }))}
                                                />
                                            ) : options ? (
                                                <select
                                                    className="form-input form-select"
                                                    value={String(values[field.key] ?? '')}
                                                    onChange={(event) => setValues((prev) => ({
                                                        ...prev,
                                                        [field.key]: event.target.value
                                                    }))}
                                                >
                                                    <option value="">-- Selecione --</option>
                                                    {options.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : isFk && refsQuery.isLoading ? (
                                                <select className="form-input form-select" disabled>
                                                    <option>Carregando...</option>
                                                </select>
                                            ) : isFk && refOptions ? (
                                                <select
                                                    className="form-input form-select"
                                                    value={String(values[field.key] ?? '')}
                                                    onChange={(event) => handleComboChange(field.key, event.target.value)}
                                                >
                                                    <option value="">-- Selecione --</option>
                                                    {refOptions.map((option) => (
                                                        <option key={option.id} value={option.id}>
                                                            {option.label ?? `#${option.id}`}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : isBoolean ? (
                                                <BooleanField
                                                    value={Boolean(values[field.key])}
                                                    onChange={(value) => setValues((prev) => ({
                                                        ...prev,
                                                        [field.key]: value
                                                    }))}
                                                />
                                            ) : isFile ? (
                                                <Base64FileUpload
                                                    value={String(values[field.key] ?? '')}
                                                    onChange={(value) => setValues((prev) => ({
                                                        ...prev,
                                                        [field.key]: value
                                                    }))}
                                                />
                                            ) : (
                                                <input
                                                    className="form-input"
                                                    value={String(values[field.key] ?? '')}
                                                    onChange={(event) => setValues((prev) => ({
                                                        ...prev,
                                                        [field.key]: event.target.value
                                                    }))}
                                                />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                        {preview && (
                            <div className="form-preview">
                                <div className="form-preview-title">Prévia (não salva)</div>
                                {preview(values)}
                            </div>
                        )}
                        <div className="modal-actions form-footer">
                            <button type="button" className="btn-form-back" onClick={onClose}>Fechar</button>
                            <button type="submit" className="btn-form-save">{submitLabel}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function ComboSelect({
                         source,
                         value,
                         onChange,
                     }: {
    source: ComboSource;
    value: unknown;
    onChange: (raw: string) => void;
}) {
    const valueKey = source.valueKey ?? 'id';
    const labelKey = source.labelKey ?? 'titulo';
    const optionsQuery = useQuery({
        queryKey: ['combo', source.path],
        queryFn: async () => (await api.get<ApiItem[]>(source.path)).data,
    });

    if (optionsQuery.isLoading) {
        return (
            <select className="form-input form-select" disabled>
                <option>Carregando...</option>
            </select>
        );
    }

    const options = optionsQuery.data ?? [];
    return (
        <select
            className="form-input form-select"
            value={String(value ?? '')}
            onChange={(event) => onChange(event.target.value)}
        >
            <option value="">-- Selecione --</option>
            {options.map((option) => {
                const record = asRecord(option);
                const optionValue = String(record[valueKey] ?? '');
                const label = record[labelKey] ?? `#${record.id}`;
                return (
                    <option key={optionValue} value={optionValue}>
                        {String(label)}
                    </option>
                );
            })}
        </select>
    );
}

interface ExportModalProps {
    item: ApiItem;
    tipo: 'PDF' | 'DOCX' | 'EXCEL';
    onClose: () => void;
    onExport: (item: ApiItem, tipo: 'PDF' | 'DOCX' | 'EXCEL', templateId?: number) => Promise<void>;
    entityTitle: string;
}

function ExportModal({ item, tipo, onClose, onExport, entityTitle }: ExportModalProps) {
    const [templates, setTemplates] = useState<Array<{id: number, nome: string}>>([]);
    const [templateId, setTemplateId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tipo === 'DOCX' || tipo === 'PDF') {
            api.get<{ templates?: Array<{id: number, nome: string}> }>(`/api/relatorios/documentos/opcoes`, {
                params: { tipoRelatorio: 'TABELA', relatorioId: item.id }
            }).then(response => {
                setTemplates(response.data.templates || []);
                if (response.data.templates?.length > 0) {
                    setTemplateId(response.data.templates[0].id);
                }
            }).catch(() => setTemplates([]));
        }
    }, [item.id, tipo]);

    const handleExport = async () => {
        setLoading(true);
        await onExport(item, tipo, templateId);
        setLoading(false);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Exportar {tipo}</div>
                    <div className="table_form">
                        {tipo === 'DOCX' || tipo === 'PDF' ? (
                            <>
                                <p>Selecione o template para gerar o documento {tipo}:</p>
                                <div className="form-field">
                                    <label className="form-label">Template</label>
                                    <select
                                        className="form-input form-select"
                                        value={templateId ?? ''}
                                        onChange={(e) => setTemplateId(e.target.value ? Number(e.target.value) : undefined)}
                                        disabled={templates.length === 0 || loading}
                                    >
                                        <option value="">-- Selecione um template --</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.nome}</option>
                                        ))}
                                    </select>
                                </div>
                                {templates.length === 0 && (
                                    <p className="form-empty">Nenhum template disponível. Configure um template DOCX na tela de gestão de templates.</p>
                                )}
                            </>
                        ) : (
                            <p>Clique em Exportar para baixar o arquivo Excel.</p>
                        )}
                        <div className="modal-actions form-footer">
                            <button type="button" className="btn-form-back" onClick={onClose}>Cancelar</button>
                            <button type="button" className="btn-form-save" onClick={handleExport} disabled={loading || (tipo !== 'EXCEL' && !templateId)}>
                                {loading ? 'Gerando...' : `Exportar ${tipo}`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
