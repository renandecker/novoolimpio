import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {ModuleTabs} from '../ModuleTabs';
import type {DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';
import {api} from '../api';
import {AutoComplete} from '../AutoComplete';
import type {AutoCompleteOption} from '../AutoComplete';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const apiErrorMessage = (error: unknown): string =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

const FERIADO_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {
        key: 'dt_feriado',
        label: 'Data',
        render: (item) => formatDate(asRecord(item).dt_feriado),
    },
    {
        key: 'fl_feriado_fixo',
        label: 'Fixo',
        render: (item) => (asRecord(item).fl_feriado_fixo ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_tipo_curso',
        label: 'Todos Cursos',
        render: (item) => (asRecord(item).fl_tipo_curso ? 'Sim' : 'Não'),
    },
    {
        key: 'fl_nacional',
        label: 'Nacional',
        render: (item) => (asRecord(item).fl_nacional ? 'Sim' : 'Não'),
    },
];

export default function ViewFeriadoListFeriadoListScreen() {
    const [trocaEntity, setTrocaEntity] = useState<ApiItem | null>(null);
    const [aviso, setAviso] = useState('');

    // Equivalente a #{feriadoController.atualizarOferecimento()}
    const atualizarFeriado = async (item: ApiItem) => {
        setAviso('');
        try {
            await api.post('/api/basico/feriado/atualizar-oferecimento', null);
            setAviso('Trigger de ajuste geral enviado para o schedule.');
        } catch (error) {
            setAviso(`Falha ao atualizar feriados: ${apiErrorMessage(error)}`);
        }
    };

    const abrirTroca = (item: ApiItem) => {
        setAviso('');
        setTrocaEntity(item);
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Feriado</h1>
                {aviso && <p className="data-table-notice">{aviso}</p>}
                <ModuleTabs
                    tabs={[
                        {
                            key: 'tabela',
                            label: 'Tabela',
                            path: '/api/view/feriado/listFeriado',
                            columns: FERIADO_COLUMNS,
                            maxMainColumns: FERIADO_COLUMNS.length,
                            editNavigateTo: '/view/feriado/formFeriado',
                            createNavigateTo: '/view/feriado/formFeriado',
                            extraRowActions: [
                                {
                                    key: 'atualizar',
                                    title: 'Atualizar feriado',
                                    className: 'btnblack',
                                    icon: <i className="fa fa-refresh"/>,
                                    permission: 'UPDATE',
                                    onClick: atualizarFeriado,
                                },
                                {
                                    key: 'troca',
                                    title: 'Troca e remove feriado',
                                    className: 'btnorange',
                                    icon: <i className="fa fa-random"/>,
                                    permission: 'DELETE',
                                    onClick: abrirTroca,
                                },
                            ],
                        },
                        {key: 'calendario', label: 'Calendário', empty: 'Conteúdo de Calendário.'},
                        {
                            key: 'ajusteFeriadoOferecimento',
                            label: 'Ajuste Feriado Oferecimento',
                            empty: 'Conteúdo de Ajuste Feriado Oferecimento.'
                        },
                        {key: 'feriadoAjuste', label: 'Feriado Ajuste', empty: 'Conteúdo de Feriado Ajuste.'},
                        {
                            key: 'feriadoNaoAjustar',
                            label: 'Feriado Não Ajustar',
                            empty: 'Conteúdo de Feriado Não Ajustar.'
                        },
                    ]}
                />
                {trocaEntity && (
                    <TrocaFeriadoDialog
                        entity={trocaEntity}
                        onClose={() => setTrocaEntity(null)}
                    />
                )}
            </main>
        </PermissionGate>
    );
}

/** Espelha o diálogo p:dialog widgetVar="trocaFeriado" do listFeriado.xhtml. */
function TrocaFeriadoDialog({entity, onClose}: { entity: ApiItem; onClose: () => void }) {
    const record = asRecord(entity);
    const destinoId = Number(record.id);
    const [selecao, setSelecao] = useState<AutoCompleteOption | null>(null);
    const [lista, setLista] = useState<AutoCompleteOption[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');

    const buscarOpcoes = async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query.trim()) return [];
        const {data} = await api.get<Array<{ id: number; nome: string }>>(
            '/api/basico/feriado',
            {params: {query, excluirId: destinoId}},
        );
        return (data ?? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));
    };

    const adicionar = () => {
        setErro('');
        if (!selecao) return;
        if (lista.some((item) => item.id === selecao.id)) return;
        setLista((prev) => [...prev, selecao]);
        setSelecao(null);
    };

    const remover = (id: number) => {
        setErro('');
        setLista((prev) => prev.filter((item) => item.id !== id));
    };

    const trocar = async () => {
        if (lista.length === 0) {
            setErro('Adicione ao menos um feriado para trocar.');
            return;
        }
        setSalvando(true);
        setErro('');
        try {
            // TODO: Endpoint /api/basico/feriado/trocar-feriados não existe no backend ainda
            // await api.post('/api/basico/feriado/trocar-feriados', {
            //     destinoId,
            //     origemIds: lista.map((item) => item.id),
            // });
            alert('Feriados trocados com sucesso (simulado - endpoint backend pendente)');
            onClose();
        } catch (error) {
            setErro(`Ocorreu um erro ao trocar feriados: ${apiErrorMessage(error)}`);
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Troca e remoção feriado</div>
                    <div className="table_form">
                        <div className="form-grid">
                            <div className="form-field">
                                <span className="form-label">Id</span>
                                <span>{String(record.id ?? '')}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Nome</span>
                                <span>{String(record.nome ?? '')}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Data</span>
                                <span>{formatDate(record.dt_feriado)}</span>
                            </div>
                            <div className="form-field">
                                <span className="form-label">Nacional</span>
                                <span>{record.fl_nacional === true ? 'Sim' : 'Não'}</span>
                            </div>
                        </div>

                        <fieldset className="form-fieldset">
                            <legend>Feriados removidos e alterados</legend>
                            <label className="form-field">
                                <span className="form-label">Feriado</span>
                                <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                                    <div style={{flex: 1}}>
                                        <AutoComplete
                                            placeholder="Digite para buscar (mínimo 3 caracteres)"
                                            value={selecao}
                                            onChange={setSelecao}
                                            fetchOptions={buscarOpcoes}
                                        />
                                    </div>
                                    <button type="button" className="btnblue" title="Adicionar" onClick={adicionar}>
                                        +
                                    </button>
                                </div>
                            </label>

                            {lista.length > 0 ? (
                                <table className="data-table" style={{width: '100%', marginTop: 8}}>
                                    <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Nome</th>
                                        <th style={{width: 50}}></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {lista.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.label}</td>
                                            <td>
                                                <button type="button" className="btn-action btnred" title="Remover"
                                                        onClick={() => remover(item.id)}>
                                                    ×
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="master-detail-empty">Nenhum registro selecionado.</p>
                            )}
                        </fieldset>

                        {erro && <small style={{color: '#c0392b'}}>{erro}</small>}

                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Trocar e remover feriados"
                                    disabled={salvando} onClick={() => void trocar()}>
                                {salvando ? 'Trocando...' : 'Trocar e Salvar'}
                            </button>
                            <button type="button" className="btnyellow" onClick={onClose} disabled={salvando}>
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
