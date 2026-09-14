import {useState, useMemo} from 'react';
import {PermissionGate, useCurrentOutcome} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {useModulePaged} from '../../../shared/hooks/useModulePaged';
import type {ApiItem} from '../../../shared/types/index';
import type {SearchFilterRequest} from '../../../shared/types/types';
import {legacyClassName} from '../../../shared/components/DataTable';
import {ModuleFilter} from '../../../shared/components/ModuleFilter';
import BreadCrumb from '../../../shared/components/BreadCrumb';
import {swalConfirm} from '../../../shared/components/swal';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatCurrency = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
};

const formatPercent = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return `${num.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} %`;
};

const COLUMNS = [
    {key: 'unidade_sucinto', label: 'Unidade'},
    {key: 'usuario_login', label: 'Usuário'},
    {key: 'tipo', label: 'Tipo Conta'},
    {key: 'valor', label: 'Valor', render: (item: ApiItem) => formatCurrency(asRecord(item).valor)},
    {key: 'desconto', label: 'Desconto', render: (item: ApiItem) => formatPercent(asRecord(item).desconto)},
    {key: 'juros', label: 'Juros', render: (item: ApiItem) => formatPercent(asRecord(item).juros)},
    {key: 'multa', label: 'Multa', render: (item: ApiItem) => formatPercent(asRecord(item).multa)},
    {key: 'dia', label: 'Dia'},
    {key: 'mes', label: 'Mês'},
    {key: 'diaSemana_nome', label: 'Dia da Semana'},
    {key: 'ativo', label: 'Ativo', render: (item: ApiItem) => {
        const val = asRecord(item).ativo;
        const active = val === true || val === 'true' || val === 1 || val === '1';
        return active ? 'SIM' : 'NÃO';
    }},
    {key: 'situacao', label: 'Situação', render: (item: ApiItem) => {
        const val = asRecord(item).situacao;
        const situacao = val === true || val === 'true' || val === 1 || val === '1';
        return situacao ? 'PENDENTE' : 'EM DIA';
    }},
];

const TIPOS_PLANO = [
    {value: 'DIARIO', label: 'Diário'},
    {value: 'SEMANAL', label: 'Semanal'},
    {value: 'QUINZENAL', label: 'Quinzenal'},
    {value: 'MENSAL', label: 'Mensal'},
    {value: 'BIMESTRAL', label: 'Bimestral'},
    {value: 'TRIMESTRAL', label: 'Trimestral'},
    {value: 'SEMESTRAL', label: 'Semestral'},
    {value: 'ANUAL', label: 'Anual'},
];

const DIAS_SEMANA = [
    {value: 'SEGUNDA', label: 'Segunda-feira'},
    {value: 'TERCA', label: 'Terça-feira'},
    {value: 'QUARTA', label: 'Quarta-feira'},
    {value: 'QUINTA', label: 'Quinta-feira'},
    {value: 'SEXTA', label: 'Sexta-feira'},
    {value: 'SABADO', label: 'Sábado'},
    {value: 'DOMINGO', label: 'Domingo'},
];

const MESES = [
    {value: 1, label: 'Janeiro'},
    {value: 2, label: 'Fevereiro'},
    {value: 3, label: 'Março'},
    {value: 4, label: 'Abril'},
    {value: 5, label: 'Maio'},
    {value: 6, label: 'Junho'},
    {value: 7, label: 'Julho'},
    {value: 8, label: 'Agosto'},
    {value: 9, label: 'Setembro'},
    {value: 10, label: 'Outubro'},
    {value: 11, label: 'Novembro'},
    {value: 12, label: 'Dezembro'},
];

const DIAS_MES = [
    {value: 1, label: '1'}, {value: 2, label: '2'}, {value: 3, label: '3'}, {value: 4, label: '4'},
    {value: 5, label: '5'}, {value: 6, label: '6'}, {value: 7, label: '7'}, {value: 8, label: '8'},
    {value: 9, label: '9'}, {value: 10, label: '10'}, {value: 11, label: '11'}, {value: 12, label: '12'},
    {value: 13, label: '13'}, {value: 14, label: '14'}, {value: 15, label: '15'}, {value: 16, label: '16'},
    {value: 17, label: '17'}, {value: 18, label: '18'}, {value: 19, label: '19'}, {value: 20, label: '20'},
    {value: 21, label: '21'}, {value: 22, label: '22'}, {value: 23, label: '23'}, {value: 24, label: '24'},
    {value: 25, label: '25'}, {value: 26, label: '26'}, {value: 27, label: '27'}, {value: 28, label: '28'},
    {value: -2, label: 'Antepenúltimo dia do mês'},
    {value: -1, label: 'Penúltimo dia do mês'},
    {value: 0, label: 'Último dia do mês'},
];

export default function ViewContaGestaoContaListScreen() {
    const outcome = useCurrentOutcome();
    const [formData, setFormData] = useState({
        unidade: '',
        tipo: '',
        diaSemana: '',
        dia: '',
        mes: '',
        valor: '',
        juros: '',
        multa: '',
        desconto: '',
    });
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});
    const [notice, setNotice] = useState<string>('');

    const q = useModulePaged('/api/view/conta/gestaoConta', 0, 10, undefined, filterParams);
    const all = q.data?.content ?? [];
    const totalElements = q.data?.totalElements ?? 0;
    const totalPages = Math.max(1, q.data?.totalPages ?? 0);
    const [page, setPage] = useState(0);

    const showDiaSemana = formData.tipo === 'SEMANAL';
    const showDia = formData.tipo && formData.tipo !== 'SEMANAL' && formData.tipo !== 'DIARIO';
    const showMes = formData.tipo && formData.tipo !== 'SEMANAL' && formData.tipo !== 'DIARIO' && formData.tipo !== 'MENSAL';

    const handleTipoChange = (tipo: string) => {
        setFormData(prev => ({
            ...prev,
            tipo,
            diaSemana: '',
            dia: '',
            mes: '',
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload: Record<string, unknown> = {
                unidade: {id: Number(formData.unidade)},
                tipo: formData.tipo,
                valor: Number(formData.valor.replace(/\./g, '').replace(',', '.')) || 0,
                juros: Number(formData.juros.replace(',', '.')) || 0,
                multa: Number(formData.multa.replace(',', '.')) || 0,
                desconto: Number(formData.desconto.replace(',', '.')) || 0,
            };

            if (showDiaSemana && formData.diaSemana) {
                payload.diaSemana = {id: formData.diaSemana};
            }
            if (showDia && formData.dia !== '') {
                payload.dia = Number(formData.dia);
            }
            if (showMes && formData.mes !== '') {
                payload.mes = Number(formData.mes);
            }

            if (editingId) {
                await api.put(`/api/conta/gestaoConta/${editingId}`, payload);
                setNotice('Conta atualizada com sucesso');
            } else {
                await api.post('/api/conta/gestaoConta', payload);
                setNotice('Conta criada com sucesso');
            }
            q.refetch();
            setFormData({
                unidade: '',
                tipo: '',
                diaSemana: '',
                dia: '',
                mes: '',
                valor: '',
                juros: '',
                multa: '',
                desconto: '',
            });
            setEditingId(null);
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleNew = () => {
        setFormData({
            unidade: '',
            tipo: '',
            diaSemana: '',
            dia: '',
            mes: '',
            valor: '',
            juros: '',
            multa: '',
            desconto: '',
        });
        setEditingId(null);
    };

    const handleEdit = (item: ApiItem) => {
        const row = asRecord(item);
        setFormData({
            unidade: String(row.unidade_id ?? ''),
            tipo: String(row.tipo ?? ''),
            diaSemana: String(row.diaSemana_id ?? ''),
            dia: String(row.dia ?? ''),
            mes: String(row.mes ?? ''),
            valor: row.valor != null ? Number(row.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '',
            juros: row.juros != null ? Number(row.juros).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '',
            multa: row.multa != null ? Number(row.multa).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '',
            desconto: row.desconto != null ? Number(row.desconto).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '',
        });
        setEditingId(Number(row.id));
    };

    const handleDelete = async (item: ApiItem) => {
        if (!(await swalConfirm('Deseja realmente desativar esta conta?', {title: 'Desativar conta', confirmText: 'Desativar', danger: true}))) return;
        try {
            await api.post(`/api/conta/gestaoConta/${item.id}/situacao`, {ativo: false});
            setNotice('Conta desativada com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleActivate = async (item: ApiItem) => {
        try {
            await api.post(`/api/conta/gestaoConta/${item.id}/situacao`, {ativo: true});
            setNotice('Conta ativada com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleCreatePagamentos = async (item: ApiItem) => {
        if (!(await swalConfirm('Deseja criar pagamentos para esta conta?', {title: 'Criar pagamentos', confirmText: 'Criar'}))) return;
        try {
            await api.post(`/api/conta/gestaoConta/${item.id}/criar-pagamentos`);
            setNotice('Pagamentos criados com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    const handleAjustarSituacao = async (item: ApiItem) => {
        try {
            await api.post(`/api/conta/gestaoConta/${item.id}/ajustar-situacao`);
            setNotice('Situação ajustada com sucesso');
            q.refetch();
        } catch (error: any) {
            setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <BreadCrumb />
                    </div>
                    <div className="page-header-actions">
                        <ModuleFilter columns={COLUMNS} value={filterParams} onChange={setFilterParams}/>
                    </div>
                </div>

                <div className="data-table-form">
                    <div className="form-panel">
                        <div className="form-title">Gestão de Conta</div>
                        <form className="table_form" onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <label className="form-field">
                                    <span className="form-label">Unidade *</span>
                                    <select
                                        className="form-input form-select"
                                        value={formData.unidade}
                                        onChange={e => setFormData(prev => ({...prev, unidade: e.target.value}))}
                                        required
                                    >
                                        <option value="">-- Selecione --</option>
                                    </select>
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Periodicidade *</span>
                                    <select
                                        className="form-input form-select"
                                        value={formData.tipo}
                                        onChange={e => handleTipoChange(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Selecione --</option>
                                        {TIPOS_PLANO.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                </label>

                                {showDiaSemana && (
                                    <label className="form-field">
                                        <span className="form-label">Dia da Semana *</span>
                                        <select
                                            className="form-input form-select"
                                            value={formData.diaSemana}
                                            onChange={e => setFormData(prev => ({...prev, diaSemana: e.target.value}))}
                                            required
                                        >
                                            <option value="">-- Selecione --</option>
                                            {DIAS_SEMANA.map(d => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {showDia && (
                                    <label className="form-field">
                                        <span className="form-label">Dia *</span>
                                        <select
                                            className="form-input form-select"
                                            value={formData.dia}
                                            onChange={e => setFormData(prev => ({...prev, dia: e.target.value}))}
                                            required
                                        >
                                            <option value="">-- Selecione --</option>
                                            {DIAS_MES.map(d => (
                                                <option key={d.value} value={d.value}>{d.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                {showMes && (
                                    <label className="form-field">
                                        <span className="form-label">Mês *</span>
                                        <select
                                            className="form-input form-select"
                                            value={formData.mes}
                                            onChange={e => setFormData(prev => ({...prev, mes: e.target.value}))}
                                            required
                                        >
                                            <option value="">-- Selecione --</option>
                                            {MESES.map(m => (
                                                <option key={m.value} value={m.value}>{m.label}</option>
                                            ))}
                                        </select>
                                    </label>
                                )}

                                <label className="form-field">
                                    <span className="form-label">Valor</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={formData.valor}
                                        onChange={e => setFormData(prev => ({...prev, valor: e.target.value}))}
                                        placeholder="R$ 0,00"
                                    />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Juros (%)</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={formData.juros}
                                        onChange={e => setFormData(prev => ({...prev, juros: e.target.value}))}
                                        placeholder="0,00"
                                        max="100"
                                    />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Multa (%)</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={formData.multa}
                                        onChange={e => setFormData(prev => ({...prev, multa: e.target.value}))}
                                        placeholder="0,00"
                                        max="100"
                                    />
                                </label>

                                <label className="form-field">
                                    <span className="form-label">Desconto (%)</span>
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={formData.desconto}
                                        onChange={e => setFormData(prev => ({...prev, desconto: e.target.value}))}
                                        placeholder="0,00"
                                        max="100"
                                    />
                                </label>
                            </div>
                            <div className="form-footer">
                                <button type="button" className="btn-form-back btnyellow" onClick={handleNew}>
                                    Novo
                                </button>
                                <button type="submit" className="btnstop">
                                    {editingId ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="list-panel">
                        <div className="data-table">
                            {q.isError ? (
                                <p>Erro ao carregar as contas.</p>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        {COLUMNS.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                        <th className="col-actions">Ações</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {q.isLoading && all.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length + 1}>Carregando...</td>
                                        </tr>
                                    ) : all.length === 0 ? (
                                        <tr>
                                            <td colSpan={COLUMNS.length + 1}>Nenhum registro encontrado.</td>
                                        </tr>
                                    ) : (
                                        all.map((item) => {
                                            const row = asRecord(item);
                                            const id = Number(row.id);
                                            const ativo = row.ativo === true || row.ativo === 'true' || row.ativo === 1 || row.ativo === '1';
                                            return (
                                                <tr key={id}>
                                                    {COLUMNS.map((column) => (
                                                        <td key={column.key}>
                                                            {column.render ? column.render(item) : String(row[column.key] ?? '')}
                                                        </td>
                                                    ))}
                                                    <td className="col-actions">
                                                        <div className="row-actions-menu">
                                                            <button
                                                                type="button"
                                                                className="btn-action btngreen"
                                                                title="Editar"
                                                                onClick={() => handleEdit(item)}
                                                            >
                                                                <i className="fa fa-pencil"/>
                                                            </button>
                                                            {ativo ? (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btnorange"
                                                                    title="Desativar conta"
                                                                    onClick={() => handleDelete(item)}
                                                                >
                                                                    <i className="fa fa-close"/>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    className="btn-action btnstop"
                                                                    title="Ativar conta"
                                                                    onClick={() => handleActivate(item)}
                                                                >
                                                                    <i className="fa fa-check-square-o"/>
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                className="btn-action btnblack"
                                                                title="Criar pagamentos"
                                                                onClick={() => handleCreatePagamentos(item)}
                                                            >
                                                                <i className="fa fa-check"/>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn-action btnpurple"
                                                                title="Verifica situação pagamentos"
                                                                onClick={() => handleAjustarSituacao(item)}
                                                            >
                                                                <i className="fa fa-usd"/>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                    </tbody>
                                    <tfoot>
                                    <tr>
                                        <td colSpan={COLUMNS.length + 1} className="data-table-paginator">
                                            <button onClick={() => setPage(current => Math.max(0, current - 1))} disabled={page === 0 || q.isFetching}>
                                                Anterior
                                            </button>
                                            <span>Página {page + 1} de {totalPages}</span>
                                            <button onClick={() => setPage(current => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1 || q.isFetching}>
                                                Próxima
                                            </button>
                                            <label>
                                                Registros por página
                                                <select value={10} onChange={e => { setPage(0); }}>
                                                    <option value={10}>10</option>
                                                    <option value={20}>20</option>
                                                    <option value={50}>50</option>
                                                </select>
                                            </label>
                                            <span>Total: {totalElements}</span>
                                        </td>
                                    </tr>
                                    </tfoot>
                                </table>
                            )}
                        </div>
                    </div>

                    {notice && <div className="data-table-notice global-notice">{notice}</div>}
                </div>
            </main>
        </PermissionGate>
    );
}
