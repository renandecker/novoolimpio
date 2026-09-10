import {useState} from 'react';

import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api} from '../../../shared/services/api';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';



const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;



const apiErrorMessage = (error: unknown): string =>

    (error as { response?: { data?: { error?: string } } })?.response?.data?.error

        ?? (error as Error)?.message

        ?? 'erro desconhecido';



const COLUMNS: DataTableColumn[] = [

    {key: 'descricao', label: 'Nome'},

    {key: 'cep', label: 'CEP'},

    {key: 'bairro_descricao', label: 'Bairro'},

    {key: 'cidade_descricao', label: 'Cidade'},

    {key: 'estado_descricao', label: 'Estado'},

    {key: 'estado_uf', label: 'UF'},

    {key: 'tipo', label: 'Tipo'},

    {key: 'complemento', label: 'Complemento'},

    {key: 'latitude', label: 'Latitude'},

    {key: 'longitude', label: 'Longitude'},

];



export default function ViewLogradouroListLogradouroListScreen() {

    const [trocaEntity, setTrocaEntity] = useState<ApiItem | null>(null);

    const [aviso, setAviso] = useState('');



    // Equivalente a #{logradouroController.atualizarLogradouro(entity, null)} do listLogradouro.xhtml:

    // reconsulta os Correios pelo CEP do registro.

    const atualizarLogradouro = async (item: ApiItem) => {

        setAviso('');

        try {

            await api.post('/api/basico/logradouro/atualizar-logradouro', null,

                {params: {logradouroId: item.id}});

            setAviso(`Logradouro #${item.id} atualizado junto aos Correios.`);

        } catch (error) {

            setAviso(`Falha ao atualizar o logradouro #${item.id}: ${apiErrorMessage(error)}`);

        }

    };



    const abrirTroca = (item: ApiItem) => {

        setAviso('');

        setTrocaEntity(item);

    };



    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Logradouro</h1>

                {aviso && <p className="data-table-notice">{aviso}</p>}

                <DataTable

                    path="/api/view/logradouro/listLogradouro"

                    columns={COLUMNS}

                    maxMainColumns={6}

                    editNavigateTo="/view/logradouro/formLogradouro"

                    createNavigateTo="/view/logradouro/formLogradouro"

                    extraRowActions={[

                        {

                            key: 'atualizar',

                            title: 'Atualizar logradouro',

                            className: 'btnblack',

                            icon: <i className="fa fa-refresh"/>,

                            permission: 'UPDATE',

                            onClick: atualizarLogradouro,

                        },

                        {

                            key: 'troca',

                            title: 'Troca e remove logradouro',

                            className: 'btnorange',

                            icon: <i className="fa fa-random"/>,

                            permission: 'DELETE',

                            onClick: abrirTroca,

                        },

                    ]}

                />

                {trocaEntity && (

                    <TrocaLogradouroDialog

                        entity={trocaEntity}

                        onClose={() => setTrocaEntity(null)}

                    />

                )}

            </main>

        </PermissionGate>

    );

}



/** Espelha o diálogo p:dialog widgetVar="trocaLogradouro" do listLogradouro.xhtml. */

function TrocaLogradouroDialog({entity, onClose}: { entity: ApiItem; onClose: () => void }) {

    const record = asRecord(entity);

    const destinoId = Number(record.id);

    const [selecao, setSelecao] = useState<AutoCompleteOption | null>(null);

    const [lista, setLista] = useState<AutoCompleteOption[]>([]);

    const [salvando, setSalvando] = useState(false);

    const [erro, setErro] = useState('');



    const buscarOpcoes = async (query: string): Promise<AutoCompleteOption[]> => {

        if (!query.trim()) return [];

        const {data} = await api.get<Array<{ id: number; descricao: string }>>(

            '/api/basico/logradouro/auto-complete-logradouro-troca-opcoes',

            {params: {query, excluirId: destinoId}},

        );

        return (data ?? []).map((item) => ({id: item.id, label: item.descricao || `#${item.id}`}));

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

            setErro('Adicione ao menos um logradouro para trocar.');

            return;

        }

        setSalvando(true);

        setErro('');

        try {

            await api.post('/api/basico/logradouro/trocar-logradouros', {

                destinoId,

                origemIds: lista.map((item) => item.id),

            });

            alert('Logradouros trocados com sucesso');

            onClose();

        } catch (error) {

            setErro(`Ocorreu um erro ao trocar logradouros: ${apiErrorMessage(error)}`);

        } finally {

            setSalvando(false);

        }

    };



    return (

        <div className="modal-overlay" onClick={onClose}>

            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>

                <div className="div_form">

                    <div className="form-title">Troca e remoção logradouro</div>

                    <div className="table_form">

                        <div className="form-grid">

                            <div className="form-field">

                                <span className="form-label">Id</span>

                                <span>{String(record.id ?? '')}</span>

                            </div>

                            <div className="form-field">

                                <span className="form-label">Nome</span>

                                <span>{String(record.descricao ?? '')}</span>

                            </div>

                            <div className="form-field">

                                <span className="form-label">CEP</span>

                                <span>{String(record.cep ?? '')}</span>

                            </div>

                            <div className="form-field">

                                <span className="form-label">Estado</span>

                                <span>{String(record.estado_descricao ?? '')}</span>

                            </div>

                            <div className="form-field">

                                <span className="form-label">Cidade</span>

                                <span>{String(record.cidade_descricao ?? '')}</span>

                            </div>

                            <div className="form-field">

                                <span className="form-label">Bairro</span>

                                <span>{String(record.bairro_descricao ?? '')}</span>

                            </div>

                        </div>



                        <fieldset className="form-fieldset">

                            <legend>Logradouros removidos e alterados</legend>

                            <label className="form-field">

                                <span className="form-label">Logradouro</span>

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

                                                    Ã—

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

                            <button type="button" className="btnblue" title="Trocar e remover logradouros"

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

