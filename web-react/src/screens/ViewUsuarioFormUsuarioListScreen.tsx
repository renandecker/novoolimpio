import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {BooleanField} from '../BooleanField';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {
    AGENDA_SOURCE,
    AGENDA_COLUMNS,
    AGENDA_SEARCH,
    PERFIL_SOURCE,
    PERFIL_COLUMNS,
    PERFIL_SEARCH,
    TURNO_TRABALHO_SOURCE,
    TURNO_TRABALHO_COLUMNS,
    TURNO_TRABALHO_SEARCH,
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {api} from '../api';
import {useQuery} from '@tanstack/react-query';
import {EnderecoCampos} from '../EnderecoForm';
import type {Endereco} from '../EnderecoForm';

interface Logradouro {
    id: number;
    descricao: string;
    cep: string;
    id_bairro: number;
}

interface Bairro {
    id: number;
    descricao: string;
    cidadeId: number;
}

interface Cidade {
    id: number;
    nome: string;
}

interface DocumentoUploadProps {
    label: string;
    obrigatorio?: boolean;
}

function DocumentoUpload({label, obrigatorio = false}: DocumentoUploadProps) {
    return (
        <>
            <span className="form-label" style={{fontWeight: 'bold'}}>
                {label} {obrigatorio ? '*' : ''}
            </span>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                <input type="file" accept="image/*,application/pdf" className="form-input" style={{flex: 1}}/>
                <button type="button" className="btn-action btnyellow" title="Visualizar documento">👁</button>
            </div>
        </>
    );
}

interface FormState {
    cpf: string;
    rg: string;
    nome: string;
    email: string;
    nomeSocial: string;
    dataNascimento: string;
    generoId: string;
    etniaId: string;
    estadoCivilId: string;
    escolaridadeId: string;
    nomePai: string;
    nomeMae: string;
    telefoneResidencial: string;
    celular: string;
    nomeReferencia: string;
    telefoneReferencia: string;
    celularReferencia: string;
    nomeReferencia2: string;
    telefoneReferencia2: string;
    celularReferencia2: string;
}

const FORM_VAZIO: FormState = {
    cpf: '',
    rg: '',
    nome: '',
    email: '',
    nomeSocial: '',
    dataNascimento: '',
    generoId: '',
    etniaId: '',
    estadoCivilId: '',
    escolaridadeId: '',
    nomePai: '',
    nomeMae: '',
    telefoneResidencial: '',
    celular: '',
    nomeReferencia: '',
    telefoneReferencia: '',
    celularReferencia: '',
    nomeReferencia2: '',
    telefoneReferencia2: '',
    celularReferencia2: '',
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

export default function ViewUsuarioFormUsuarioListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [ativo, setAtivo] = useState(true);
    const [relatorio, setRelatorio] = useState(false);
    const [mensalista, setMensalista] = useState<'M' | 'H'>('M');
    const [perfis, setPerfis] = useState<ApiItem[]>([]);
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [unidadesAcesso, setUnidadesAcesso] = useState<ApiItem[]>([]);
    const [turnos, setTurnos] = useState<ApiItem[]>([]);
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
    const [salvando, setSalvando] = useState(false);

    const [usuarioId, setUsuarioId] = useState<number | undefined>();
    const [usuarioOriginal, setUsuarioOriginal] = useState<Record<string, unknown> | null>(null);
    const [pfId, setPfId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pfOriginal, setPfOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [form, setForm] = useState<FormState>(FORM_VAZIO);

    const {data: allUnidades = []} = useQuery({
        queryKey: [UNIDADE_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(UNIDADE_SOURCE)).data,
    });
    const {data: allPerfis = []} = useQuery({
        queryKey: [PERFIL_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(PERFIL_SOURCE)).data,
    });
    const {data: allAgendas = []} = useQuery({
        queryKey: [AGENDA_SOURCE],
        queryFn: async () => (await api.get<ApiItem[]>(AGENDA_SOURCE)).data,
    });

    useEffect(() => {
        if (!idParam) return;
        let ativoReq = true;
        (async () => {
            try {
                const usu = (await api.get<Record<string, unknown>>(`/api/basico/usuario/${idParam}`)).data;
                let pes: Record<string, unknown> | null = null;
                let pf: Record<string, unknown> | null = null;
                if (usu.pessoaId) {
                    pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${usu.pessoaId}`)).data;
                    if (pes?.id) {
                        pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/por-pessoa/${pes.id}`)).data;
                    }
                }
                if (!ativoReq) return;
                setUsuarioId(usu.id as number);
                setUsuarioOriginal(usu);
                setAtivo(usu.ativo !== false);
                setPessoaId(pes?.id as number | undefined);
                setPessoaOriginal(pes);
                setPfId(pf?.id as number | undefined);
                setPfOriginal(pf);
                setForm({
                    cpf: str(pf?.cpf),
                    rg: str(pf?.rg),
                    nome: str(pf?.nome),
                    email: str(pes?.email),
                    nomeSocial: str(pf?.nomeSocial),
                    dataNascimento: toDateInput(pf?.dataNascimento),
                    generoId: pf?.generoId !== null && pf?.generoId !== undefined ? String(pf.generoId) : '',
                    etniaId: pf?.etniaId !== null && pf?.etniaId !== undefined ? String(pf.etniaId) : '',
                    estadoCivilId: pf?.estadoCivilId !== null && pf?.estadoCivilId !== undefined ? String(pf.estadoCivilId) : '',
                    escolaridadeId: pf?.escolaridadeId !== null && pf?.escolaridadeId !== undefined ? String(pf.escolaridadeId) : '',
                    nomePai: str(pf?.nomePai),
                    nomeMae: str(pf?.nomeMae),
                    telefoneResidencial: str(pes?.telefone),
                    celular: str(pes?.celular),
                    nomeReferencia: str(pf?.nomeReferencia),
                    telefoneReferencia: str(pf?.telefoneReferencia),
                    celularReferencia: str(pf?.celularReferencia),
                    nomeReferencia2: str(pf?.nomeReferencia2),
                    telefoneReferencia2: str(pf?.telefoneReferencia2),
                    celularReferencia2: str(pf?.celularReferencia2),
                });

                // Carregar endereço da pessoa
                if (pes) {
                    const enderecosCarregados: Endereco[] = [];
                    const cep = str(pes.cep);
                    const complemento = str(pes.complemento);
                    const numero = str(pes.numero);
                    const idLogradouro = (pes.id_logradouro ?? pes.logradouroId) as number | null | undefined;

                    if (idLogradouro) {
                        try {
                            const logradouro = (await api.get<Logradouro>(`/api/basico/logradouro/${idLogradouro}`)).data;
                            let bairroDescricao = '';
                            let cidadeDescricao = '';
                            if (logradouro.id_bairro) {
                                const bairro = (await api.get<Bairro>(`/api/basico/bairro/${logradouro.id_bairro}`)).data;
                                bairroDescricao = bairro.descricao;
                                if (bairro.cidadeId) {
                                    const cidade = (await api.get<Cidade>(`/api/basico/cidade/${bairro.cidadeId}`)).data;
                                    cidadeDescricao = cidade.nome;
                                }
                            }
                            enderecosCarregados.push({
                                id: idLogradouro,
                                cep: logradouro.cep || cep,
                                logradouro: logradouro.descricao,
                                bairro: bairroDescricao,
                                cidade: cidadeDescricao,
                                numero,
                                complemento,
                            });
                        } catch {
                            // Se falhar ao buscar logradouro/bairro/cidade, usa apenas dados da pessoa
                            if (cep || numero || complemento) {
                                enderecosCarregados.push({
                                    cep,
                                    cidade: '',
                                    bairro: '',
                                    logradouro: '',
                                    numero,
                                    complemento,
                                });
                            }
                        }
                    } else if (cep || numero || complemento) {
                        enderecosCarregados.push({
                            cep,
                            cidade: '',
                            bairro: '',
                            logradouro: '',
                            numero,
                            complemento,
                        });
                    }
                    setEnderecos(enderecosCarregados);
                }

                const usuarioIdNum = usu.id as number;
                const [unidadesIds, agendasIds, perfisIds] = await Promise.all([
                    api.get<number[]>(`/api/basico/usuario/buscar-unidades-disponiveis`, {params: {usuarioId: usuarioIdNum}}).then(r => r.data),
                    api.get<number[]>(`/api/basico/usuario/buscar-agendas-disponiveis`, {params: {usuarioId: usuarioIdNum}}).then(r => r.data),
                    api.get<number[]>(`/api/basico/usuario/buscar-usuario-seu-perfil`, {params: {entityId: usuarioIdNum}}).then(r => r.data),
                ]);

                const unidadesSet = new Set(unidadesIds.map(String));
                const agendasSet = new Set(agendasIds.map(String));
                const perfisSet = new Set(perfisIds.map(String));

                setUnidadesAcesso(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                setAgendas(allAgendas.filter(a => agendasSet.has(String((a as Record<string, unknown>).id))));
                setPerfis(allPerfis.filter(p => perfisSet.has(String((p as Record<string, unknown>).id))));

                const turnosResp = await api.get<Record<string, unknown>[]>(`/api/basico/usuario/buscar-usuario-com-turnos`, {params: {entityId: usuarioIdNum}});
                // TODO: Backend endpoint only returns user ID, not turnos. Need backend fix to return associated turnos.
            } catch (erro) {
                console.error('Erro ao carregar usuário:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativoReq = false;
        };
    }, [idParam, allUnidades, allPerfis, allAgendas]);

    const set = (campo: keyof FormState, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const voltar = () => navigate('/view/usuario/listUsuario');

    const salvar = async (voltarDepois: boolean) => {
        if (!form.nome.trim()) {
            alert('Informe o Nome.');
            return;
        }
        setSalvando(true);
        try {
            if (usuarioId) {
                await api.put(`/api/basico/usuario/${usuarioId}`, {...semId(usuarioOriginal), ativo});
            }
            const enderecoPrincipal = enderecos[0];
            if (pfId || !pessoaId) {
                const pfBody: Record<string, unknown> = {
                    ...semId(pfOriginal),
                    nome: form.nome,
                    cpf: form.cpf || null,
                    rg: form.rg || null,
                    nomeSocial: form.nomeSocial || null,
                    dataNascimento: form.dataNascimento || null,
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
                };
                const respostaPf = pfId
                    ? await api.put(`/api/basico/pessoa-fisica/${pfId}`, pfBody)
                    : await api.post('/api/basico/pessoa-fisica', pfBody);
                const novoPfId = (respostaPf.data as Record<string, unknown>)?.id ?? pfId;

                const pessoaBody: Record<string, unknown> = {
                    ...semId(pessoaOriginal),
                    email: form.email || null,
                    telefone: form.telefoneResidencial || null,
                    celular: form.celular || null,
                    numero: enderecoPrincipal?.numero || null,
                    complemento: enderecoPrincipal?.complemento || null,
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
            } else if (pessoaId) {
                await api.put(`/api/basico/pessoa/${pessoaId}`, {
                    ...semId(pessoaOriginal),
                    email: form.email || null,
                    telefone: form.telefoneResidencial || null,
                    celular: form.celular || null,
                });
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
            key: 'pessoal',
            label: 'Pessoal',
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
                    <label className="form-field">
                        <span className="form-label">Nome Social</span>
                        <input className="form-input" placeholder="Nome social" style={{gridColumn: 'span 3'}}
                               value={form.nomeSocial} onChange={(e) => set('nomeSocial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date" value={form.dataNascimento}
                               onChange={(e) => set('dataNascimento', e.target.value)}/>
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
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneResidencial} onChange={(e) => set('telefoneResidencial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.celular}
                               onChange={(e) => set('celular', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência"
                               style={{gridColumn: 'span 3'}} value={form.nomeReferencia}
                               onChange={(e) => set('nomeReferencia', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência</span>
                        <input className="form-input" placeholder="(99) 9999-9999"
                               value={form.telefoneReferencia} onChange={(e) => set('telefoneReferencia', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência</span>
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
                        <span className="form-label">Sexo *</span>
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
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <EnderecoCampos value={enderecos} onChange={setEnderecos}/>
                </div>
            ),
        },
        {
            key: 'documentos',
            label: 'Documentos',
            content: (
                <>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">CTPS *</span>
                            <input className="form-input" placeholder="Carteira de Trabalho"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Série *</span>
                            <input className="form-input" placeholder="Série"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">PIS *</span>
                            <input className="form-input" placeholder="999.9999.999-9"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Data Emissão RG</span>
                            <input className="form-input" type="date"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Órgão Emissor</span>
                            <input className="form-input" placeholder="Órgão Emissor"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Título Eleitor</span>
                            <input className="form-input" placeholder="Título de Eleitor"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Zona</span>
                            <input className="form-input" placeholder="Zona"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Seção</span>
                            <input className="form-input" placeholder="Seção"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Carteira Reservista</span>
                            <input className="form-input" placeholder="Carteira de Reservista"/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Qtd. Filhos Menores de 14</span>
                            <input className="form-input" type="number" placeholder="Quantidade"/>
                        </label>
                    </div>
                    <fieldset className="form-fieldset">
                        <legend>Documentos Digitalizados
                            <small> (campos com * são obrigatórios)</small>
                        </legend>
                        <div className="form-grid">
                            <DocumentoUpload label="Foto 3x4" obrigatorio/>
                            <DocumentoUpload label="Carteira de Trabalho - Pág. 1" obrigatorio/>
                            <DocumentoUpload label="Carteira de Trabalho - Pág. 2" obrigatorio/>
                            <DocumentoUpload label="Contrato de Trabalho" obrigatorio/>
                            <DocumentoUpload label="Comprovante de Residência" obrigatorio/>
                            <DocumentoUpload label="CPF" obrigatorio/>
                            <DocumentoUpload label="RG - Frente"/>
                            <DocumentoUpload label="RG - Verso"/>
                            <DocumentoUpload label="Título Eleitoral"/>
                            <DocumentoUpload label="Carteira de Reservista"/>
                            <DocumentoUpload label="Certidão de Nascimento dos Filhos Menores" obrigatorio/>
                            <DocumentoUpload label="Carteira de Vacinação dos Filhos Menores" obrigatorio/>
                        </div>
                    </fieldset>
                </>
            ),
        },
        {
            key: 'trabalho',
            label: 'Trabalho',
            content: (
                <div className="form-grid">
                    <div className="form-field">
                        <span className="form-label">Usuário Ativo</span>
                        <BooleanField value={ativo} onChange={setAtivo}/>
                    </div>
                    <label className="form-field">
                        <span className="form-label">Função *</span>
                        <select className="form-input form-select" style={{gridColumn: 'span 3'}}>
                            <option value="">-- Selecione --</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Admissão</span>
                        <input className="form-input" type="date"/>
                    </label>
                    <div className="form-field">
                        <span className="form-label">Vínculo</span>
                        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                <input type="radio" name="vinculo" checked={mensalista === 'M'}
                                       onChange={() => setMensalista('M')}/>
                                Mensalista
                            </label>
                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                                <input type="radio" name="vinculo" checked={mensalista === 'H'}
                                       onChange={() => setMensalista('H')}/>
                                Horista
                            </label>
                        </div>
                    </div>
                    {mensalista === 'M' && (
                        <div className="form-field" style={{gridColumn: 'span 4'}}>
                            <MasterDetail
                                label="Turnos de Trabalho"
                                source={TURNO_TRABALHO_SOURCE}
                                valueKey="id"
                                searchKeys={TURNO_TRABALHO_SEARCH}
                                columns={TURNO_TRABALHO_COLUMNS}
                                items={turnos}
                                onChange={setTurnos}
                            />
                        </div>
                    )}
                    <div className="form-field">
                        <span className="form-label">Relatório</span>
                        <BooleanField value={relatorio} onChange={setRelatorio}/>
                    </div>
                    <label className="form-field">
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={3}
                                  style={{gridColumn: 'span 3', minHeight: '80px'}}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'acesso',
            label: 'Acessos',
            content: (
                <Tabs
                    tabs={[
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
                                    items={unidadesAcesso}
                                    onChange={setUnidadesAcesso}
                                />
                            ),
                        },
                        {
                            key: 'perfis',
                            label: 'Perfis',
                            content: (
                                <MasterDetail
                                    label="Perfil"
                                    source={PERFIL_SOURCE}
                                    valueKey="id"
                                    searchKeys={PERFIL_SEARCH}
                                    columns={PERFIL_COLUMNS}
                                    items={perfis}
                                    onChange={setPerfis}
                                />
                            ),
                        },
                        {
                            key: 'agendas',
                            label: 'Agendas',
                            content: (
                                <MasterDetail
                                    label="Agenda"
                                    source={AGENDA_SOURCE}
                                    valueKey="id"
                                    searchKeys={AGENDA_SEARCH}
                                    columns={AGENDA_COLUMNS}
                                    items={agendas}
                                    onChange={setAgendas}
                                />
                            ),
                        },
                    ]}
                    initial="unidades"
                />
            ),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Usuário</h1>
                <div className="div_form">
                    <div className="form-title">{usuarioId ? `Usuário #${usuarioId}` : 'Usuário'}</div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="pessoal"/>
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
