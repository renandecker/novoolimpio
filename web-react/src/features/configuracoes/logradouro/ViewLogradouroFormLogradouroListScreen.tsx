import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {api} from '../../../shared/services/api';

import {AutoComplete} from '../../../shared/components/AutoComplete';

import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';



interface ViaCepResposta {

    erro?: boolean;

    cep?: string;

    logradouro?: string;

    bairro?: string;

    localidade?: string;

    uf?: string;

}



const formatarCep = (value: string): string => {

    const digitos = value.replace(/\D/g, '').slice(0, 8);

    if (digitos.length <= 5) return digitos;

    return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;

};



const apiErrorMessage = (error: unknown): string =>

    (error as { response?: { data?: { error?: string } } })?.response?.data?.error

        ?? (error as Error)?.message

        ?? 'erro desconhecido';



export default function ViewLogradouroFormLogradouroListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idEdicao = searchParams.get('id');



    const [carregando, setCarregando] = useState(!!idEdicao);

    const [salvando, setSalvando] = useState(false);

    const [buscando, setBuscando] = useState(false);

    const [mensagem, setMensagem] = useState('');



    const [cep, setCep] = useState('');

    const [descricao, setDescricao] = useState('');

    const [tipo, setTipo] = useState('');

    const [complemento, setComplemento] = useState('');

    const [longitude, setLongitude] = useState('');

    const [latitude, setLatitude] = useState('');

    const [estado, setEstado] = useState<AutoCompleteOption | null>(null);

    const [cidade, setCidade] = useState<AutoCompleteOption | null>(null);

    const [bairro, setBairro] = useState<AutoCompleteOption | null>(null);



    useEffect(() => {

        if (!idEdicao) return;

        let ativo = true;

        (async () => {

            try {

                const ent = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idEdicao}`)).data;

                if (!ativo) return;

                setCep(String(ent.cep ?? ''));

                setDescricao(String(ent.descricao ?? ''));

                setTipo(String(ent.tipo ?? ''));

                setComplemento(String(ent.complemento ?? ''));

                setLongitude(String(ent.longitude ?? ''));

                setLatitude(String(ent.latitude ?? ''));

                const bairroId = ent.bairroId as number | null | undefined;

                if (bairroId) {

                    const dadosBairro = (await api.get<{ id: number; descricao: string; cidadeId: number | null }>(

                        `/api/basico/bairro/${bairroId}`)).data;

                    if (!ativo) return;

                    setBairro({id: dadosBairro.id, label: dadosBairro.descricao || `#${dadosBairro.id}`});

                    if (dadosBairro.cidadeId) {

                        const dadosCidade = (await api.get<{ id: number; nome: string; estadoId: number | null }>(

                            `/api/basico/cidade/${dadosBairro.cidadeId}`)).data;

                        if (!ativo) return;

                        setCidade({id: dadosCidade.id, label: dadosCidade.nome || `#${dadosCidade.id}`});

                        if (dadosCidade.estadoId) {

                            const dadosEstado = (await api.get<{ id: number; nome: string; uf: string }>(

                                `/api/basico/estado/${dadosCidade.estadoId}`)).data;

                            if (!ativo) return;

                            setEstado({

                                id: dadosEstado.id,

                                label: `${dadosEstado.nome} (${dadosEstado.uf ?? ''})`,

                            });

                        }

                    }

                }

            } catch (erro) {

                console.error('Erro ao carregar logradouro:', erro);

                alert('Não foi possível carregar o logradouro para edição');

            } finally {

                if (ativo) setCarregando(false);

            }

        })();

        return () => {

            ativo = false;

        };

    }, [idEdicao]);



    const buscarEstadoPorUf = async (uf: string): Promise<AutoCompleteOption | null> => {

        const {data} = await api.get<Array<{ id: number; nome: string; uf: string }>>(

            '/api/basico/estado/opcoes', {params: {query: uf}});

        const achado = (data ?? []).find((item) => item.uf?.toUpperCase() === uf.toUpperCase());

        return achado ? {id: achado.id, label: `${achado.nome} (${achado.uf})`} : null;

    };



    // Equivalente a #{logradouroController.buscarEnderecoCadastro(cep)} do formLogradouro.xhtml:

    // preenche rua, estado, cidade e bairro a partir do CEP.

    const handleBuscarCep = async () => {

        const digitos = cep.replace(/\D/g, '');

        if (digitos.length !== 8) {

            setMensagem('Informe um CEP com 8 dígitos.');

            return;

        }

        setBuscando(true);

        setMensagem('');

        try {

            const resposta = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);

            const dados = (await resposta.json()) as ViaCepResposta;

            if (!resposta.ok || dados.erro) {

                setMensagem('Não foi encontrado esse cep nos correios');

                return;

            }

            setDescricao(dados.logradouro ?? '');

            let estadoAchado: AutoCompleteOption | null = null;

            if (dados.uf) {

                estadoAchado = await buscarEstadoPorUf(dados.uf);

                setEstado(estadoAchado);

            }

            let cidadeAchada: AutoCompleteOption | null = null;

            if (estadoAchado && dados.localidade) {

                const {data} = await api.get<Array<{ id: number; nome: string }>>(

                    '/api/basico/cidade/opcoes',

                    {params: {query: dados.localidade, estadoId: estadoAchado.id}});

                const encontrada = (data ?? []).find(

                    (item) => item.nome?.toLowerCase() === String(dados.localidade).toLowerCase());

                cidadeAchada = encontrada ? {id: encontrada.id, label: encontrada.nome} : null;

                setCidade(cidadeAchada);

            }

            if (cidadeAchada && dados.bairro) {

                const {data} = await api.get<Array<{ id: number; descricao: string }>>(

                    '/api/basico/bairro/opcoes',

                    {params: {query: dados.bairro, cidadeId: cidadeAchada.id}});

                const encontrado = (data ?? []).find(

                    (item) => item.descricao?.toLowerCase() === String(dados.bairro).toLowerCase());

                setBairro(encontrado ? {id: encontrado.id, label: encontrado.descricao || `#${encontrado.id}`} : null);

            } else {

                setBairro(null);

            }

            setMensagem('CEP identificado no correio');

        } catch (error) {

            setMensagem(`Não foi possível consultar o CEP: ${apiErrorMessage(error)}`);

        } finally {

            setBuscando(false);

        }

    };



    const buscarEstados = async (query: string): Promise<AutoCompleteOption[]> => {

        const {data} = await api.get<Array<{ id: number; nome: string; uf: string }>>(

            '/api/basico/estado/opcoes', {params: {query}});

        return (data ?? []).map((item) => ({id: item.id, label: `${item.nome} (${item.uf ?? ''})`}));

    };



    const buscarCidades = async (query: string): Promise<AutoCompleteOption[]> => {

        const {data} = await api.get<Array<{ id: number; nome: string; estadoId: number | null }>>(

            '/api/basico/cidade/opcoes',

            {params: {query, estadoId: estado?.id}});

        return (data ?? []).map((item) => ({id: item.id, label: item.nome || `#${item.id}`}));

    };



    const buscarBairros = async (query: string): Promise<AutoCompleteOption[]> => {

        const {data} = await api.get<Array<{ id: number; descricao: string }>>(

            '/api/basico/bairro/opcoes',

            {params: {query, cidadeId: cidade?.id}});

        return (data ?? []).map((item) => ({id: item.id, label: item.descricao || `#${item.id}`}));

    };



    const voltar = () => navigate('/view/logradouro/listLogradouro');



    const salvar = async (voltarDepois: boolean) => {

        if (!descricao.trim()) {

            alert('Informe o nome da rua.');

            return;

        }

        if (!bairro) {

            alert('Selecione o bairro.');

            return;

        }

        setSalvando(true);

        try {

            const body = {

                descricao: descricao.trim(),

                cep: cep.replace(/\D/g, '').length === 8 ? cep : (cep || null),

                tipo: tipo || null,

                complemento: complemento || null,

                local: null,

                longitude: longitude || null,

                latitude: latitude || null,

                bairroId: bairro.id,

            };

            if (idEdicao) {

                await api.put(`/api/basico/logradouro/${idEdicao}`, body);

            } else {

                await api.post('/api/basico/logradouro', body);

            }

            alert('Registro salvo com sucesso.');

            if (voltarDepois) voltar();

        } catch (error) {

            alert(`Erro ao salvar o logradouro: ${apiErrorMessage(error)}`);

        } finally {

            setSalvando(false);

        }

    };



    if (carregando) {

        return (

            <PermissionGate permission="READ">

                <main>

                    <h1>Logradouro</h1>

                    <div className="div_form">

                        <p className="master-detail-empty">Carregando...</p>

                    </div>

                </main>

            </PermissionGate>

        );

    }



    return (

        <PermissionGate permission="READ">

            <main>

                <h1>{idEdicao ? `Editar Logradouro #${idEdicao}` : 'Logradouro'}</h1>

                <div className="div_form">

                    <div className="form-title">{idEdicao ? `Logradouro #${idEdicao}` : 'Novo Logradouro'}</div>

                    <div className="table_form">

                        <div className="form-grid">

                            <label className="form-field">

                                <span className="form-label">Id</span>

                                <input className="form-input" value={idEdicao ?? ''} disabled/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">CEP</span>

                                <div style={{display: 'flex', gap: '8px'}}>

                                    <input

                                        className="form-input"

                                        style={{width: '120px'}}

                                        placeholder="99999-999"

                                        maxLength={9}

                                        value={cep}

                                        onChange={(event) => {

                                            setMensagem('');

                                            setCep(formatarCep(event.target.value));

                                        }}

                                    />

                                    <button type="button" className="btnyellow" title="Buscar Logradouro, Bairro, Cidade e Estado"

                                            disabled={buscando} onClick={() => void handleBuscarCep()}>

                                        {buscando ? 'Verificando...' : 'Busca'}

                                    </button>

                                </div>

                                {mensagem && <small style={{color: '#c0392b'}}>{mensagem}</small>}

                            </label>

                            <label className="form-field">

                                <span className="form-label">Rua *</span>

                                <input className="form-input" value={descricao}

                                       onChange={(event) => setDescricao(event.target.value)}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Estado</span>

                                <AutoComplete placeholder="Digite para buscar (mínimo 3 caracteres)"

                                              value={estado}

                                              onChange={(option) => {

                                                  setEstado(option);

                                                  if (!option) {

                                                      setCidade(null);

                                                      setBairro(null);

                                                  }

                                              }}

                                              fetchOptions={buscarEstados}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Cidade</span>

                                <AutoComplete placeholder="Digite para buscar (mínimo 3 caracteres)"

                                              value={cidade}

                                              onChange={(option) => {

                                                  setCidade(option);

                                                  if (!option) setBairro(null);

                                              }}

                                              fetchOptions={buscarCidades}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Bairro *</span>

                                <AutoComplete placeholder="Digite para buscar (mínimo 3 caracteres)"

                                              value={bairro}

                                              onChange={setBairro}

                                              fetchOptions={buscarBairros}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Tipo</span>

                                <input className="form-input" value={tipo}

                                       onChange={(event) => setTipo(event.target.value)}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Complemento</span>

                                <input className="form-input" value={complemento}

                                       onChange={(event) => setComplemento(event.target.value)}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Longitude *</span>

                                <input className="form-input" value={longitude}

                                       onChange={(event) => setLongitude(event.target.value)}/>

                            </label>

                            <label className="form-field">

                                <span className="form-label">Latitude *</span>

                                <input className="form-input" value={latitude}

                                       onChange={(event) => setLatitude(event.target.value)}/>

                            </label>

                        </div>

                        <div className="form-buttons">

                            <button type="button" className="btnblue" title="Salvar registro"

                                    disabled={salvando} onClick={() => void salvar(true)}>

                                Gravar

                            </button>

                            <button type="button" className="btnstop" title="Salvar e continuar editando"

                                    disabled={salvando} onClick={() => void salvar(false)}>

                                Salvar e Continuar

                            </button>

                            <button type="button" className="btnyellow" title="Voltar para a lista"

                                    onClick={voltar} disabled={salvando}>

                                Voltar

                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

