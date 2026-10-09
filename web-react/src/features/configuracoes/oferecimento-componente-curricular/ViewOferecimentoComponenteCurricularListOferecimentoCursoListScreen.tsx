import {useEffect, useState} from 'react';

import {PermissionGate, usePermissions, useCurrentOutcome} from '../../../shared/services/permissions';

import {api} from '../../../shared/services/api';

import {useModulePaged} from '../../../shared/hooks/useModulePaged';
  import type {VerificarAcessoResponse} from '../../../shared/hooks/useModulePaged';

import type {ApiItem} from '../../../shared/types/types.ts';

import {legacyClassName} from '../../../shared/components/DataTable';

import {PAGE_SIZES, type DataTableColumn} from '../../../shared/components/DataTable';

import {RowMenu, type RowMenuItem} from '../../../shared/components/RowMenu';


import type {SearchFilterRequest} from '../../../shared/types/types';

import {ModuleFilter} from '../../../shared/components/ModuleFilter';




const asRecord = (item: ApiItem) => item as unknown as Record<string, any>;


interface OferecimentoRow {

    id?: number;

    dataInicio?: string;

    dataFim?: string;

    dataCancelamento?: string;

    vagas?: number;

    inscritos?: number;

    componenteCurricular_descricao?: string;

    sala_descricao?: string;

    professor_descricao?: string;

}


const COLUMNS: DataTableColumn[] = [

    {key: 'id', label: 'ID'},

    {key: 'nome', label: 'Grupo'},

    {key: 'unidade_sucinto', label: 'Unidade'},

    {key: 'curso_nome', label: 'Curso'},

];


export default function ViewOferecimentoComponenteCurricularListOferecimentoCursoListScreen() {

    const [page, setPage] = useState(0);

    const [size, setSize] = useState(PAGE_SIZES[0]);

    const [infoDialog, setInfoDialog] = useState<{open: boolean; entity: any | null}>({open: false, entity: null});

    const [deleteDialog, setDeleteDialog] = useState<{open: boolean; entity: any | null}>({open: false, entity: null});

    const [selecaoDialog, setSelecaoDialog] = useState<{open: boolean; entity: any | null}>({open: false, entity: null});

    const [selecionados, setSelecionados] = useState<number[]>([]);

    const [oferecimentos, setOferecimentos] = useState<OferecimentoRow[]>([]);

    const [oferecimentosLoading, setOferecimentosLoading] = useState(false);

    const [filter, setFilter] = useState<Record<string, any>>({});

    const [filterParams, setFilterParams] = useState<SearchFilterRequest>({filters: {}});


    const {can} = usePermissions();

    const outcome = useCurrentOutcome();


    const [perfilModuloPermissions, setPerfilModuloPermissions] = useState<VerificarAcessoResponse | null>(null);

    const [perfilModuloLoading, setPerfilModuloLoading] = useState(false);


    useEffect(() => {

        const carregarPermissoes = async () => {

            setPerfilModuloLoading(true);

            try {

                const response = await api.get<VerificarAcessoResponse>(
                    `/api/basico/verificar-acesso?outcome=${encodeURIComponent(outcome)}`);

                setPerfilModuloPermissions(response.data);

            } catch (error) {

                console.error('Erro ao carregar permissões do perfil-modulo:', error);

            } finally {

                setPerfilModuloLoading(false);

            }

        };

        carregarPermissoes();

    }, [outcome]);

    const acessoRelatorios = can('EXECUTE', outcome) || (perfilModuloPermissions?.relatorio ?? false);

    const acessoEditar = can('UPDATE', outcome) || (perfilModuloPermissions?.editar ?? false);

    const acessoRemover = can('DELETE', outcome) || (perfilModuloPermissions?.remover ?? false);
    const q = useModulePaged('/api/educacao/oferecimento-curso', page, size, filter, filterParams);

    const all = q.data?.content ?? [];

    const totalElements = q.data?.totalElements ?? 0;

    const totalPages = Math.max(1, q.data?.totalPages ?? 0);


    const handleInfo = (entity: any) => {

        setInfoDialog({open: true, entity});

    };


    const handleSelecao = async (entity: any) => {

        setSelecionados([]);

        setOferecimentos([]);

        setOferecimentosLoading(true);

        setSelecaoDialog({open: true, entity});

        try {

            const {data} = await api.get('/api/educacao/oferecimento-curso/listar-oferecimentos', {params: {grupoId: entity.id}});

            setOferecimentos(Array.isArray(data) ? data : []);

        } catch (e) {

            setOferecimentos([]);

        } finally {

            setOferecimentosLoading(false);

        }

    };


    const handleDelete = (entity: any) => {

        setDeleteDialog({open: true, entity});

    };


    const confirmDelete = async () => {

        if (!deleteDialog.entity) return;
        try {

            await api.delete(`/api/educacao/oferecimento-curso/${deleteDialog.entity.id}`);

            setDeleteDialog({open: false, entity: null});

            q.refetch();

        } catch (e) {

            alert('Erro ao excluir');

        }

    };


    const toggleSelect = (id: number) => {

        setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    };


    const selectAll = (checked: boolean) => {

        if (checked) {

            setSelecionados(oferecimentos.map(item => Number(item.id)));

        } else {

            setSelecionados([]);

        }

    };


    const irParaEdicao = (ids: number[]) => {

        const grupoId = selecaoDialog.entity?.id;

        if (grupoId == null) return;

        setSelecaoDialog({open: false, entity: null});

        setSelecionados([]);

        window.location.href = `/view/oferecimentoComponenteCurricular/formOferecimentoCurso?id=${grupoId}&ordem=${ids.join(',')}`;

    };


    const fmtData = (valor: unknown) => valor ? String(valor).slice(0, 10) : '';


    const ordenarPorInicioOferecimento = () => {

        if (selecionados.length === 0) {

            alert('Selecione algum oferecimento para editar.');

            return;

        }

        const selecionadosOrdenados = oferecimentos

            .filter(o => selecionados.includes(Number(o.id)))

            .sort((a, b) => new Date(String(a.dataInicio ?? '')).getTime() - new Date(String(b.dataInicio ?? '')).getTime());

        irParaEdicao(selecionadosOrdenados.map(o => Number(o.id)));

    };


    const ordenarPorListagemTabela = () => {

        if (oferecimentos.length === 0) {

            alert('Não existem oferecimentos cadastrados para este grupo.');

            return;

        }

        irParaEdicao(oferecimentos.map(o => Number(o.id)));

    };


    const ordenarPorSelecionado = () => {

        if (selecionados.length === 0) {

            alert('Selecione algum oferecimento para editar.');

            return;

        }

        irParaEdicao([...selecionados]);

    };


    const fecharSelecao = () => {

        setSelecaoDialog({open: false, entity: null});

        setSelecionados([]);

    };


    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Oferecimento Curso</h1>

                <div className="data-table-toolbar" style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                </div>

                <div className="data-table">

                    {q.isError ? (

                        <p>Erro ao carregar os oferecimentos.</p>

                    ) : (

                        <table>

                            <thead>

                            <tr>

                                {COLUMNS.map((column) => (

                                    <th key={column.key}>{column.label}</th>

                                ))}

                                <th className="col-actions">Relatórios</th>
                            <th className="col-actions">Editar</th>
                            <th className="col-actions">Remover</th>

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

                                    const record = asRecord(item);

                                    const id = Number(record.id);


                                    const relatoriosItems: RowMenuItem[] = [

                                        {

                                            key: 'info',

                                            label: 'Informações',

                                            className: 'btnyellow',

                                            onSelect: () => handleInfo(record),

                                        },

                                    ];


                                     const editarItems: RowMenuItem[] = [

                                         {

                                             key: 'selecionar',

                                             label: 'Selecionar Oferecimentos para Editar',

                                             className: 'btnblue',

                                             onSelect: () => handleSelecao(record),

                                         },

                                         {

                                             key: 'editarTodos',

                                             label: 'Editar Todos',

                                             className: 'btngreen',

                                             onSelect: () => window.location.href = `/view/oferecimentoComponenteCurricular/formOferecimentoCurso?id=${id}`,

                                         },

                                     ];


                                     const removerItems: RowMenuItem[] = [

                                         {

                                             key: 'excluir',

                                             label: 'Excluir',

                                             className: 'btnred',

                                             onSelect: () => handleDelete(record),

                                         },

                                     ];


                                     return (

                                         <tr key={id}>

                                             {COLUMNS.map((column) => (

                                                 <td key={column.key}>

                                                     {column.render ? column.render(item) : String(record[column.key] ?? '')}

                                                 </td>

                                             ))}

                                              <td className="col-actions">
                                                  <div className="row-actions-menu">
                                                      {acessoRelatorios && (
                                                          <RowMenu icon={<i className="fa fa-info-circle"/>}
                                                                   className="btnyellow" title="Relatórios"
                                                                   items={relatoriosItems}/>
                                                      )}
                                                  </div>
                                              </td>
                                               <td className="col-actions">
                                                   <div className="row-actions-menu">
                                                       {acessoEditar && (
                                                           <RowMenu icon={<i className="fa fa-pencil"/>}
                                                                    className="btngreen" title="Editar"
                                                                    items={editarItems}/>
                                                       )}
                                                   </div>
                                               </td>
                                              <td className="col-actions">
                                                  <div className="row-actions-menu">
                                                      {acessoRemover && (
                                                          <RowMenu icon={<i className="fa fa-trash"/>}
                                                                   className="btnred" title="Remover"
                                                                   items={removerItems}/>
                                                      )}
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

                                        <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(0); }}>

                                            {PAGE_SIZES.map(option => <option key={option} value={option}>{option}</option>)}

                                        </select>

                                    </label>

                                    <span>Total: {totalElements}</span>

                                </td>

                            </tr>

                            </tfoot>

                        </table>

                    )}


                    {/* Info Dialog */}

                    {infoDialog.open && infoDialog.entity && (

                        <div className="modal-overlay" onClick={() => setInfoDialog({open: false, entity: null})}>

                            <div className="modal form-modal" onClick={e => e.stopPropagation()}>

                                <div className="div_form">

                                    <div className="form-title">Informações do Oferecimento de Curso</div>

                                    <div className="table_form">

                                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px'}}>

                                            <div><strong>Grupo:</strong> {infoDialog.entity.nome}</div>

                                            <div><strong>Unidade:</strong> {infoDialog.entity.unidade_sucinto}</div>

                                            <div><strong>Curso:</strong> {infoDialog.entity.curso_nome}</div>

                                        </div>

                                        <h4>Dias de Aula</h4>

                                        <table className="master-detail-table">

                                            <thead>

                                            <tr><th>Dia Semana</th><th>Turno</th><th>Tempo Aula</th></tr>

                                            </thead>

                                            <tbody>

                                            <tr><td colSpan={3} style={{textAlign: 'center', color: '#666'}}>Dados de dias de aula carregados do servidor</td></tr>

                                            </tbody>

                                        </table>

                                        <h4 style={{marginTop: '16px'}}>Componentes Curriculares</h4>

                                        <table className="master-detail-table">

                                            <thead>

                                            <tr><th>Componente Curricular</th><th>Sala</th><th>Professor</th><th>Início</th><th>Fim</th></tr>

                                            </thead>

                                            <tbody>

                                            <tr><td colSpan={5} style={{textAlign: 'center', color: '#666'}}>Componentes carregados do servidor</td></tr>

                                            </tbody>

                                        </table>

                                        <div className="form-footer" style={{marginTop: '16px'}}>

                                            <button type="button" className="btn-form-back" onClick={() => setInfoDialog({open: false, entity: null})}>Fechar</button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Seleção Dialog */}

                    {selecaoDialog.open && selecaoDialog.entity && (

                        <div className="modal-overlay" onClick={() => setSelecaoDialog({open: false, entity: null})}>

                            <div className="modal form-modal" style={{maxWidth: '900px'}} onClick={e => e.stopPropagation()}>

                                <div className="div_form">

                                    <div className="form-title">Selecione oferecimentos para edição</div>

                                    <div className="table_form">

                                        <table className="master-detail-table">

                                            <thead>

                                            <tr>

                                                <th style={{width: '40px'}}><input type="checkbox" checked={selecionados.length === oferecimentos.length && oferecimentos.length > 0} onChange={e => selectAll(e.target.checked)}/></th>

                                                <th>Turma</th>

                                                <th>Componente Curricular</th>

                                                <th>Sala</th>

                                                <th>Inscritos / Vagas</th>

                                                <th>Data Início</th>

                                                <th>Data Fim</th>

                                                <th>Data Cancelamento</th>

                                                <th>Professor</th>

                                            </tr>

                                            </thead>

                                            <tbody>

                                            {oferecimentosLoading ? (

                                                <tr>

                                                    <td colSpan={9} style={{textAlign: 'center', color: '#666'}}>Carregando oferecimentos...</td>

                                                </tr>

                                            ) : oferecimentos.length === 0 ? (

                                                <tr>

                                                    <td colSpan={9} style={{textAlign: 'center', color: '#666'}}>Nenhum oferecimento cadastrado para este grupo.</td>

                                                </tr>

                                            ) : (

                                                oferecimentos.map((item) => {

                                                const itemId = Number(item.id);

                                                const isSelected = selecionados.includes(itemId);

                                                return (

                                                    <tr key={itemId}>

                                                        <td style={{textAlign: 'center'}}>

                                                            <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(itemId)}/>

                                                        </td>

                                                        <td>{item.id}</td>

                                                        <td>{item.componenteCurricular_descricao ?? ''}</td>

                                                        <td>{item.sala_descricao ?? ''}</td>

                                                        <td>{item.inscritos ?? 0} / {item.vagas ?? 0}</td>

                                                        <td>{fmtData(item.dataInicio)}</td>

                                                        <td>{fmtData(item.dataFim)}</td>

                                                        <td>{fmtData(item.dataCancelamento)}</td>

                                                        <td>{item.professor_descricao ?? ''}</td>

                                                    </tr>

                                                );

                                            })

                                            )}

                                            </tbody>

                                        </table>

                                        <div className="form-footer" style={{marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'flex-end'}}>

                                            <button type="button" className="btnblue" onClick={ordenarPorInicioOferecimento}>

                                                Ordem pelo início oferecimento

                                            </button>

                                            <button type="button" className="btnstop" onClick={ordenarPorListagemTabela}>

                                                Ordem pela listagem tabela

                                            </button>

                                            <button type="button" className="btngreen" onClick={ordenarPorSelecionado}>

                                                Ordem conforme selecionando

                                            </button>

                                            <button type="button" className="btn-form-back" onClick={fecharSelecao}>

                                                Cancelar

                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Delete Dialog */}

                    {deleteDialog.open && deleteDialog.entity && (

                        <div className="modal-overlay" onClick={() => setDeleteDialog({open: false, entity: null})}>

                            <div className="modal form-modal" onClick={e => e.stopPropagation()}>

                                <div className="div_form">

                                    <div className="form-title">Confirmação</div>

                                    <div className="table_form">

                                        <p>Tem certeza que deseja excluir este oferecimento de curso?</p>

                                        <div className="form-footer" style={{marginTop: '16px'}}>

                                            <button type="button" className="btnred" onClick={confirmDelete}>Sim</button>

                                            <button type="button" className="btn-form-back" onClick={() => setDeleteDialog({open: false, entity: null})}>Não</button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}

                </div>

            </main>

        </PermissionGate>

    );

}