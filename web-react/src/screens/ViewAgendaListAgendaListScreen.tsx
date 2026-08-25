import {useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {useQuery} from '@tanstack/react-query';
import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import type {DataTableColumn} from '../DataTable';
import type {ApiItem} from '../types';
import {api} from '../api';
import {USUARIO_SOURCE} from '../masterDetailSources';

const SIM = 'Sim';
const NAO = 'Não';

const simNao = (chave: string) => (item: ApiItem): ReactNode => {
    const valor = (item as unknown as Record<string, unknown>)[chave];
    return valor === true ? SIM : NAO;
};

// Colunas de /view/agenda/colunas.xhtml na mesma ordem do legado.
const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Código'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'unidade_descricao', label: 'Unidade'},
    {key: 'tipo_agenda_descricao', label: 'Tipo da Agenda'},
    {key: 'status_compromisso_descricao', label: 'Início Status do Compromisso'},
    {key: 'proprio', label: 'Própria Agenda', render: simNao('proprio')},
    {key: 'diasmmaximo', label: 'Dia Agenda', render: simNao('diasmmaximo')},
    {key: 'qtdediasmaximo', label: 'Máximo dias agendar'},
];

interface UsuariosDialogState {
    agendaId: number;
}

export default function ViewAgendaListAgendaListScreen() {
    const [dialogUsuarios, setDialogUsuarios] = useState<UsuariosDialogState | null>(null);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Agenda</h1>
                <DataTable
                    path="/api/view/agenda/listAgenda"
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    editNavigateTo="/view/agenda/formAgenda"
                    createNavigateTo="/view/agenda/formAgenda"
                    extraRowActions={[
                        {
                            key: 'usuarios',
                            title: 'Ajustar usuários nesta Agenda',
                            className: 'btnblack',
                            icon: <i className="fa fa-users"/>,
                            onClick: async (item) => setDialogUsuarios({agendaId: Number(item.id)}),
                        },
                    ]}
                />
                {dialogUsuarios && (
                    <UsuariosDialog state={dialogUsuarios} onClose={() => setDialogUsuarios(null)}/>
                )}
            </main>
        </PermissionGate>
    );
}

function UsuariosDialog({state, onClose}: { state: UsuariosDialogState; onClose: () => void }) {
    const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
    const [pagina, setPagina] = useState(0);
    const [porPagina, setPorPagina] = useState(10);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        let ativo = true;
        api.get<number[]>(`/api/basico/agenda/${state.agendaId}/usuarios`)
            .then((resposta) => {
                if (ativo) setSelecionados(new Set(resposta.data));
            })
            .catch(() => {
                if (ativo) setSelecionados(new Set());
            });
        return () => {
            ativo = false;
        };
    }, [state.agendaId]);

    const usuariosQuery = useQuery({
        queryKey: ['agenda-usuarios-dialog'],
        queryFn: async () => (await api.get<ApiItem[]>(USUARIO_SOURCE)).data,
    });

    const usuarios = useMemo(() => {
        const lista = [...(usuariosQuery.data ?? [])];
        lista.sort((a, b) => Number(a.id) - Number(b.id));
        return lista;
    }, [usuariosQuery.data]);

    const totalPaginas = Math.max(1, Math.ceil(usuarios.length / porPagina));
    const paginaAtual = Math.min(pagina, totalPaginas - 1);
    const fatia = usuarios.slice(paginaAtual * porPagina, paginaAtual * porPagina + porPagina);

    const alternar = (usuarioId: number) => {
        setSelecionados((anterior) => {
            const novo = new Set(anterior);
            if (novo.has(usuarioId)) {
                novo.delete(usuarioId);
            } else {
                novo.add(usuarioId);
            }
            return novo;
        });
    };

    const salvar = async () => {
        setSalvando(true);
        try {
            await api.put(`/api/basico/agenda/${state.agendaId}/usuarios`, Array.from(selecionados).sort((a, b) => a - b));
            alert('Usuários ajustado na agenda com sucesso');
            onClose();
        } catch (erro) {
            console.error('Erro ao ajustar usuários da agenda:', erro);
            alert('Ocorreu um erro ao ajustar a agenda dos usuários');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <div className="div_form">
                    <div className="form-title">Usuários</div>
                    <div className="table_form">
                        <table>
                            <thead>
                            <tr>
                                <th className="col-actions"></th>
                                <th className="col-id">ID</th>
                                <th>Login</th>
                                <th>Nome</th>
                                <th>Ativo</th>
                            </tr>
                            </thead>
                            <tbody>
                            {usuariosQuery.isLoading ? (
                                <tr>
                                    <td colSpan={5}>Carregando...</td>
                                </tr>
                            ) : usuarios.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>Nenhum registro encontrado.</td>
                                </tr>
                            ) : (
                                fatia.map((usuario) => {
                                    const registro = usuario as unknown as Record<string, unknown>;
                                    const usuarioId = Number(registro.id);
                                    return (
                                        <tr key={usuarioId}>
                                            <td className="col-actions">
                                                <input
                                                    type="checkbox"
                                                    checked={selecionados.has(usuarioId)}
                                                    onChange={() => alternar(usuarioId)}
                                                />
                                            </td>
                                            <td className="col-id">{String(registro.id)}</td>
                                            <td>{String(registro.login ?? '')}</td>
                                            <td>{String(registro.nome ?? '')}</td>
                                            <td>{registro.fl_ativo === true || registro.ativo === true ? SIM : NAO}</td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan={5} className="data-table-paginator">
                                    <button onClick={() => setPagina(Math.max(0, paginaAtual - 1))} disabled={paginaAtual === 0}>
                                        Anterior
                                    </button>
                                    <span>Página {paginaAtual + 1} de {totalPaginas}</span>
                                    <button onClick={() => setPagina(Math.min(totalPaginas - 1, paginaAtual + 1))} disabled={paginaAtual >= totalPaginas - 1}>
                                        Próxima
                                    </button>
                                    <label>
                                        Registros por página
                                        <select value={porPagina} onChange={(event) => {
                                            setPorPagina(Number(event.target.value));
                                            setPagina(0);
                                        }}>
                                            {[5, 10, 15].map((opcao) => (
                                                <option key={opcao} value={opcao}>{opcao}</option>
                                            ))}
                                        </select>
                                    </label>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                        <div className="modal-actions form-footer">
                            <button type="button" className="btnblue" title="Salvar usuários da agenda"
                                    disabled={salvando} onClick={() => void salvar()}>Salvar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista" onClick={onClose}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
