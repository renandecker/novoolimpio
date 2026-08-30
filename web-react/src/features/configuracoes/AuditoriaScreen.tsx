import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import {auditoriaApi, type AuditoriaItem} from '../auditoria';

const PAGE_SIZES = [10, 20, 50, 100];

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());

const formatData = (data: number | string | null | undefined): string => {
    if (data === null || data === undefined) return '-';
    const date = new Date(data);
    if (Number.isNaN(date.getTime())) return String(data);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()} ${p(date.getHours())}:${p(date.getMinutes())}:${p(date.getSeconds())}`;
};

const formatValor = (valor: unknown): string => {
    if (valor === null || valor === undefined) return '-';
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    return String(valor);
};

function AuditTable({entidade, titulo}: { entidade: string; titulo: string }) {
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const query = useQuery({
        queryKey: ['auditoria', entidade, page, size],
        queryFn: () => auditoriaApi.listar(entidade, page, size),
    });

    const items = query.data?.content ?? [];
    const totalElements = query.data?.totalElements ?? 0;
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);

    const toggle = (item: AuditoriaItem) =>
        setExpanded((prev) => ({...prev, [`${item.id}-${item.rev}`]: !prev[`${item.id}-${item.rev}`]}));

    return (
        <div className="data-table">
            {query.isError ? (
                <p>Erro ao carregar a auditoria de {titulo.toLowerCase()}.</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th className="col-toggle"></th>
                        <th className="col-id">Id</th>
                        <th>Rev</th>
                        <th>Data</th>
                        <th>Usuário</th>
                        <th>Ação</th>
                    </tr>
                    </thead>
                    <tbody>
                    {query.isLoading && items.length === 0 ? (
                        <tr>
                            <td colSpan={6}>Carregando...</td>
                        </tr>
                    ) : items.length === 0 ? (
                        <tr>
                            <td colSpan={6}>Nenhum registro encontrado.</td>
                        </tr>
                    ) : (
                        items.flatMap((item) => {
                            const rowKey = `${item.id}-${item.rev}`;
                            const isOpen = Boolean(expanded[rowKey]);
                            const row = (
                                <tr key={`${rowKey}-row`}>
                                    <td className="col-toggle">
                                        <button
                                            type="button"
                                            className="btn-row-toggle"
                                            title={isOpen ? 'Recolher' : 'Expandir'}
                                            onClick={() => toggle(item)}
                                        >
                                            {isOpen ? '▾' : '▸'}
                                        </button>
                                    </td>
                                    <td className="col-id">{item.id}</td>
                                    <td>{item.rev}</td>
                                    <td>{formatData(item.data)}</td>
                                    <td>{item.usuario ?? '-'}</td>
                                    <td>{item.acao ?? '-'}</td>
                                </tr>
                            );
                            if (!isOpen) return [row];
                            return [
                                row,
                                <tr key={`${rowKey}-detail`} className="row-detail">
                                    <td colSpan={6}>
                                        <div className="sub-columns">
                                            {item.campos.length === 0 ? (
                                                <span className="sub-column-label">Nenhum campo.</span>
                                            ) : (
                                                item.campos.map((campo) => (
                                                    <div key={campo.nome} className="sub-column">
                                                        <span className="sub-column-label">{toTitle(campo.nome)}</span>
                                                        <span
                                                            className="sub-column-value">{formatValor(campo.valor)}</span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                </tr>,
                            ];
                        })
                    )}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan={6} className="data-table-paginator">
                            <button
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || query.isFetching}
                            >
                                Anterior
                            </button>
                            <span>
                  Página {page + 1} de {totalPages}
                </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || query.isFetching}
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
        </div>
    );
}

export default function AuditoriaScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Auditoria</h1>
                <Tabs
                    tabs={[
                        {
                            key: 'matricula',
                            label: 'Matrícula',
                            content: <AuditTable entidade="matricula" titulo="Matrícula"/>
                        },
                        {
                            key: 'oferecimento',
                            label: 'Oferecimentos',
                            content: <AuditTable entidade="oferecimento" titulo="Oferecimento"/>
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
