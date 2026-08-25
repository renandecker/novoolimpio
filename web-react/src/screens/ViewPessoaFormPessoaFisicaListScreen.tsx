import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {BooleanField} from '../BooleanField';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {api} from '../api';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';
import {buscarCep, formatCep} from '../EnderecoForm';
import {useQuery} from '@tanstack/react-query';

interface FormState {
    cpf: string;
    rg: string;
    nome: string;
    email: string;
    nomeSocial: string;
    dataNascimento: string;
    cidadeOrigem: string;
    generoId: string;
    etniaId: string;
    estadoCivilId: string;
    escolaridadeId: string;
    nomeReferencia: string;
    telefoneReferencia: string;
    celularReferencia: string;
    nomeReferencia2: string;
    telefoneReferencia2: string;
    celularReferencia2: string;
    nomePai: string;
    nomeMae: string;
    telefoneResidencial: string;
    telefoneComercial: string;
    celular: string;
    facebook: string;
    twitter: string;
    googlePlus: string;
    telegram: string;
    observacao: string;
    cep: string;
    cidade: string;
    bairro: string;
    logradouro: string;
    numero: string;
    complemento: string;
}

const FORM_VAZIO: FormState = {
    cpf: '',
    rg: '',
    nome: '',
    email: '',
    nomeSocial: '',
    dataNascimento: '',
    cidadeOrigem: '',
    generoId: '',
    etniaId: '',
    estadoCivilId: '',
    escolaridadeId: '',
    nomeReferencia: '',
    telefoneReferencia: '',
    celularReferencia: '',
    nomeReferencia2: '',
    telefoneReferencia2: '',
    celularReferencia2: '',
    nomePai: '',
    nomeMae: '',
    telefoneResidencial: '',
    telefoneComercial: '',
    celular: '',
    facebook: '',
    twitter: '',
    googlePlus: '',
    telegram: '',
    observacao: '',
    cep: '',
    cidade: '',
    bairro: '',
    logradouro: '',
    numero: '',
    complemento: '',
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

export default function ViewPessoaFormPessoaFisicaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [form, setForm] = useState<FormState>(FORM_VAZIO);
    const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [curriculo, setCurriculo] = useState(false);
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [avisoCep, setAvisoCep] = useState('');
    const [salvando, setSalvando] = useState(false);

    const {data: allUnidades = []} = useQuery({
        queryKey: [UNIDADE_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,
    });

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${idParam}`)).data;
                let pes: Record<string, unknown> | null = null;
                if (pf.pessoaId) {
                    pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;
                }
                if (!ativo) return;
                setPfId(pf.id as number);
                setPfOriginal(pf);
                setPessoaId(pes?.id as number | undefined);
                setPessoaOriginal(pes);

                let logradouroDesc = '';
                let bairroDesc = '';
                let cidadeDesc = '';
                const idLogradouro = (pes?.id_logradouro ?? pes?.logradouroId) as number | null | undefined;
                if (idLogradouro) {
                    try {
                        const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLogradouro}`)).data;
                        logradouroDesc = str(logRes.descricao);
                        const idBairro = logRes.id_bairro as number | null | undefined;
                        if (idBairro) {
                            const bairroRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${idBairro}`)).data;
                            bairroDesc = str(bairroRes.descricao);
                            const idCidade = bairroRes.cidadeId as number | null | undefined;
                            if (idCidade) {
                                const cidadeRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${idCidade}`)).data;
                                cidadeDesc = str(cidadeRes.nome);
                            }
                        }
                    } catch {
                        // ignore
                    }
                }

                setForm({
                    cpf: str(pf.cpf),
                    rg: str(pf.rg),
                    nome: str(pf.nome),
                    email: str(pes?.email),
                    nomeSocial: str(pf.nomeSocial),
                    dataNascimento: toDateInput(pf.dataNascimento),
                    cidadeOrigem: str(pf.cidadeOrigem),
                    generoId: pf.generoId !== null && pf.generoId !== undefined ? String(pf.generoId) : '',
                    etniaId: pf.etniaId !== null && pf.etniaId !== undefined ? String(pf.etniaId) : '',
                    estadoCivilId: pf.estadoCivilId !== null && pf.estadoCivilId !== undefined ? String(pf.estadoCivilId) : '',
                    escolaridadeId: pf.escolaridadeId !== null && pf.escolaridadeId !== undefined ? String(pf.escolaridadeId) : '',
                    nomeReferencia: str(pf.nomeReferencia),
                    telefoneReferencia: str(pf.telefoneReferencia),
                    celularReferencia: str(pf.celularReferencia),
                    nomeReferencia2: str(pf.nomeReferencia2),
                    telefoneReferencia2: str(pf.telefoneReferencia2),
                    celularReferencia2: str(pf.celularReferencia2),
                    nomePai: str(pf.nomePai),
                    nomeMae: str(pf.nomeMae),
                    telefoneResidencial: str(pes?.telefone),
                    telefoneComercial: str(pf.telefoneComercial),
                    celular: str(pes?.celular),
                    facebook: str(pf.facebook),
                    twitter: str(pf.twitter),
                    googlePlus: str(pf.googlePlus),
                    telegram: str(pf.telegram),
                    observacao: str(pes?.observacao),
                    cep: str(pes?.cep),
                    cidade: cidadeDesc,
                    bairro: bairroDesc,
                    logradouro: logradouroDesc,
                    numero: str(pes?.numero),
                    complemento: str(pes?.complemento),
                });

                if (pes?.id) {
                    try {
                        const unidadesIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades-disponiveis`, {params: {pessoaId: pes.id}})).data;
                        if (unidadesIds && unidadesIds.length > 0) {
                            const unidadesSet = new Set(unidadesIds.map(String));
                            setUnidades(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                        }
                    } catch {
                        try {
                            // Tenta endpoint alternativo por ID de entidade se houver
                            const unidadesIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades`, {params: {entityId: pes.id}})).data;
                            if (unidadesIds && unidadesIds.length > 0) {
                                const unidadesSet = new Set(unidadesIds.map(String));
                                setUnidades(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                            }
                        } catch {
                            // ignore
                        }
                    }
                }
            } catch (erro) {
                console.error('Erro ao carregar pessoa física:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam, allUnidades]);

    const set = (campo: keyof FormState, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const voltar = () => navigate('/view/pessoa/listPessoaFisica');

    const handleBuscarCep = async () => {
        setAvisoCep('');
        setBuscandoCep(true);
        const dados = await buscarCep(form.cep);
        setBuscandoCep(false);
        if (dados) {
            setForm((prev) => ({
                ...prev,
                cep: dados.cep ?? prev.cep,
                cidade: dados.cidade ?? prev.cidade,
                bairro: dados.bairro ?? prev.bairro,
                logradouro: dados.logradouro ?? prev.logradouro,
            }));
        } else {
            setAvisoCep('CEP não encontrado.');
        }
    };

    const salvar = async (voltarDepois: boolean) => {
        if (!form.nome.trim() || !form.cpf.trim()) {
            alert('Informe pelo menos Nome e CPF.');
            return;
        }
        setSalvando(true);
        try {
            const pfBody: Record<string, unknown> = {
                ...semId(pfOriginal),
                nome: form.nome,
                cpf: form.cpf,
                rg: form.rg,
                nomeSocial: form.nomeSocial || null,
                dataNascimento: form.dataNascimento || null,
                cidadeOrigem: form.cidadeOrigem || null,
                generoId: num(form.generoId),
                etniaId: num(form.etniaId),
                estadoCivilId: num(form.estadoCivilId),
                escolaridadeId: num(form.escolaridadeId),
                nomeReferencia: form.nomeReferencia || null,
                telefoneReferencia: form.telefoneReferencia || null,
                celularReferencia: form.celularReferencia || null,
                nomeReferencia2: form.nomeReferencia2 || null,
                telefoneReferencia2: form.telefoneReferencia2 || null,
                celularReferencia2: form.celularReferencia2 || null,
                nomePai: form.nomePai || null,
                nomeMae: form.nomeMae || null,
                telefoneComercial: form.telefoneComercial || null,
                facebook: form.facebook || null,
                twitter: form.twitter || null,
                googlePlus: form.googlePlus || null,
            };
            delete pfBody.telegram;
            const respostaPf = pfId
                ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)
                : await api.post('/api/basico/pessoa-fisica', pfBody);
            const novoPfId = (respostaPf.data as Record<string, unknown>)?.id ?? pfId;

            const pessoaBody: Record<string, unknown> = {
                ...semId(pessoaOriginal),
                email: form.email || null,
                telefone: form.telefoneResidencial || null,
                celular: form.celular || null,
                observacao: form.observacao || null,
                cep: form.cep || null,
                numero: form.numero || null,
                complemento: form.complemento || null,
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
            if (voltarDepois) {
                voltar();
            } else {
                alert('Registro salvo com sucesso.');
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            alert('Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const tabs: TabItem[] = [
        {
            key: 'identificacao',
            label: 'Identificação',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CPF *</span>
                        <input className="form-input" placeholder="999.999.999-99" value={form.cpf}
                               onChange={(e) => set('cpf', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">RG *</span>
                        <input className="form-input" placeholder="RG" value={form.rg}
                               onChange={(e) => set('rg', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome *</span>
                        <input className="form-input" placeholder="Nome completo" style={{gridColumn: 'span 3'}}
                               value={form.nome} onChange={(e) => set('nome', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail *</span>
                        <input className="form-input" type="email" placeholder="E-mail"
                               style={{gridColumn: 'span 3'}} value={form.email}
                               onChange={(e) => set('email', e.target.value)}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Nome Social *</span>
                        <input className="form-input" placeholder="Nome social" style={{gridColumn: 'span 3'}}
                               value={form.nomeSocial} onChange={(e) => set('nomeSocial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date" value={form.dataNascimento}
                               onChange={(e) => set('dataNascimento', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Cidade Origem *</span>
                        <input className="form-input" placeholder="Cidade de origem" style={{gridColumn: 'span 3'}}
                               value={form.cidadeOrigem} onChange={(e) => set('cidadeOrigem', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Gênero</span>
                        <select className="form-input form-select" value={form.generoId}
                                onChange={(e) => set('generoId', e.target.value)}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Masculino</option>
                            <option value="2">Feminino</option>
                            <option value="3">Outro</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Etnia</span>
                        <select className="form-input form-select" value={form.etniaId}
                                onChange={(e) => set('etniaId', e.target.value)}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Branca</option>
                            <option value="2">Preta</option>
                            <option value="3">Parda</option>
                            <option value="4">Amarela</option>
                            <option value="5">Indígena</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Estado Civil *</span>
                        <select className="form-input form-select" value={form.estadoCivilId}
                                onChange={(e) => set('estadoCivilId', e.target.value)}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Solteiro(a)</option>
                            <option value="2">Casado(a)</option>
                            <option value="3">Divorciado(a)</option>
                            <option value="4">Viúvo(a)</option>
                            <option value="5">União Estável</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Escolaridade *</span>
                        <select className="form-input form-select" value={form.escolaridadeId}
                                onChange={(e) => set('escolaridadeId', e.target.value)}>
                            <option value="">-- Selecione --</option>
                            <option value="1">Ensino Fundamental Incompleto</option>
                            <option value="2">Ensino Fundamental Completo</option>
                            <option value="3">Ensino Médio Incompleto</option>
                            <option value="4">Ensino Médio Completo</option>
                            <option value="5">Superior Incompleto</option>
                            <option value="6">Superior Completo</option>
                            <option value="7">Pós-Graduação</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência"
                               style={{gridColumn: 'span 3'}} value={form.nomeReferencia}
                               onChange={(e) => set('nomeReferencia', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneReferencia} onChange={(e) => set('telefoneReferencia', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"
                               value={form.celularReferencia} onChange={(e) => set('celularReferencia', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência 2</span>
                        <input className="form-input" placeholder="Nome da referência 2"
                               style={{gridColumn: 'span 3'}} value={form.nomeReferencia2}
                               onChange={(e) => set('nomeReferencia2', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência 2</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneReferencia2} onChange={(e) => set('telefoneReferencia2', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência 2</span>
                        <input className="form-input" placeholder="(99) 99999-9999"
                               value={form.celularReferencia2} onChange={(e) => set('celularReferencia2', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome do Pai</span>
                        <input className="form-input" placeholder="Nome do pai" style={{gridColumn: 'span 3'}}
                               value={form.nomePai} onChange={(e) => set('nomePai', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome da Mãe *</span>
                        <input className="form-input" placeholder="Nome da mãe" style={{gridColumn: 'span 3'}}
                               value={form.nomeMae} onChange={(e) => set('nomeMae', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Foto</span>
                        <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Capturar Foto</button>
                        </div>
                    </label>
                </div>
            ),
        },
        {
            key: 'contatos',
            label: 'Contatos',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneResidencial} onChange={(e) => set('telefoneResidencial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Comercial</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneComercial} onChange={(e) => set('telefoneComercial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.celular}
                               onChange={(e) => set('celular', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Facebook</span>
                        <input className="form-input" placeholder="facebook.com/usuario"
                               style={{gridColumn: 'span 3'}} value={form.facebook}
                               onChange={(e) => set('facebook', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Twitter</span>
                        <input className="form-input" placeholder="@usuario" style={{gridColumn: 'span 3'}}
                               value={form.twitter} onChange={(e) => set('twitter', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Google+</span>
                        <input className="form-input" placeholder="plus.google.com/usuario"
                               style={{gridColumn: 'span 3'}} value={form.googlePlus}
                               onChange={(e) => set('googlePlus', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telegram</span>
                        <input className="form-input" placeholder="@usuario" style={{gridColumn: 'span 3'}}
                               value={form.telegram} onChange={(e) => set('telegram', e.target.value)}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CEP</span>
                        <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                            <input
                                className="form-input"
                                placeholder="99.999-999"
                                style={{width: '120px'}}
                                maxLength={9}
                                value={form.cep}
                                onChange={(e) => {
                                    setAvisoCep('');
                                    set('cep', formatCep(e.target.value));
                                }}
                            />
                            <button
                                type="button"
                                className="btnyellow"
                                disabled={buscandoCep || form.cep.replace(/\D/g, '').length !== 8}
                                onClick={handleBuscarCep}
                            >
                                {buscandoCep ? 'Buscando...' : 'Busca'}
                            </button>
                        </div>
                        {avisoCep && <small style={{color: '#c0392b'}}>{avisoCep}</small>}
                    </label>
                    <label className="form-field">
                        <span className="form-label">Cidade</span>
                        <input
                            className="form-input"
                            placeholder="Cidade"
                            style={{gridColumn: 'span 3'}}
                            value={form.cidade}
                            onChange={(e) => set('cidade', e.target.value)}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Bairro</span>
                        <input
                            className="form-input"
                            placeholder="Bairro"
                            style={{gridColumn: 'span 3'}}
                            value={form.bairro}
                            onChange={(e) => set('bairro', e.target.value)}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Logradouro</span>
                        <input
                            className="form-input"
                            placeholder="Logradouro"
                            style={{gridColumn: 'span 3'}}
                            value={form.logradouro}
                            onChange={(e) => set('logradouro', e.target.value)}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Número</span>
                        <input
                            className="form-input"
                            placeholder="Número"
                            value={form.numero}
                            onChange={(e) => set('numero', e.target.value)}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Complemento</span>
                        <textarea
                            className="form-input"
                            placeholder="Complemento"
                            rows={3}
                            style={{gridColumn: 'span 3', minHeight: '80px'}}
                            value={form.complemento}
                            onChange={(e) => set('complemento', e.target.value)}
                        />
                    </label>
                </div>
            ),
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <MasterDetail
                    label="Unidade"
                    source={UNIDADE_SOURCE}
                    valueKey="id"
                    searchKeys={UNIDADE_SEARCH}
                    columns={UNIDADE_COLUMNS}
                    items={unidades}
                    onChange={setUnidades}
                />
            ),
        },
        {
            key: 'outros',
            label: 'Outros',
            content: (
                <div className="form-grid">
                    <div className="form-field">
                        <span className="form-label">Currículo / Banco de Talentos</span>
                        <BooleanField value={curriculo} onChange={setCurriculo}/>
                    </div>
                    <label className="form-field">
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={5}
                                  style={{gridColumn: 'span 3', minHeight: '100px'}} value={form.observacao}
                                  onChange={(e) => set('observacao', e.target.value)}/>
                    </label>
                </div>
            ),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Pessoa Física</h1>
                <div className="div_form">
                    <div className="form-title">{pfId ? `Pessoa Física #${pfId}` : 'Pessoa Física'}</div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="identificacao"/>
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Salvar registro"
                                    disabled={salvando} onClick={() => void salvar(true)}>Gravar
                            </button>
                            <button type="button" className="btnstop" title="Salvar e continuar editando"
                                    disabled={salvando} onClick={() => void salvar(false)}>
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar}>Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
