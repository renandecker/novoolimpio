import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';
import {useState, useEffect, useCallback, useMemo} from 'react';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {Tabs} from '../../../shared/components/Tabs';
import {Wizard} from '../../../shared/components/Wizard';
import {Modal} from '../../../shared/components/Modal';

interface ContratoAutoCompleteResponse {
    id: number;
    nome: string;
}

interface CurriculoResponse {
    id: number;
    sucinto: string;
    curso: { nome: string };
    tipoCurso: { descricao: string };
    cargaHoraria: number;
}

interface UnidadeResponse {
    id: number;
    sucinto: string;
}

interface PessoaFisicaResponse {
    id: number;
    pessoaId?: number;
    nome: string;
    cpf: string;
}

interface PessoaJuridicaResponse {
    id: number;
    nomeFantasia: string;
    cnpj: string;
}

interface OferecimentoGrupo {
    id: number;
    grupo: string;
    unidade: { sucinto: string };
    horario: string;
    selected: boolean;
    oferecimentosSelecionado?: OferecimentoItem[];
}

interface OferecimentoItem {
    id: number;
    status: string;
    unidade: { sucinto: string };
    sala: { numero: string };
    componenteCurricular: { descricao: string; cargaHoraria: number };
    dataInicio: string;
    dataFim: string;
    professor?: { pessoa?: { pessoaFisica?: { nome: string }; pessoaJuridica?: { nomeFantasia: string } } };
    disabledComponenteCurricular?: boolean;
    disabledConflitoDia?: boolean;
    disabledRequisito?: boolean;
    motivo?: string;
    selected?: boolean;
}

interface FiltroMatricula {
    unidadeId?: number;
    turnoEducacaoId?: number;
    diaSemanaId?: number;
    curriculoId?: number;
    tipoMatricula: 'GRUPO' | 'LIVRE';
}

interface FormaPagamentoResponse {
    id: number;
    vezes: number;
    juros: number | null;
    desconto: number | null;
    multa?: number | null;
    ativo: boolean;
    ajuste: boolean;
}

interface ParcelaLinha {
    parcela: number;
    descricao: string;
    dataVencimento: string;
    valor: number;
    editavel: boolean;
}

function addMonths(iso: string, months: number): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, m - 1 + months, d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

function formatDate(iso: string): string {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function toAutoCompleteOption(item: { id: number; nome?: string; nomeFantasia?: string; cpf?: string; cnpj?: string; sucinto?: string; curso?: { nome: string } }): AutoCompleteOption {
    const label = item.nome
        ? `${item.nome} (${item.cpf || ''})`
        : item.nomeFantasia
        ? `${item.nomeFantasia} (${item.cnpj || ''})`
        : item.sucinto
        ? `${item.sucinto} - ${item.curso?.nome || ''}`
        : `#${item.id}`;
    return { id: item.id, label };
}

interface CurriculoOption extends AutoCompleteOption {
    sucinto?: string;
    cursoNome?: string;
    tipoCurso?: string;
    cargaHoraria?: number;
}

function toCurriculoOption(item: CurriculoResponse): CurriculoOption {
    const label = [
        item.sucinto,
        item.curso?.nome,
        item.tipoCurso?.descricao ? `(${item.tipoCurso.descricao})` : '',
        item.cargaHoraria ? `${item.cargaHoraria} H/A` : '',
    ]
        .filter(Boolean)
        .join(' - ');
    return {
        id: item.id,
        label: label || `#${item.id}`,
        sucinto: item.sucinto,
        cursoNome: item.curso?.nome,
        tipoCurso: item.tipoCurso?.descricao,
        cargaHoraria: item.cargaHoraria,
    };
}

function buildParcelas(fp: FormaPagamentoResponse | null, primeira: string, segunda: string, valorTotalParcela: number): ParcelaLinha[] {
    if (!fp || !primeira) return [];
    const vezes = fp.vezes > 0 ? fp.vezes : 1;
    const base = segunda || primeira;
    const rows: ParcelaLinha[] = [];
    for (let i = 0; i <= vezes; i++) {
        const data = i === 0 ? primeira : addMonths(base, segunda ? i - 1 : i);
        rows.push({
            parcela: i,
            descricao: i === 0 ? 'Taxa Inscrição' : 'Matrícula Parcelada',
            dataVencimento: data,
            valor: i === 0 ? 0 : Math.round((valorTotalParcela / vezes) * 100) / 100,
            editavel: false,
        });
    }
    return rows;
}

const formatCEP = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
};

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

interface PessoaFisicaFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    editId: number | null;
    onClose: () => void;
    onSaved: (pessoaId: number) => void;
}

function PessoaFisicaFormModal({open, mode, editId, onClose, onSaved}: PessoaFisicaFormModalProps) {
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | undefined>();

    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [rg, setRg] = useState('');
    const [email, setEmail] = useState('');
    const [nomeSocial, setNomeSocial] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [telefoneResidencial, setTelefoneResidencial] = useState('');
    const [telefoneComercial, setTelefoneComercial] = useState('');
    const [celular, setCelular] = useState('');
    const [nomePai, setNomePai] = useState('');
    const [nomeMae, setNomeMae] = useState('');
    const [observacao, setObservacao] = useState('');
    const [nomeReferencia, setNomeReferencia] = useState('');
    const [telefoneReferencia, setTelefoneReferencia] = useState('');
    const [celularReferencia, setCelularReferencia] = useState('');
    const [nomeReferencia2, setNomeReferencia2] = useState('');
    const [telefoneReferencia2, setTelefoneReferencia2] = useState('');
    const [celularReferencia2, setCelularReferencia2] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [telegran, setTelegran] = useState('');

    // Endereço
    const [cep, setCep] = useState('');
    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption | null>(null);
    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption | null>(null);
    const [logradouroOpt, setLogradouroOpt] = useState<AutoCompleteOption | null>(null);
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [logradouroId, setLogradouroId] = useState<number | undefined>();
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [enderecoAviso, setEnderecoAviso] = useState('');

    // Combos via autocomplete
    const [generoOpt, setGeneroOpt] = useState<AutoCompleteOption | null>(null);
    const [etniaOpt, setEtniaOpt] = useState<AutoCompleteOption | null>(null);
    const [estadoCivilOpt, setEstadoCivilOpt] = useState<AutoCompleteOption | null>(null);
    const [escolaridadeOpt, setEscolaridadeOpt] = useState<AutoCompleteOption | null>(null);
    const [cidadeOrigemOpt, setCidadeOrigemOpt] = useState<AutoCompleteOption | null>(null);

    const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);

    const reset = () => {
        setNome(''); setCpf(''); setRg(''); setEmail(''); setNomeSocial('');
        setDataNascimento(''); setTelefoneResidencial(''); setTelefoneComercial('');
        setCelular(''); setNomePai(''); setNomeMae(''); setObservacao('');
        setNomeReferencia(''); setTelefoneReferencia(''); setCelularReferencia('');
        setNomeReferencia2(''); setTelefoneReferencia2(''); setCelularReferencia2('');
        setFacebook(''); setTwitter(''); setTelegran('');
        setCep(''); setCidadeOpt(null); setBairroOpt(null); setLogradouroOpt(null);
        setNumero(''); setComplemento(''); setLogradouroId(undefined); setEnderecoAviso('');
        setGeneroOpt(null); setEtniaOpt(null); setEstadoCivilOpt(null); setEscolaridadeOpt(null); setCidadeOrigemOpt(null);
        setPfId(undefined); setPessoaId(undefined); setPfOriginal(null); setPessoaOriginal(null);
        setErro(undefined);
    };

    const fetchCidades = async (q: string): Promise<AutoCompleteOption[]> => {
        if (!q) return [];
        const {data} = await api.get<any[]>('/api/basico/cidade/autoComplete', {params: {query: q}});
        return data.map((e: any) => ({id: e.id, label: e.cidadeEstado ?? e.nome}));
    };

    const fetchBairros = async (q: string): Promise<AutoCompleteOption[]> => {
        const params: any = {query: q};
        if (cidadeOpt?.id) params.cidadeId = cidadeOpt.id;
        const {data} = await api.get<any[]>('/api/basico/bairro/auto-complete', {params});
        return data.map((e: any) => ({id: e.id, label: e.descricao}));
    };

    const fetchLogradouros = async (q: string): Promise<AutoCompleteOption[]> => {
        const params: any = {query: q};
        if (bairroOpt?.id) params.bairroId = bairroOpt.id;
        const {data} = await api.get<any[]>('/api/basico/logradouro/auto-complete', {params});
        return data.map((e: any) => ({id: e.id, label: e.descricao}));
    };

    const fetchGenero = async (_q: string): Promise<AutoCompleteOption[]> => {
        try {
            const {data} = await api.get<any[]>('/api/basico/genero');
            return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
        } catch {
            return [{id: 1, label: 'Masculino'}, {id: 2, label: 'Feminino'}];
        }
    };

    const fetchEtnia = async (_q: string): Promise<AutoCompleteOption[]> => {
        try {
            const {data} = await api.get<any[]>('/api/basico/etnia');
            return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
        } catch {
            return [{id: 1, label: 'Branca'}, {id: 2, label: 'Preta'}, {id: 3, label: 'Parda'}, {id: 4, label: 'Amarela'}, {id: 5, label: 'Indígena'}];
        }
    };

    const fetchEstadoCivil = async (q: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<any[]>('/api/basico/estado-civil/auto-complete', {params: {query: q}});
        return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
    };

    const fetchEscolaridade = async (q: string): Promise<AutoCompleteOption[]> => {
        const {data} = await api.get<any[]>('/api/basico/escolaridade/auto-complete', {params: {query: q}});
        return data.map((e: any) => ({id: e.id, label: e.descricao ?? String(e.id)}));
    };

    const loadDadosPessoa = async () => {
        if (!editId) {
            reset();
            return;
        }
        setCarregando(true);
        try {
            const pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${editId}`)).data;
            let pes: Record<string, unknown> | null = null;
            if (pf.pessoaId) pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;

            setPfId(pf.id as number);
            setPfOriginal(pf);
            setPessoaId(pes?.id as number | undefined);
            setPessoaOriginal(pes);

            setNome(str(pf.nome));
            setCpf(str(pf.cpf));
            setRg(str(pf.rg));
            setEmail(str(pes?.email));
            setNomeSocial(str(pf.nomeSocial));
            setDataNascimento(toDateInput(pf.dataNascimento));
            setTelefoneResidencial(str(pes?.telefone));
            setTelefoneComercial(str(pf.telefoneComercial));
            setCelular(str(pes?.celular));
            setNomePai(str(pf.nomePai));
            setNomeMae(str(pf.nomeMae));
            setObservacao(str(pes?.observacao));
            setNomeReferencia(str(pf.nomeReferencia));
            setTelefoneReferencia(str(pf.telefoneReferencia));
            setCelularReferencia(str(pf.celularReferencia));
            setNomeReferencia2(str(pf.nomeReferencia2));
            setTelefoneReferencia2(str(pf.telefoneReferencia2));
            setCelularReferencia2(str(pf.celularReferencia2));
            setFacebook(str(pf.facebook));
            setTwitter(str(pf.twitter));
            setTelegran(str((pes as any)?.telegran ?? (pf as any)?.telegran));

            if (pf.generoId) setGeneroOpt({id: Number(pf.generoId), label: String(pf.generoId)});
            if (pf.etniaId) setEtniaOpt({id: Number(pf.etniaId), label: String(pf.etniaId)});
            if (pf.estadoCivilId) setEstadoCivilOpt({id: Number(pf.estadoCivilId), label: String(pf.estadoCivilId)});
            if (pf.escolaridadeId) setEscolaridadeOpt({id: Number(pf.escolaridadeId), label: String(pf.escolaridadeId)});
            if (pf.cidadeOrigemId) setCidadeOrigemOpt({id: Number(pf.cidadeOrigemId), label: String(pf.cidadeOrigemId)});

            // Endereço
            if (pes) {
                const cepVal = str(pes.cep);
                const numVal = str(pes.numero);
                const compVal = str(pes.complemento);
                const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number | undefined;
                setNumero(numVal);
                setComplemento(compVal);
                if (idLog) {
                    try {
                        const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                        setLogradouroId(logRes.id as number);
                        setLogradouroOpt({id: logRes.id as number, label: str(logRes.descricao)});
                        setCep(str(logRes.cep) ? formatCEP(str(logRes.cep)) : formatCEP(cepVal));
                        if (logRes.id_bairro) {
                            const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                            setBairroOpt({id: bRes.id as number, label: str(bRes.descricao)});
                            if ((bRes as any).cidadeId) {
                                setCidadeOpt({id: Number((bRes as any).cidadeId), label: String((bRes as any).cidadeId)});
                            }
                        }
                    } catch {
                        setCep(formatCEP(cepVal));
                    }
                } else if (cepVal) setCep(formatCEP(cepVal));
            }
        } catch (e) {
            console.error('Erro ao carregar pessoa física:', e);
            setErro('Erro ao carregar pessoa física.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (mode === 'create') {
                reset();
            } else {
                setCarregando(true);
            }
        }
    }, [open, mode, editId]);

    useEffect(() => {
        if (open && mode === 'edit' && editId) {
            loadDadosPessoa();
        }
    }, [open, mode, editId]);

    const buscarCep = async () => {
        const clean = cep.replace(/\D/g, '');
        if (clean.length !== 8) { setEnderecoAviso('CEP deve ter 8 dígitos'); return; }
        setBuscandoCep(true);
        setEnderecoAviso('');
        try {
            try {
                const {data} = await api.get<any>('/api/basico/logradouro/buscar-endereco-por-cep', {params: {cep: clean}});
                if (data?.logradouro) {
                    const l = data.logradouro;
                    setLogradouroOpt({id: l.id, label: l.descricao});
                    setLogradouroId(l.id);
                    if (data.bairro) setBairroOpt({id: data.bairro.id, label: data.bairro.descricao});
                    if (data.cidade) setCidadeOpt({id: data.cidade.id, label: data.cidade.nome ?? String(data.cidade.id)});
                    setCep(formatCEP(l.cep ?? clean));
                }
            } catch {
                const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`).then(r => r.json());
                if (!resp.erro) {
                    setEnderecoAviso('');
                    const cidades = await fetchCidades(resp.localidade);
                    const found = cidades.find(c => c.label.toLowerCase().includes(resp.localidade.toLowerCase()));
                    if (found) setCidadeOpt(found);
                    setBairroOpt(resp.bairro ? {id: -1, label: resp.bairro} : null);
                    setLogradouroOpt(resp.logradouro ? {id: -1, label: resp.logradouro} : null);
                    setCep(formatCEP(resp.cep ?? clean));
                } else setEnderecoAviso('CEP não encontrado');
            }
        } finally {
            setBuscandoCep(false);
        }
    };

    const salvar = async () => {
        if (!nome || !cpf) { setErro('Informe pelo menos Nome e CPF.'); return; }
        setSalvando(true);
        setErro(undefined);
        try {
            const pfBody: Record<string, unknown> = {
                ...(pfOriginal ?? {}),
                nome, cpf, rg: rg || null, nomeSocial: nomeSocial || null,
                dataNascimento: dataNascimento || null,
                generoId: generoOpt?.id ?? null,
                etniaId: etniaOpt?.id ?? null,
                estadoCivilId: estadoCivilOpt?.id ?? null,
                escolaridadeId: escolaridadeOpt?.id ?? null,
                cidadeOrigemId: cidadeOrigemOpt?.id ?? null,
                nomeReferencia: nomeReferencia || null,
                telefoneReferencia: telefoneReferencia || null,
                celularReferencia: celularReferencia || null,
                nomeReferencia2: nomeReferencia2 || null,
                telefoneReferencia2: telefoneReferencia2 || null,
                celularReferencia2: celularReferencia2 || null,
                nomePai: nomePai || null,
                nomeMae: nomeMae || null,
                telefoneComercial: telefoneComercial || null,
                facebook: facebook || null,
                twitter: twitter || null,
                googlePlus: (pfOriginal as any)?.googlePlus ?? null,
            };

            const respostaPf = pfId
                ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)
                : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId = ((respostaPf.data as Record<string, unknown>)?.id as number | undefined) ?? pfId;

            const pessoaBody: Record<string, unknown> = {
                ...(pessoaOriginal ?? {}),
                email: email || null,
                telefone: telefoneResidencial || null,
                celular: celular || null,
                observacao: observacao || null,
                cep: cep || null,
                numero: numero || null,
                complemento: complemento || null,
                logradouroId: logradouroId || null,
                telegran: telegran || null,
            };

            let novoPesId = pessoaId;
            if (pessoaId) {
                await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
            } else {
                novoPesId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;
            }

            if (!pfId && novoPesId && novoPfId) {
                await api.put(`/api/basico/pessoa-fisica/${novoPfId}`, {...pfBody, pessoaId: novoPesId});
            }

            onSaved(novoPfId ?? 0);
            onClose();
        } catch (e) {
            console.error('Erro ao salvar pessoa física:', e);
            setErro('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const inputStyle: React.CSSProperties = {width: '100%', padding: '7px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px'};
    const labelStyle: React.CSSProperties = {display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333'};
    const grid: React.CSSProperties = {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'};

    return (
        <Modal title={mode === 'edit' ? 'Editar Pessoa Física' : 'Criar Pessoa Física'} open={open} onClose={onClose} size="xl">
            {carregando ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#777'}}>Carregando dados da pessoa...</div>
            ) : (
                <div>
                    <div style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px'}}>
                        <div style={grid}>
                            <div>
                                <label style={labelStyle}>CPF *</label>
                                <input className="form-input" style={inputStyle} placeholder="999.999.999-99" value={cpf} onChange={e => setCpf(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>RG *</label>
                                <input className="form-input" style={inputStyle} placeholder="RG" value={rg} onChange={e => setRg(e.target.value)} />
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label style={labelStyle}>Nome *</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail *</label>
                                <input className="form-input" style={inputStyle} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome Social *</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome social" value={nomeSocial} onChange={e => setNomeSocial(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Data Nascimento *</label>
                                <input className="form-input" style={inputStyle} type="date" value={dataNascimento} onChange={e => setDataNascimento(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Gênero</label>
                                <AutoComplete placeholder="Selecione" value={generoOpt} onChange={setGeneroOpt} fetchOptions={fetchGenero} />
                            </div>
                            <div>
                                <label style={labelStyle}>Etnia</label>
                                <AutoComplete placeholder="Selecione" value={etniaOpt} onChange={setEtniaOpt} fetchOptions={fetchEtnia} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado Civil *</label>
                                <AutoComplete placeholder="Digite 3 letras..." value={estadoCivilOpt} onChange={setEstadoCivilOpt} fetchOptions={fetchEstadoCivil} />
                            </div>
                            <div>
                                <label style={labelStyle}>Escolaridade *</label>
                                <AutoComplete placeholder="Digite 3 letras..." value={escolaridadeOpt} onChange={setEscolaridadeOpt} fetchOptions={fetchEscolaridade} />
                            </div>
                            <div>
                                <label style={labelStyle}>Cidade Origem *</label>
                                <AutoComplete placeholder="Digite 3 letras..." value={cidadeOrigemOpt} onChange={setCidadeOrigemOpt} fetchOptions={fetchCidades} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone Residencial *</label>
                                <input className="form-input" style={inputStyle} placeholder="99-99999999" value={telefoneResidencial} onChange={e => setTelefoneResidencial(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone Comercial</label>
                                <input className="form-input" style={inputStyle} placeholder="99-99999999" value={telefoneComercial} onChange={e => setTelefoneComercial(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Celular *</label>
                                <input className="form-input" style={inputStyle} placeholder="99-999999999" value={celular} onChange={e => setCelular(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome Referência *</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome da referência" value={nomeReferencia} onChange={e => setNomeReferencia(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone Referência</label>
                                <input className="form-input" style={inputStyle} placeholder="99-99999999" value={telefoneReferencia} onChange={e => setTelefoneReferencia(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome Referência 2</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome da referência 2" value={nomeReferencia2} onChange={e => setNomeReferencia2(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone Referência 2</label>
                                <input className="form-input" style={inputStyle} placeholder="99-99999999" value={telefoneReferencia2} onChange={e => setTelefoneReferencia2(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Celular Referência</label>
                                <input className="form-input" style={inputStyle} placeholder="99-999999999" value={celularReferencia} onChange={e => setCelularReferencia(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Celular Referência 2</label>
                                <input className="form-input" style={inputStyle} placeholder="99-999999999" value={celularReferencia2} onChange={e => setCelularReferencia2(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome do Pai</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome do pai" value={nomePai} onChange={e => setNomePai(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Nome da Mãe *</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome da mãe" value={nomeMae} onChange={e => setNomeMae(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Facebook</label>
                                <input className="form-input" style={inputStyle} placeholder="facebook.com/usuario" value={facebook} onChange={e => setFacebook(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Twitter</label>
                                <input className="form-input" style={inputStyle} placeholder="@usuario" value={twitter} onChange={e => setTwitter(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telegram</label>
                                <input className="form-input" style={inputStyle} placeholder="@usuario" value={telegran} onChange={e => setTelegran(e.target.value)} />
                            </div>
                        </div>

                        <div style={{borderTop: '1px solid #eee', margin: '16px 0', paddingTop: '16px'}}>
                            <h4 style={{margin: '0 0 12px', fontSize: '14px', fontWeight: 700}}>Endereço</h4>
                            <div style={grid}>
                                <div style={{gridColumn: '1 / -1', display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <div style={{flex: 1}}>
                                        <label style={labelStyle}>CEP</label>
                                        <input className="form-input" style={inputStyle} placeholder="99.999-999" maxLength={9} value={cep} onChange={e => setCep(formatCEP(e.target.value))} />
                                    </div>
                                    <button type="button" className="btnyellow" style={{marginTop: '18px'}} disabled={buscandoCep} onClick={buscarCep}>{buscandoCep ? 'Buscando...' : 'Busca'}</button>
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Cidade</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={cidadeOpt} onChange={setCidadeOpt} fetchOptions={fetchCidades} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Bairro</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={bairroOpt} onChange={setBairroOpt} fetchOptions={fetchBairros} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Logradouro</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={logradouroOpt} onChange={o => { setLogradouroOpt(o); if (o) setLogradouroId(o.id); }} fetchOptions={fetchLogradouros} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Número *</label>
                                    <input className="form-input" style={inputStyle} placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Complemento</label>
                                    <input className="form-input" style={inputStyle} placeholder="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
                                </div>
                            </div>
                            {enderecoAviso && <small style={{color: '#c0392b'}}>{enderecoAviso}</small>}
                        </div>

                        <div style={{gridColumn: '1 / -1'}}>
                            <label style={labelStyle}>Observação</label>
                            <textarea className="form-input" style={{...inputStyle, minHeight: '70px'}} rows={3} placeholder="Observações" value={observacao} onChange={e => setObservacao(e.target.value)} />
                        </div>
                    </div>

                    {erro && <div style={{color: '#c0392b', marginTop: '10px'}}>{erro}</div>}

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '14px'}}>
                        <button type="button" className="btnyellow" onClick={onClose}>Voltar</button>
                        <button type="button" className="btnblue" disabled={salvando} onClick={salvar}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

interface PessoaJuridicaFormModalProps {
    open: boolean;
    mode: 'create' | 'edit';
    editId: number | null;
    onClose: () => void;
    onSaved: (pessoaId: number) => void;
}

function PessoaJuridicaFormModal({open, mode, editId, onClose, onSaved}: PessoaJuridicaFormModalProps) {
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string | undefined>();

    const [cnpj, setCnpj] = useState('');
    const [razaoSocial, setRazaoSocial] = useState('');
    const [nomeFantasia, setNomeFantasia] = useState('');
    const [inscricaoMunicipal, setInscricaoMunicipal] = useState('');
    const [inscricaoEstadual, setInscricaoEstadual] = useState('');
    const [email, setEmail] = useState('');
    const [fax, setFax] = useState('');
    const [telefone, setTelefone] = useState('');
    const [celular, setCelular] = useState('');
    const [observacao, setObservacao] = useState('');

    const [cep, setCep] = useState('');
    const [cidadeOpt, setCidadeOpt] = useState<AutoCompleteOption | null>(null);
    const [bairroOpt, setBairroOpt] = useState<AutoCompleteOption | null>(null);
    const [logradouroOpt, setLogradouroOpt] = useState<AutoCompleteOption | null>(null);
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [logradouroId, setLogradouroId] = useState<number | undefined>();
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [enderecoAviso, setEnderecoAviso] = useState('');

    const [pjId, setPjId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pjOriginal, setPjOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);

    const reset = () => {
        setCnpj(''); setRazaoSocial(''); setNomeFantasia(''); setInscricaoMunicipal('');
        setInscricaoEstadual(''); setEmail(''); setFax(''); setTelefone(''); setCelular(''); setObservacao('');
        setCep(''); setCidadeOpt(null); setBairroOpt(null); setLogradouroOpt(null);
        setNumero(''); setComplemento(''); setLogradouroId(undefined); setEnderecoAviso('');
        setPjId(undefined); setPessoaId(undefined); setPjOriginal(null); setPessoaOriginal(null);
        setErro(undefined);
    };

    const fetchCidades = async (q: string): Promise<AutoCompleteOption[]> => {
        if (!q) return [];
        const {data} = await api.get<any[]>('/api/basico/cidade/autoComplete', {params: {query: q}});
        return data.map((e: any) => ({id: e.id, label: e.cidadeEstado ?? e.nome}));
    };

    const fetchBairros = async (q: string): Promise<AutoCompleteOption[]> => {
        const params: any = {query: q};
        if (cidadeOpt?.id) params.cidadeId = cidadeOpt.id;
        const {data} = await api.get<any[]>('/api/basico/bairro/auto-complete', {params});
        return data.map((e: any) => ({id: e.id, label: e.descricao}));
    };

    const fetchLogradouros = async (q: string): Promise<AutoCompleteOption[]> => {
        const params: any = {query: q};
        if (bairroOpt?.id) params.bairroId = bairroOpt.id;
        const {data} = await api.get<any[]>('/api/basico/logradouro/auto-complete', {params});
        return data.map((e: any) => ({id: e.id, label: e.descricao}));
    };

    const loadDadosPessoa = async () => {
        if (!editId) { reset(); return; }
        setCarregando(true);
        try {
            const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${editId}`)).data;
            let pes: Record<string, unknown> | null = null;
            if (pj.pessoaId) pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;

            setPjId(pj.id as number);
            setPjOriginal(pj);
            setPessoaId(pes?.id as number | undefined);
            setPessoaOriginal(pes);

            setCnpj(str(pj.cnpj));
            setRazaoSocial(str(pj.razaoSocial));
            setNomeFantasia(str(pj.nomeFantasia));
            setInscricaoMunicipal(str(pj.inscricaoMunicipal));
            setInscricaoEstadual(str(pj.inscricaoEstadual));
            setEmail(str(pes?.email));
            setFax(str(pj.fax));
            setTelefone(str(pes?.telefone));
            setCelular(str(pes?.celular));
            setObservacao(str(pes?.observacao));

            if (pes) {
                const cepVal = str(pes.cep);
                const numVal = str(pes.numero);
                const compVal = str(pes.complemento);
                const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number | undefined;
                setNumero(numVal);
                setComplemento(compVal);
                if (idLog) {
                    try {
                        const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                        setLogradouroId(logRes.id as number);
                        setLogradouroOpt({id: logRes.id as number, label: str(logRes.descricao)});
                        setCep(str(logRes.cep) ? formatCEP(str(logRes.cep)) : formatCEP(cepVal));
                        if (logRes.id_bairro) {
                            const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                            setBairroOpt({id: bRes.id as number, label: str(bRes.descricao)});
                            if ((bRes as any).cidadeId) {
                                setCidadeOpt({id: Number((bRes as any).cidadeId), label: String((bRes as any).cidadeId)});
                            }
                        }
                    } catch {
                        setCep(formatCEP(cepVal));
                    }
                } else if (cepVal) setCep(formatCEP(cepVal));
            }
        } catch (e) {
            console.error('Erro ao carregar pessoa jurídica:', e);
            setErro('Erro ao carregar pessoa jurídica.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        if (open) {
            if (mode === 'create') {
                reset();
            } else {
                setCarregando(true);
            }
        }
    }, [open, mode, editId]);

    useEffect(() => {
        if (open && mode === 'edit' && editId) {
            loadDadosPessoa();
        }
    }, [open, mode, editId]);

    const buscarCep = async () => {
        const clean = cep.replace(/\D/g, '');
        if (clean.length !== 8) { setEnderecoAviso('CEP deve ter 8 dígitos'); return; }
        setBuscandoCep(true);
        setEnderecoAviso('');
        try {
            try {
                const {data} = await api.get<any>('/api/basico/logradouro/buscar-endereco-por-cep', {params: {cep: clean}});
                if (data?.logradouro) {
                    const l = data.logradouro;
                    setLogradouroOpt({id: l.id, label: l.descricao});
                    setLogradouroId(l.id);
                    if (data.bairro) setBairroOpt({id: data.bairro.id, label: data.bairro.descricao});
                    if (data.cidade) setCidadeOpt({id: data.cidade.id, label: data.cidade.nome ?? String(data.cidade.id)});
                    setCep(formatCEP(l.cep ?? clean));
                }
            } catch {
                const resp = await fetch(`https://viacep.com.br/ws/${clean}/json/`).then(r => r.json());
                if (!resp.erro) {
                    setEnderecoAviso('');
                    const cidades = await fetchCidades(resp.localidade);
                    const found = cidades.find(c => c.label.toLowerCase().includes(resp.localidade.toLowerCase()));
                    if (found) setCidadeOpt(found);
                    setBairroOpt(resp.bairro ? {id: -1, label: resp.bairro} : null);
                    setLogradouroOpt(resp.logradouro ? {id: -1, label: resp.logradouro} : null);
                    setCep(formatCEP(resp.cep ?? clean));
                } else setEnderecoAviso('CEP não encontrado');
            }
        } finally {
            setBuscandoCep(false);
        }
    };

    const salvar = async () => {
        if (!razaoSocial || !cnpj) { setErro('Informe pelo menos Razão Social e CNPJ.'); return; }
        setSalvando(true);
        setErro(undefined);
        try {
            const pjBody: Record<string, unknown> = {
                ...(pjOriginal ?? {}),
                cnpj, razaoSocial, nomeFantasia: nomeFantasia || null,
                inscricaoMunicipal: inscricaoMunicipal || null,
                inscricaoEstadual: inscricaoEstadual || null,
                fax: fax || null,
            };

            const respostaPj = pjId
                ? await api.put(`/api/basico/pessoa-juridica/${pjId}`, pjBody)
                : await api.post('/api/basico/pessoa-juridica', pjBody);
            const novoPjId = ((respostaPj.data as Record<string, unknown>)?.id as number | undefined) ?? pjId;

            const pessoaBody: Record<string, unknown> = {
                ...(pessoaOriginal ?? {}),
                email: email || null,
                telefone: telefone || null,
                celular: celular || null,
                observacao: observacao || null,
                cep: cep || null,
                numero: numero || null,
                complemento: complemento || null,
                logradouroId: logradouroId || null,
            };

            let novoPesId = pessoaId;
            if (pessoaId) {
                await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
            } else {
                novoPesId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;
            }

            if (!pjId && novoPesId && novoPjId) {
                await api.put(`/api/basico/pessoa-juridica/${novoPjId}`, {...pjBody, pessoaId: novoPesId});
            }

            onSaved(novoPjId ?? 0);
            onClose();
        } catch (e) {
            console.error('Erro ao salvar pessoa jurídica:', e);
            setErro('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const inputStyle: React.CSSProperties = {width: '100%', padding: '7px 10px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '13px'};
    const labelStyle: React.CSSProperties = {display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px', color: '#333'};
    const grid: React.CSSProperties = {display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px'};

    return (
        <Modal title={mode === 'edit' ? 'Editar Pessoa Jurídica' : 'Criar Pessoa Jurídica'} open={open} onClose={onClose} size="xl">
            {carregando ? (
                <div style={{padding: '40px', textAlign: 'center', color: '#777'}}>Carregando dados da pessoa...</div>
            ) : (
                <div>
                    <div style={{maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px'}}>
                        <div style={grid}>
                            <div>
                                <label style={labelStyle}>CNPJ *</label>
                                <input className="form-input" style={inputStyle} placeholder="00.000.000/0000-00" value={cnpj} onChange={e => setCnpj(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Razão Social *</label>
                                <input className="form-input" style={inputStyle} placeholder="Razão social" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} />
                            </div>
                            <div style={{gridColumn: '1 / -1'}}>
                                <label style={labelStyle}>Nome Fantasia *</label>
                                <input className="form-input" style={inputStyle} placeholder="Nome fantasia" value={nomeFantasia} onChange={e => setNomeFantasia(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Inscrição Municipal</label>
                                <input className="form-input" style={inputStyle} placeholder="Inscrição municipal" value={inscricaoMunicipal} onChange={e => setInscricaoMunicipal(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Inscrição Estadual</label>
                                <input className="form-input" style={inputStyle} placeholder="Inscrição estadual" value={inscricaoEstadual} onChange={e => setInscricaoEstadual(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>E-mail *</label>
                                <input className="form-input" style={inputStyle} type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Fax</label>
                                <input className="form-input" style={inputStyle} placeholder="Fax" value={fax} onChange={e => setFax(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Telefone</label>
                                <input className="form-input" style={inputStyle} placeholder="99-99999999" value={telefone} onChange={e => setTelefone(e.target.value)} />
                            </div>
                            <div>
                                <label style={labelStyle}>Celular</label>
                                <input className="form-input" style={inputStyle} placeholder="99-999999999" value={celular} onChange={e => setCelular(e.target.value)} />
                            </div>
                        </div>

                        <div style={{borderTop: '1px solid #eee', margin: '16px 0', paddingTop: '16px'}}>
                            <h4 style={{margin: '0 0 12px', fontSize: '14px', fontWeight: 700}}>Endereço</h4>
                            <div style={grid}>
                                <div style={{gridColumn: '1 / -1', display: 'flex', gap: '8px', alignItems: 'center'}}>
                                    <div style={{flex: 1}}>
                                        <label style={labelStyle}>CEP</label>
                                        <input className="form-input" style={inputStyle} placeholder="99.999-999" maxLength={9} value={cep} onChange={e => setCep(formatCEP(e.target.value))} />
                                    </div>
                                    <button type="button" className="btnyellow" style={{marginTop: '18px'}} disabled={buscandoCep} onClick={buscarCep}>{buscandoCep ? 'Buscando...' : 'Busca'}</button>
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Cidade</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={cidadeOpt} onChange={setCidadeOpt} fetchOptions={fetchCidades} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Bairro</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={bairroOpt} onChange={setBairroOpt} fetchOptions={fetchBairros} />
                                </div>
                                <div style={{gridColumn: '1 / -1'}}>
                                    <label style={labelStyle}>Logradouro</label>
                                    <AutoComplete placeholder="Digite 3 letras..." value={logradouroOpt} onChange={o => { setLogradouroOpt(o); if (o) setLogradouroId(o.id); }} fetchOptions={fetchLogradouros} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Número *</label>
                                    <input className="form-input" style={inputStyle} placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Complemento</label>
                                    <input className="form-input" style={inputStyle} placeholder="Complemento" value={complemento} onChange={e => setComplemento(e.target.value)} />
                                </div>
                            </div>
                            {enderecoAviso && <small style={{color: '#c0392b'}}>{enderecoAviso}</small>}
                        </div>

                        <div style={{gridColumn: '1 / -1'}}>
                            <label style={labelStyle}>Observação</label>
                            <textarea className="form-input" style={{...inputStyle, minHeight: '70px'}} rows={3} placeholder="Observações" value={observacao} onChange={e => setObservacao(e.target.value)} />
                        </div>
                    </div>

                    {erro && <div style={{color: '#c0392b', marginTop: '10px'}}>{erro}</div>}

                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '14px'}}>
                        <button type="button" className="btnyellow" onClick={onClose}>Voltar</button>
                        <button type="button" className="btnblue" disabled={salvando} onClick={salvar}>
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default function ViewConsultorMatriculaLayoutScreen() {
    const [verificaMatriculaFinalizada, setVerificaMatriculaFinalizada] = useState(false);
    const [alunos, setAlunos] = useState<AutoCompleteOption[]>([]);
    const [curriculos, setCurriculos] = useState<AutoCompleteOption[]>([]);
    const [unidades, setUnidades] = useState<UnidadeResponse[]>([]);
    const [pessoasFisicas, setPessoasFisicas] = useState<AutoCompleteOption[]>([]);
    const [pessoasJuridicas, setPessoasJuridicas] = useState<AutoCompleteOption[]>([]);
    const [testemunhas, setTestemunhas] = useState<AutoCompleteOption[]>([]);
    const [grupos, setGrupos] = useState<OferecimentoGrupo[]>([]);
    const [ofertasLivre, setOfertasLivre] = useState<OferecimentoItem[]>([]);
    const [filtro, setFiltro] = useState<FiltroMatricula>({ tipoMatricula: 'LIVRE' });
    const [loading, setLoading] = useState(false);
    const [contrato, setContrato] = useState<Record<string, unknown>>({});
    const [materialEstoque, setMaterialEstoque] = useState<any[]>([]);
    const [materialContrato, setMaterialContrato] = useState<any[]>([]);
    const [matriculaSelecionadas, setMatriculaSelecionadas] = useState<OferecimentoItem[]>([]);
    const [formaPagamentos, setFormaPagamentos] = useState<FormaPagamentoResponse[]>([]);
    const [formaPagamento, setFormaPagamento] = useState<FormaPagamentoResponse | null>(null);
    const [materialFormaPagamento, setMaterialFormaPagamento] = useState<FormaPagamentoResponse | null>(null);
    const [dataPrimeiraParcela, setDataPrimeiraParcela] = useState('');
    const [dataSegundaParcela, setDataSegundaParcela] = useState('');
    const [valorCurso, setValorCurso] = useState(0);
    const [parcelas, setParcelas] = useState<ParcelaLinha[]>([]);

    // Info panels state (calculated when pessoa is selected)
    const [infoPanels, setInfoPanels] = useState<{
        maioridade: 'DE MAIOR' | 'DE MENOR';
        financeiro: 'SEM DÍVIDAS' | 'COM DÍVIDAS';
        aluno: 'SIM' | 'NÃO';
        atualizarDados: 'SIM' | 'NÃO';
    }>({
        maioridade: 'DE MAIOR',
        financeiro: 'SEM DÍVIDAS',
        aluno: 'NÃO',
        atualizarDados: 'NÃO',
    });

    // Pessoa Fisica Modal state
    const [showPessoaFisicaModal, setShowPessoaFisicaModal] = useState(false);
    const [pessoaFisicaModalMode, setPessoaFisicaModalMode] = useState<'create' | 'edit'>('create');
    const [pessoaFisicaEditId, setPessoaFisicaEditId] = useState<number | null>(null);

    // Pessoa Juridica Modal state
    const [showPessoaJuridicaModal, setShowPessoaJuridicaModal] = useState(false);
    const [pessoaJuridicaModalMode, setPessoaJuridicaModalMode] = useState<'create' | 'edit'>('create');
    const [pessoaJuridicaEditId, setPessoaJuridicaEditId] = useState<number | null>(null);

    const loadAlunos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<ContratoAutoCompleteResponse[]>('/api/educacao/contrato/auto-complete-aluno', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar alunos:', e);
            return [];
        }
    }, []);

    const loadCurriculos = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query) return [];
        try {
            const response = await api.get<CurriculoResponse[]>('/api/educacao/curriculo/auto-complete-full', { params: { query } });
            return response.data.map(toCurriculoOption);
        } catch (e) {
            console.error('Erro ao buscar currículos:', e);
            return [];
        }
    }, []);

    const loadUnidades = useCallback(async () => {
        try {
            const response = await api.get<UnidadeResponse[]>('/api/basico/unidade');
            setUnidades(response.data);
        } catch (e) {
            console.error('Erro ao buscar unidades:', e);
        }
    }, []);

    const loadPessoasFisicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaFisicaResponse[]>('/api/basico/pessoa-fisica/auto-complete-todos', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas físicas:', e);
            return [];
        }
    }, []);

    const loadPessoasJuridicas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query || query.length < 3) return [];
        try {
            const response = await api.get<PessoaJuridicaResponse[]>('/api/basico/pessoa-juridica/auto-complete-todos', { params: { query } });
            return response.data.map(toAutoCompleteOption);
        } catch (e) {
            console.error('Erro ao buscar pessoas jurídicas:', e);
            return [];
        }
    }, []);

    // Referência legado (extracted_aceso):
    //  abasMatricula.xhtml -> completeMethod="#{pessoaFisicaController.autoCompleteTestemunha}"
    //  itemLabel="#{pessoa.pessoaFisica.nome} (#{pessoa.pessoaFisica.cpf})", minQueryLength=3, dropdown=true.
    //  Backend filtra Usuario ativo por nome/cpf (PessoaFisicaRepository.autoCompleteTestemunha).
    //  Contrato.testemunha1/2 referenciam Pessoa (bas_pessoa id) -> usar pessoaId quando disponível.
    const toTestemunhaOption = useCallback((item: PessoaFisicaResponse): AutoCompleteOption => {
        const pessoaId = item.pessoaId ?? item.id;
        const label = item.nome ? `${item.nome} (${item.cpf || ''})` : `#${pessoaId}`;
        return { id: pessoaId, label };
    }, []);

    const loadTestemunhas = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        try {
            const q = (query || '').trim();
            // dropdown=true no legado: query vazia lista as 10 primeiras testemunhas
            const response = await api.get<PessoaFisicaResponse[] | number[]>('/api/basico/pessoa-fisica/auto-complete-testemunha', { params: { query: q } });
            const data = response.data ?? [];
            if (data.length > 0 && typeof data[0] === 'number') {
                return (data as number[]).map(id => ({ id, label: `#${id}` }));
            }
            return (data as PessoaFisicaResponse[]).map(toTestemunhaOption);
        } catch (e) {
            console.error('Erro ao buscar testemunhas:', e);
            return [];
        }
    }, [toTestemunhaOption]);

    const loadGrupos = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            const response = await api.get<OferecimentoGrupo[]>(`/api/educacao/oferecimento-curso/listar-grupos?${params}`);
            setGrupos(response.data);
        } catch (e) {
            console.error('Erro ao buscar grupos:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    const loadOfertasLivre = useCallback(async () => {
        if (!filtro.curriculoId) return;
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('curriculoId', String(filtro.curriculoId));
            if (filtro.unidadeId) params.append('unidadeId', String(filtro.unidadeId));
            if (filtro.turnoEducacaoId) params.append('turnoEducacaoId', String(filtro.turnoEducacaoId));
            if (filtro.diaSemanaId) params.append('diaSemanaId', String(filtro.diaSemanaId));
            const response = await api.get<{ content: OferecimentoItem[] }>(`/api/educacao/oferecimento-componente-curricular/paged?${params}`);
            setOfertasLivre(response.data.content || []);
        } catch (e) {
            console.error('Erro ao buscar ofertas livre:', e);
        } finally {
            setLoading(false);
        }
    }, [filtro]);

    const loadFormaPagamentos = useCallback(async () => {
        try {
            const response = await api.get<FormaPagamentoResponse[]>('/api/financeiro/forma-pagamento');
            setFormaPagamentos(response.data ?? []);
        } catch (e) {
            console.error('Erro ao buscar formas de pagamento:', e);
        }
    }, []);

    const loadValorCurso = useCallback(async () => {
        const curriculo = contrato.curriculo as AutoCompleteOption | undefined;
        const unidade = contrato.unidade as UnidadeResponse | undefined;
        if (!curriculo?.id || !unidade?.id) return;
        try {
            const res = await api.get<number>('/api/educacao/matricula/buscar-valor-curso2', { params: { curriculoId: curriculo.id, unidadeId: unidade.id } });
            setValorCurso(Number(res.data ?? 0));
        } catch (e) {
            console.error('Erro ao buscar valor do curso:', e);
        }
    }, [contrato.curriculo, contrato.unidade]);

    const diasSegundaParcela = useMemo(() => {
        if (!dataPrimeiraParcela) return [];
        return Array.from({ length: 6 }, (_, i) => addMonths(dataPrimeiraParcela, i + 1));
    }, [dataPrimeiraParcela]);

    useEffect(() => {
        loadUnidades();
    }, [loadUnidades]);

    useEffect(() => {
        loadFormaPagamentos();
    }, [loadFormaPagamentos]);

    useEffect(() => {
        if (filtro.tipoMatricula === 'GRUPO') {
            loadGrupos();
        } else {
            loadOfertasLivre();
        }
    }, [filtro, loadGrupos, loadOfertasLivre]);

    useEffect(() => {
        setParcelas(buildParcelas(formaPagamento, dataPrimeiraParcela, dataSegundaParcela, valorCurso));
    }, [formaPagamento, dataPrimeiraParcela, dataSegundaParcela, valorCurso]);

    const calcularInfoPanels = useCallback(async (pessoaId: number) => {
        try {
            const response = await api.get<{
                maioridade: 'DE MAIOR' | 'DE MENOR';
                financeiro: 'SEM DÍVIDAS' | 'COM DÍVIDAS';
                aluno: 'SIM' | 'NÃO';
                atualizarDados: 'SIM' | 'NÃO';
            }>(`/api/educacao/matricula/calcular-info-pessoa-fisica/${pessoaId}`);
            setInfoPanels(response.data);
        } catch (e) {
            console.error('Erro ao calcular info panels:', e);
            // Fallback defaults
            setInfoPanels({
                maioridade: 'DE MAIOR',
                financeiro: 'SEM DÍVIDAS',
                aluno: 'NÃO',
                atualizarDados: 'NÃO',
            });
        }
    }, []);

    const resetInfoPanels = useCallback(() => {
        setInfoPanels({
            maioridade: 'DE MAIOR',
            financeiro: 'SEM DÍVIDAS',
            aluno: 'NÃO',
            atualizarDados: 'NÃO',
        });
    }, []);

    const handleAlunoSelect = (option: AutoCompleteOption | null) => {
        if (option) {
            setContrato(prev => ({ ...prev, pessoa: option }));
            calcularInfoPanels(option.id);
        } else {
            setContrato(prev => ({ ...prev, pessoa: null }));
            resetInfoPanels();
        }
    };

    const handleCursoSelect = (option: AutoCompleteOption | null) => {
        if (option) {
            setContrato(prev => ({ ...prev, curriculo: option }));
            setFiltro(prev => ({ ...prev, curriculoId: option.id }));
        } else {
            setContrato(prev => ({ ...prev, curriculo: null }));
            setFiltro(prev => ({ ...prev, curriculoId: undefined }));
        }
    };

    const handleResponsavelSelect = (option: AutoCompleteOption | null, tipo: 'fisica' | 'juridica') => {
        if (option) {
            setContrato(prev => ({ ...prev, responsavel: option, tipoContratante: tipo }));
        } else {
            setContrato(prev => ({ ...prev, responsavel: null }));
        }
    };

    const handleUnidadeChange = (unidade: UnidadeResponse | undefined) => {
        if (unidade) {
            setContrato(prev => ({ ...prev, unidade }));
            setFiltro(prev => ({ ...prev, unidadeId: unidade.id }));
        }
    };

    const handleTestemunhaSelect = (option: AutoCompleteOption | null, num: 1 | 2) => {
        if (option) setContrato(prev => ({ ...prev, [`testemunha${num}`]: option }));
    };

    const handleGrupoSelect = (grupo: OferecimentoGrupo) => {
        setGrupos(prev => prev.map(g => ({
            ...g,
            selected: g.id === grupo.id ? !grupo.selected : g.selected
        })));
        if (!grupo.selected && grupo.oferecimentosSelecionado) {
            setMatriculaSelecionadas(prev => [...prev, ...grupo.oferecimentosSelecionado]);
        }
    };

    const handleOfertaSelect = (oferta: OferecimentoItem) => {
        setOfertasLivre(prev => prev.map(o => ({
            ...o,
            selected: o.id === oferta.id ? !oferta.selected : o.selected
        })));
        if (!oferta.selected) {
            setMatriculaSelecionadas(prev => [...prev, oferta]);
        } else {
            setMatriculaSelecionadas(prev => prev.filter(o => o.id !== oferta.id));
        }
    };

    const handleFiltroChange = (key: keyof FiltroMatricula, value: unknown) => {
        setFiltro(prev => ({ ...prev, [key]: value }));
    };

    const handleTipoMatriculaChange = (tipo: 'GRUPO' | 'LIVRE') => {
        setFiltro(prev => ({ ...prev, tipoMatricula: tipo }));
    };

    const handleFormaPagamentoChange = (fp: FormaPagamentoResponse | undefined) => {
        setFormaPagamento(fp ?? null);
    };

    const handleDataPrimeiraParcelaChange = (value: string) => {
        setDataPrimeiraParcela(value);
        if (!dataSegundaParcela) setDataSegundaParcela(addMonths(value, 1));
    };

    const validateContrato = (): string | boolean => {
        if (!contrato.pessoa) return 'Selecione o aluno.';
        if (!contrato.curriculo) return 'Selecione o curso.';
        if (!contrato.unidade) return 'Selecione a unidade do contrato.';
        const t1 = contrato.testemunha1 as AutoCompleteOption | undefined;
        const t2 = contrato.testemunha2 as AutoCompleteOption | undefined;
        if (!t1) return 'Selecione a primeira testemunha.';
        if (!t2) return 'Selecione a segunda testemunha.';
        if (t1.id === t2.id) return 'A primeira e a segunda testemunha não podem ser as mesmas.';
        return true;
    };

    const validateMatricula = (): string | boolean => {
        if (matriculaSelecionadas.length === 0) return 'Selecione ao menos um oferecimento (Grupo ou Livre) para a matrícula.';
        return true;
    };

    const validateValores = (): string | boolean => {
        if (!formaPagamento) return 'Selecione a forma de pagamento antes de finalizar.';
        if (!dataPrimeiraParcela) return 'Informe a data da primeira parcela.';
        return true;
    };

    const handleFinalizarMatricula = async () => {
        try {
            await api.post('/api/educacao/matricula/gerar-carne-consultor');
        } catch (e) {
            console.error('Erro ao finalizar matrícula:', e);
        }
        setVerificaMatriculaFinalizada(true);
    };

    const handleNovaMatricula = () => {
        setVerificaMatriculaFinalizada(false);
        setContrato({});
        setMatriculaSelecionadas([]);
        setFormaPagamento(null);
        setMaterialFormaPagamento(null);
        setDataPrimeiraParcela('');
        setDataSegundaParcela('');
        setParcelas([]);
        setMaterialContrato([]);
    };

    const handleBaixarCarneMatricula = async () => {
        try {
            await api.post('/api/educacao/matricula/gerar-carne-consultor');
        } catch (e) {
            console.error('Erro ao gerar carnê de matrícula:', e);
        }
        alert('Download do carnê de matrícula iniciado.');
    };

    const handleBaixarCarneMaterial = () => {
        alert('Download do carnê de material escolar ainda não implementado.');
    };

    const handleGerarContrato = () => {
        alert('Geração do contrato (doc) ainda não implementada.');
    };

    const handleGerarPromissoria = () => {
        alert('Geração da promissória ainda não implementada.');
    };

    const handleDigitalizar = () => {
        alert('Digitalização do contrato ainda não implementada.');
    };

    const renderOferecimentosTable = (rows: OferecimentoItem[]) => (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                    <tr style={{ background: '#2f333b', color: '#fff' }}>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Turma</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Unidade</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Sala</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Componente Curricular</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>C.H.</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Data Início - Fim</th>
                        <th style={{ padding: '8px', textAlign: 'left' }}>Professor</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((o, i) => (
                        <tr key={o.id} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7f7f7', borderBottom: '1px solid #e5e5e5' }}>
                            <td style={{ padding: '8px' }}><span className={`status ${o.status}`}>{o.status}</span></td>
                            <td style={{ padding: '8px' }}>Turma {o.id}</td>
                            <td style={{ padding: '8px' }}>{o.unidade?.sucinto}</td>
                            <td style={{ padding: '8px' }}>{o.sala?.numero}</td>
                            <td style={{ padding: '8px' }}>{o.componenteCurricular?.descricao}</td>
                            <td style={{ padding: '8px' }}>{o.componenteCurricular?.cargaHoraria}H/A</td>
                            <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>{o.dataInicio} - {o.dataFim}</td>
                            <td style={{ padding: '8px' }}>{o.professor?.pessoa?.pessoaFisica?.nome || o.professor?.pessoa?.pessoaJuridica?.nomeFantasia || '-'}</td>
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr><td colSpan={8} style={{ padding: '8px' }}>Nenhum oferecimento selecionado na etapa de Matrícula.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    const renderContratoTab = () => (
        <div className="contrato-tab">
            <div className="aluno-info" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                <div className="info-panel">
                    <h4>Maioridade</h4>
                    <span className={`status ${infoPanels.maioridade === 'DE MENOR' ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {infoPanels.maioridade}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Financeiro</h4>
                    <span className={`status ${infoPanels.financeiro === 'COM DÍVIDAS' ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {infoPanels.financeiro}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Aluno</h4>
                    <span className={`status ${infoPanels.aluno === 'SIM' ? 'EM_ANDAMENTO' : 'PENDENTE'}`}>
                        {infoPanels.aluno}
                    </span>
                </div>
                <div className="info-panel">
                    <h4>Atualizar Dados</h4>
                    <span className={`status ${infoPanels.atualizarDados === 'SIM' ? 'PENDENTE' : 'EM_ANDAMENTO'}`}>
                        {infoPanels.atualizarDados}
                    </span>
                </div>
            </div>

            <div className="form-section">
                <h3>Dados do Contrato</h3>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Aluno *</label>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <AutoComplete
                                    value={contrato.pessoa as AutoCompleteOption | undefined}
                                    onChange={handleAlunoSelect}
                                    fetchOptions={loadAlunos}
                                    minChars={3}
                                    placeholder="Digite 3+ caracteres..."
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <button
                                    type="button"
                                    className="btnblue"
                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                    onClick={() => {
                                        setPessoaFisicaModalMode('create');
                                        setPessoaFisicaEditId(null);
                                        setShowPessoaFisicaModal(true);
                                    }}
                                >
                                    Criar Pessoa
                                </button>
                                <button
                                    type="button"
                                    className="btngreen"
                                    style={{ padding: '8px 12px', fontSize: '12px' }}
                                    disabled={!contrato.pessoa}
                                    onClick={() => {
                                        const pessoa = contrato.pessoa as AutoCompleteOption;
                                        if (pessoa) {
                                            setPessoaFisicaModalMode('edit');
                                            setPessoaFisicaEditId(pessoa.id);
                                            setShowPessoaFisicaModal(true);
                                        }
                                    }}
                                >
                                    Editar Pessoa
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label>Curso *</label>
                        <AutoComplete
                            value={contrato.curriculo as AutoCompleteOption | undefined}
                            onChange={handleCursoSelect}
                            fetchOptions={loadCurriculos}
                            minChars={1}
                            placeholder="Digite para buscar..."
                        />
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Tipo de Contratante</h3>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                    <label><input type="radio" name="tipoContratante" value="fisica" checked={contrato.tipoContratante === 'fisica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'fisica' }))} /> Pessoa Física</label>
                    <label><input type="radio" name="tipoContratante" value="juridica" checked={contrato.tipoContratante === 'juridica'} onChange={() => setContrato(prev => ({ ...prev, tipoContratante: 'juridica' }))} /> Pessoa Jurídica</label>
                </div>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Contratante *</label>
                        {contrato.tipoContratante === 'fisica' ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <AutoComplete
                                        value={contrato.responsavel as AutoCompleteOption | undefined}
                                        onChange={p => handleResponsavelSelect(p, 'fisica')}
                                        fetchOptions={loadPessoasFisicas}
                                        minChars={3}
                                        placeholder="Digite 3+ caracteres..."
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <button
                                        type="button"
                                        className="btnblue"
                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                        onClick={() => {
                                            setPessoaFisicaModalMode('create');
                                            setPessoaFisicaEditId(null);
                                            setShowPessoaFisicaModal(true);
                                        }}
                                    >
                                        Criar Pessoa
                                    </button>
                                    <button
                                        type="button"
                                        className="btngreen"
                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                        disabled={!contrato.responsavel}
                                        onClick={() => {
                                            const responsavel = contrato.responsavel as AutoCompleteOption;
                                            if (responsavel) {
                                                setPessoaFisicaModalMode('edit');
                                                setPessoaFisicaEditId(responsavel.id);
                                                setShowPessoaFisicaModal(true);
                                            }
                                        }}
                                    >
                                        Editar Pessoa
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <AutoComplete
                                        value={contrato.responsavel as AutoCompleteOption | undefined}
                                        onChange={p => handleResponsavelSelect(p, 'juridica')}
                                        fetchOptions={loadPessoasJuridicas}
                                        minChars={3}
                                        placeholder="Digite 3+ caracteres..."
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <button
                                        type="button"
                                        className="btnblue"
                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                        onClick={() => {
                                            setPessoaJuridicaModalMode('create');
                                            setPessoaJuridicaEditId(null);
                                            setShowPessoaJuridicaModal(true);
                                        }}
                                    >
                                        Criar Pessoa
                                    </button>
                                    <button
                                        type="button"
                                        className="btngreen"
                                        style={{ padding: '8px 12px', fontSize: '12px' }}
                                        disabled={!contrato.responsavel}
                                        onClick={() => {
                                            const responsavel = contrato.responsavel as AutoCompleteOption;
                                            if (responsavel) {
                                                setPessoaJuridicaModalMode('edit');
                                                setPessoaJuridicaEditId(responsavel.id);
                                                setShowPessoaJuridicaModal(true);
                                            }
                                        }}
                                    >
                                        Editar Pessoa
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="form-section">
                <h3>Unidade</h3>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Unidade do Contrato *</label>
                        <select
                            value={contrato.unidade ? String((contrato.unidade as UnidadeResponse).id) : ''}
                            onChange={e => handleUnidadeChange(unidades.find(u => u.id === Number(e.target.value)))}
                            className="form-input"
                        >
                            <option value="">Selecione</option>
                            {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.sucinto}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            <div className="form-section">
                <h3>Testemunhas</h3>
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                    <div>
                        <label>Primeira Testemunha</label>
                        <AutoComplete
                            value={contrato.testemunha1 as AutoCompleteOption | undefined}
                            onChange={p => handleTestemunhaSelect(p, 1)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                            placeholder="Digite 3+ caracteres..."
                        />
                    </div>
                    <div>
                        <label>Segunda Testemunha</label>
                        <AutoComplete
                            value={contrato.testemunha2 as AutoCompleteOption | undefined}
                            onChange={p => handleTestemunhaSelect(p, 2)}
                            fetchOptions={loadTestemunhas}
                            minChars={3}
                            placeholder="Digite 3+ caracteres..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderMatriculaTab = () => {
        const curriculoSelecionado = contrato.curriculo as CurriculoOption | undefined;
        return (
        <div className="matricula-tab">
            <div className="curso-info" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: '10px', flex: 1, minWidth: '280px' }}>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Curso</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.cursoNome || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Sucinto</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.sucinto || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Tipo Curso</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.tipoCurso || '—'}</strong>
                    </div>
                    <div className="info-panel" style={{ background: '#fff', border: '1px solid #ddd', borderRadius: '6px', padding: '10px 12px' }}>
                        <h4 style={{ margin: '0 0 4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#7a7a7a' }}>Carga Horária</h4>
                        <strong style={{ fontSize: '14px', color: '#1d2025' }}>{curriculoSelecionado?.cargaHoraria ? `${curriculoSelecionado.cargaHoraria} H/A` : '—'}</strong>
                    </div>
                </div>
                <button className="btnyellow" style={{ marginLeft: 'auto' }} onClick={() => alert('Matriz curricular ainda não implementada.')}>
                    <i className="fa fa-calculator"/> Matriz Curricular
                </button>
            </div>

            <div className="filtro-busca" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '4px' }}>
                <h4>Filtro Busca</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    <div>
                        <label>Unidade</label>
                        <select value={filtro.unidadeId || ''} onChange={e => handleFiltroChange('unidadeId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                            {unidades.map(u => <option key={u.id} value={String(u.id)}>{u.sucinto}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Turno</label>
                        <select value={filtro.turnoEducacaoId || ''} onChange={e => handleFiltroChange('turnoEducacaoId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                        </select>
                    </div>
                    <div>
                        <label>Dia da Semana</label>
                        <select value={filtro.diaSemanaId || ''} onChange={e => handleFiltroChange('diaSemanaId', e.target.value ? Number(e.target.value) : undefined)} className="form-input">
                            <option value="">Selecione</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <label><input type="radio" name="tipoMatricula" value="GRUPO" checked={filtro.tipoMatricula === 'GRUPO'} onChange={() => handleTipoMatriculaChange('GRUPO')} /> Grupo</label>
                    <label><input type="radio" name="tipoMatricula" value="LIVRE" checked={filtro.tipoMatricula === 'LIVRE'} onChange={() => handleTipoMatriculaChange('LIVRE')} /> Livre</label>
                    <button className="btngrey" onClick={() => filtro.tipoMatricula === 'GRUPO' ? loadGrupos() : loadOfertasLivre()}>
                        <i className="fa fa-search"/> Filtrar
                    </button>
                </div>
            </div>

            {filtro.tipoMatricula === 'GRUPO' && (
                <div className="grupos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {grupos.map(grupo => (
                        <div key={grupo.id} className={`grupo-card ${grupo.selected ? 'selected' : ''}`} onClick={() => handleGrupoSelect(grupo)} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', cursor: 'pointer', background: grupo.selected ? '#e8f5e9' : 'white' }}>
                            <div className="grupo-header" style={{ fontWeight: 'bold', fontSize: '16px' }}>{grupo.grupo}</div>
                            <div className="grupo-unidade" style={{ marginTop: '5px' }}>{grupo.unidade?.sucinto}</div>
                            <div className="grupo-horario" style={{ marginTop: '5px' }}>{grupo.horario}</div>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                <button className="btnblue" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); handleGrupoSelect(grupo); }}>
                                    {grupo.selected ? 'Desmarcar' : 'Marcar'}
                                </button>
                                {grupo.selected && grupo.oferecimentosSelecionado && grupo.oferecimentosSelecionado.length > 0 && (
                                    <button className="btngreen" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); alert('Definir oferecimentos'); }}>
                                        Definir
                                    </button>
                                )}
                                <button className="btnyellow" style={{ width: '95px' }} onClick={e => { e.stopPropagation(); alert('Detalhes do grupo'); }}>
                                    Detalhes
                                </button>
                            </div>
                        </div>
                    ))}
                    {grupos.length === 0 && !loading && <div className="empty-state">Nenhum grupo encontrado</div>}
                    {loading && <div className="loading">Carregando grupos...</div>}
                </div>
            )}

            {filtro.tipoMatricula === 'LIVRE' && (
                <div className="ofertas-accordion">
                    {ofertasLivre.map(oferta => (
                        <div key={oferta.id} className="accordion-item" style={{ border: '1px solid #ddd', marginBottom: '10px', borderRadius: '4px' }}>
                            <div className="accordion-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f5f5f5', cursor: 'pointer' }}>
                                <input type="checkbox" checked={!!oferta.selected} onChange={() => handleOfertaSelect(oferta)} disabled={oferta.disabledComponenteCurricular || oferta.disabledConflitoDia || oferta.disabledRequisito} />
                                <span className={`status ${oferta.status}`} style={{ fontWeight: 'bold', width: '100px' }}>{oferta.status}</span>
                                <span style={{ width: '80px' }}>Turma {oferta.id}</span>
                                <span style={{ width: '80px' }}>{oferta.unidade?.sucinto}</span>
                                <span style={{ flex: 1 }}>{oferta.componenteCurricular?.descricao}</span>
                                <span style={{ width: '60px' }}>{oferta.sala?.numero}</span>
                                <span style={{ width: '120px' }}>{oferta.dataInicio} - {oferta.dataFim}</span>
                                {oferta.motivo && <span className="motivo-icon" style={{ color: 'red' }} title={oferta.motivo}><i className="fa fa-help"/></span>}
                                <button className="btnyellow" onClick={() => alert('Dias da aula')}>
                                    <i className="fa fa-calendar"/>
                                </button>
                            </div>
                        </div>
                    ))}
                    {ofertasLivre.length === 0 && !loading && <div className="empty-state">Nenhuma oferta encontrada</div>}
                    {loading && <div className="loading">Carregando ofertas...</div>}
                </div>
            )}

            <div className="selecionadas-summary" style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
                <h4>Oferecimentos Selecionados ({matriculaSelecionadas.length})</h4>
                {renderOferecimentosTable(matriculaSelecionadas)}
            </div>
        </div>
        );
    };

    const renderMaterialTab = () => (
        <div className="material-tab" style={{ padding: '20px' }}>
            <h3>Material Escolar</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', fontSize: '14px' }}>
                <span style={{ color: '#000', fontWeight: 'bold' }}>■ Fornecido</span>
                <span style={{ color: '#0275d8', fontWeight: 'bold' }}>■ Compra</span>
                <span style={{ color: '#5cb85c', fontWeight: 'bold' }}>■ Estoque</span>
                <span style={{ color: '#f0ad4e', fontWeight: 'bold' }}>■ Solicitado</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                {materialContrato.map((item, idx) => (
                    <div key={idx} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', background: '#fff' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>{item.nome}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Valor:</span>
                            <strong>R$ {Number(item.valor || 0).toFixed(2)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span>Quantidade:</span>
                            <input
                                type="number"
                                min={1}
                                value={item.quantidade || 1}
                                onChange={(e) => {
                                    const val = Math.max(1, Number(e.target.value));
                                    setMaterialContrato(prev => prev.map((m, i) => i === idx ? {...m, quantidade: val} : m));
                                }}
                                style={{ width: '60px', padding: '4px' }}
                            />
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', gap: '5px', marginBottom: '10px' }}>
                            <span style={{ color: '#000' }}>({item.quantidadeCurso || 0})</span>
                            <span style={{ color: '#0275d8' }}>({item.quantidadeCompra || 0})</span>
                            <span style={{ color: '#5cb85c' }}>({item.quantidadeEstoque || 0})</span>
                            <span style={{ color: '#f0ad4e' }}>({item.quantidadeSolicitado || 0})</span>
                        </div>
                        <button
                            className="btnred"
                            style={{ width: '100%', padding: '6px' }}
                            onClick={() => setMaterialContrato(prev => prev.filter((_, i) => i !== idx))}
                        >
                            Remover
                        </button>
                    </div>
                ))}
                {materialContrato.length === 0 && <p>Nenhum material adicionado ao contrato.</p>}
            </div>
        </div>
    );

    const renderValoresCursoTab = () => (
        <div className="valores-curso-tab">
            <div className="form-section">
                <h3>Informações de Valores</h3>

                {renderOferecimentosTable(matriculaSelecionadas)}

                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '15px 0' }}>
                    <div>
                        <label>Forma de Pagamento *</label>
                        <select className="form-input" value={formaPagamento ? String(formaPagamento.id) : ''}
                                onChange={e => handleFormaPagamentoChange(formaPagamentos.find(f => f.id === Number(e.target.value)))}>
                            <option value="">Selecione</option>
                            {formaPagamentos.filter(f => f.ativo).map(f => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.vezes}X - Juros:{f.juros ?? 0}% - Desconto: {f.desconto ?? 0}%
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Pagamento primeira parcela *</label>
                        <input type="date" className="form-input" value={dataPrimeiraParcela}
                               onChange={e => handleDataPrimeiraParcelaChange(e.target.value)} />
                    </div>
                    <div>
                        <label>Pagamento segunda parcela</label>
                        <select className="form-input" value={dataSegundaParcela}
                                onChange={e => setDataSegundaParcela(e.target.value)}>
                            <option value="">Selecione</option>
                            {diasSegundaParcela.map(d => <option key={d} value={d}>{formatDate(d)}</option>)}
                        </select>
                    </div>
                    <div>
                        <label>Valor do Curso</label>
                        <strong>R$ {valorCurso.toFixed(2)}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button type="button" className="btnyellow" disabled={!formaPagamento?.ajuste}
                            onClick={() => alert('Ajuste de parcelas ainda não implementado.')}>
                        <i className="fa fa-dollar"/> Ajuste parcela
                    </button>
                    <button type="button" className="btnred" onClick={() => alert('Bolsa de estudos ainda não implementada.')}>
                        <i className="fa fa-gift"/> Bolsa estudos
                    </button>
                    <button type="button" className="btngreen" disabled={parcelas.length === 0}
                            onClick={() => alert('Taxas adicionais ainda não implementadas.')}>
                        <i className="fa fa-plus"/> Taxas
                    </button>
                </div>

                <h4>Parcelas Selecionadas</h4>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#2f333b', color: '#fff' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Descrição</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Parcela</th>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Data Vencimento</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Valor R$</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcelas.map((p, i) => (
                                <tr key={p.parcela} style={{ background: i % 2 === 0 ? '#ffffff' : '#f7f7f7', borderBottom: '1px solid #e5e5e5' }}>
                                    <td style={{ padding: '8px' }}>{p.descricao}</td>
                                    <td style={{ padding: '8px' }}>{p.parcela}</td>
                                    <td style={{ padding: '8px' }}>{formatDate(p.dataVencimento)}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>R$ {p.valor.toFixed(2)}</td>
                                </tr>
                            ))}
                            {parcelas.length === 0 && (
                                <tr><td colSpan={4} style={{ padding: '8px' }}>Nenhuma parcela calculada. Selecione a forma de pagamento.</td></tr>
                            )}
                        </tbody>
                        {parcelas.length > 0 && (
                            <tfoot>
                                <tr style={{ background: '#eaeaea', fontWeight: 'bold' }}>
                                    <td colSpan={3} style={{ padding: '8px', textAlign: 'right' }}>Total R$</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>
                                        R$ {parcelas.reduce((acc, p) => acc + p.valor, 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );

    const renderValoresMaterialTab = () => {
        const totalQtde = materialContrato.reduce((acc: number, m: any) => acc + (Number(m.quantidade) || 1), 0);
        const totalValor = materialContrato.reduce((acc: number, m: any) => acc + ((Number(m.valor) || 0) * (Number(m.quantidade) || 1)), 0);
        return (
            <div className="valores-material-tab">
                <div className="table_form" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', margin: '15px 0' }}>
                    <div>
                        <label>Forma de Pagamento (Material)</label>
                        <select className="form-input" value={materialFormaPagamento ? String(materialFormaPagamento.id) : ''}
                                onChange={e => setMaterialFormaPagamento(formaPagamentos.find(f => f.id === Number(e.target.value)) ?? null)}>
                            <option value="">Selecione</option>
                            {formaPagamentos.filter(f => f.ativo).map(f => (
                                <option key={f.id} value={String(f.id)}>
                                    {f.vezes}X - Juros:{f.juros ?? 0}% - Desconto: {f.desconto ?? 0}%
                                </option>
                            ))}
                        </select>
                    </div>
                    {materialFormaPagamento && materialFormaPagamento.vezes > 0 && (
                        <div>
                            <label>Vezes</label>
                            <strong>{materialFormaPagamento.vezes}X</strong>
                        </div>
                    )}
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0' }}>
                                <th style={{ padding: '8px', textAlign: 'left' }}>Produto</th>
                                <th style={{ padding: '8px', textAlign: 'center' }}>Qtde</th>
                                <th style={{ padding: '8px', textAlign: 'right' }}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {materialContrato.map((m, idx) => (
                                <tr key={idx}>
                                    <td style={{ padding: '8px' }}>{m.nome}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{Number(m.quantidade) || 1}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>R$ {((Number(m.valor) || 0) * (Number(m.quantidade) || 1)).toFixed(2)}</td>
                                </tr>
                            ))}
                            {materialContrato.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '8px' }}>Nenhum material selecionado.</td></tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2} style={{ padding: '8px' }}>Quantidade total {totalQtde}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>Valor total R$ {totalValor.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        );
    };

    const renderValoresTab = () => (
        <div className="valores-tab">
            <Tabs
                tabs={[
                    { key: 'curso', label: 'Curso', content: renderValoresCursoTab() },
                    { key: 'material', label: 'Material', content: renderValoresMaterialTab() },
                ]}
                initial="curso"
            />
        </div>
    );

    const renderFinalizadaPanel = () => (
        <div className="consultor-panel" style={{ padding: '25px', maxWidth: '980px' }}>
            <h3>Finalizando Processo</h3>
            <p>Matrícula efetuada com sucesso. Clique nos botões abaixo para fazer o download dos respectivos documentos.</p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                <button type="button" className="btnred" disabled={materialContrato.length === 0} onClick={handleBaixarCarneMaterial}>
                    <i className="fa fa-download"/> Gerar Carnê Material
                </button>
                <button type="button" className="btngreen" onClick={handleBaixarCarneMatricula}>
                    <i className="fa fa-download"/> Gerar Carnê Matrícula
                </button>
                <button type="button" className="btnblue" onClick={handleGerarContrato}>
                    <i className="fa fa-file-text-o"/> Gerar Contrato
                </button>
                <button type="button" className="btnsky" onClick={handleGerarPromissoria}>
                    <i className="fa fa-file-text-o"/> Gerar Promissória
                </button>
                <button type="button" className="btnyellow" onClick={handleDigitalizar}>
                    <i className="fa fa-camera"/> Digitalizar
                </button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <button type="button" className="btnstop" onClick={handleNovaMatricula}>
                    <i className="fa fa-plus"/> Nova Matrícula
                </button>
            </div>
        </div>
    );

    if (verificaMatriculaFinalizada) {
        return (
            <PermissionGate permission="READ">
                <main className="consultor-matricula-layout">
                    {renderFinalizadaPanel()}
                    <PessoaFisicaFormModal
                        open={showPessoaFisicaModal}
                        mode={pessoaFisicaModalMode}
                        editId={pessoaFisicaEditId}
                        onClose={() => setShowPessoaFisicaModal(false)}
                        onSaved={(id) => {
                            setContrato(prev => ({ ...prev, pessoa: { id, label: `Pessoa ${id}` } }));
                            calcularInfoPanels(id);
                        }}
                    />
                    <PessoaJuridicaFormModal
                        open={showPessoaJuridicaModal}
                        mode={pessoaJuridicaModalMode}
                        editId={pessoaJuridicaEditId}
                        onClose={() => setShowPessoaJuridicaModal(false)}
                        onSaved={(id) => {
                            setContrato(prev => ({ ...prev, responsavel: { id, label: `Pessoa ${id}` } }));
                        }}
                    />
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main className="consultor-matricula-layout">
                <Wizard
                    steps={[
                        {
                            key: 'contrato',
                            label: 'Contrato',
                            content: renderContratoTab(),
                            validate: validateContrato,
                        },
                        {
                            key: 'matricula',
                            label: 'Matrícula',
                            content: renderMatriculaTab(),
                            validate: validateMatricula,
                        },
                        {
                            key: 'material',
                            label: 'Material',
                            content: renderMaterialTab(),
                        },
                        {
                            key: 'valores',
                            label: 'Valores',
                            nextLabel: 'Finalizar Matrícula',
                            content: renderValoresTab(),
                            validate: validateValores,
                            onEnter: loadValorCurso,
                        },
                    ]}
                    onComplete={() => handleFinalizarMatricula()}
                />
                <PessoaFisicaFormModal
                    open={showPessoaFisicaModal}
                    mode={pessoaFisicaModalMode}
                    editId={pessoaFisicaEditId}
                    onClose={() => setShowPessoaFisicaModal(false)}
                    onSaved={(id) => {
                        setContrato(prev => ({ ...prev, pessoa: { id, label: `Pessoa ${id}` } }));
                        calcularInfoPanels(id);
                    }}
                />
                <PessoaJuridicaFormModal
                    open={showPessoaJuridicaModal}
                    mode={pessoaJuridicaModalMode}
                    editId={pessoaJuridicaEditId}
                    onClose={() => setShowPessoaJuridicaModal(false)}
                    onSaved={(id) => {
                        setContrato(prev => ({ ...prev, responsavel: { id, label: `Pessoa ${id}` } }));
                    }}
                />
            </main>
        </PermissionGate>
    );
}
