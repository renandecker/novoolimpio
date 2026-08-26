import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {api} from '../api';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';
import {EnderecoCampos} from '../EnderecoForm';
import type {Endereco} from '../EnderecoForm';
import {useQuery} from '@tanstack/react-query';

interface FormState {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoMunicipal: string;
    inscricaoEstadual: string;
    email: string;
    fax: string;
    telefone: string;
    celular: string;
    observacao: string;
}

const FORM_VAZIO: FormState = {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    inscricaoMunicipal: '',
    inscricaoEstadual: '',
    email: '',
    fax: '',
    telefone: '',
    celular: '',
    observacao: '',
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

export default function ViewPessoaFormPessoaJuridicaListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [form, setForm] = useState<FormState>(FORM_VAZIO);
    const [pjId, setPjId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pjOriginal, setPjOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [enderecos, setEnderecos] = useState<Endereco[]>([]);
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
                const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${idParam}`)).data;
                let pes: Record<string, unknown> | null = null;
                if (pj.pessoaId) {
                    pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;
                }
                if (!ativo) return;
                setPjId(pj.id as number);
                setPjOriginal(pj);
                setPessoaId(pes?.id as number | undefined);
                setPessoaOriginal(pes);

                setForm({
                    cnpj: str(pj.cnpj),
                    razaoSocial: str(pj.razaoSocial),
                    nomeFantasia: str(pj.nomeFantasia),
                    inscricaoMunicipal: str(pj.inscricaoMunicipal),
                    inscricaoEstadual: str(pj.inscricaoEstadual),
                    email: str(pes?.email),
                    fax: str(pj.fax),
                    telefone: str(pes?.telefone),
                    celular: str(pes?.celular),
                    observacao: str(pes?.observacao),
                });

                if (pes) {
                    const enderecosCarregados: Endereco[] = [];
                    const cep = str(pes.cep);
                    const complemento = str(pes.complemento);
                    const numero = str(pes.numero);
                    const idLogradouro = (pes.id_logradouro ?? pes.logradouroId) as number | null | undefined;

                    if (idLogradouro) {
                        try {
                            const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLogradouro}`)).data;
                            let bairroDesc = '';
                            let cidadeDesc = '';
                            if (logRes.id_bairro) {
                                const bairroRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                bairroDesc = str(bairroRes.descricao);
                                if (bairroRes.cidadeId) {
                                    const cidadeRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${bairroRes.cidadeId}`)).data;
                                    cidadeDesc = str(cidadeRes.nome);
                                }
                            }
                            enderecosCarregados.push({
                                id: idLogradouro,
                                cep: str(logRes.cep) || cep,
                                logradouro: str(logRes.descricao),
                                bairro: bairroDesc,
                                cidade: cidadeDesc,
                                numero,
                                complemento,
                            });
                        } catch {
                            if (cep || numero || complemento) {
                                enderecosCarregados.push({cep, cidade: '', bairro: '', logradouro: '', numero, complemento});
                            }
                        }
                    } else if (cep || numero || complemento) {
                        enderecosCarregados.push({cep, cidade: '', bairro: '', logradouro: '', numero, complemento});
                    }
                    setEnderecos(enderecosCarregados);
                }

                if (pes?.id) {
                    try {
                        const unidadesIds = (await api.get<number[]>(`/api/basico/pessoa/buscar-unidades-disponiveis`, {params: {pessoaId: pes.id}})).data;
                        if (unidadesIds && unidadesIds.length > 0) {
                            const unidadesSet = new Set(unidadesIds.map(String));
                            setUnidades(allUnidades.filter(u => unidadesSet.has(String((u as Record<string, unknown>).id))));
                        }
                    } catch {
                        try {
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
                console.error('Erro ao carregar pessoa jurídica:', erro);
                alert('Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam, allUnidades]);

    const set = (campo: keyof FormState, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const voltar = () => navigate('/view/pessoa/listPessoaJuridica');

    const salvar = async (voltarDepois: boolean) => {
        if (!form.razaoSocial.trim() || !form.cnpj.trim()) {
            alert('Informe pelo menos Razão Social e CNPJ.');
            return;
        }
        setSalvando(true);
        try {
            const enderecoPrincipal = enderecos[0];
            const pjBody: Record<string, unknown> = {
                ...semId(pjOriginal),
                cnpj: form.cnpj,
                razaoSocial: form.razaoSocial,
                nomeFantasia: form.nomeFantasia || null,
                inscricaoMunicipal: form.inscricaoMunicipal || null,
                inscricaoEstadual: form.inscricaoEstadual || null,
                fax: form.fax || null,
            };
            const respostaPj = pjId
                ? await api.put(`/api/basico/pessoa-juridica/${pjId}`, pjBody)
                : await api.post('/api/basico/pessoa-juridica', pjBody);
            const novoPjId = (respostaPj.data as Record<string, unknown>)?.id ?? pjId;

            const pessoaBody: Record<string, unknown> = {
                ...semId(pessoaOriginal),
                email: form.email || null,
                telefone: form.telefone || null,
                celular: form.celular || null,
                observacao: form.observacao || null,
                cep: enderecoPrincipal?.cep || null,
                numero: enderecoPrincipal?.numero || null,
                complemento: enderecoPrincipal?.complemento || null,
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
                        <span className="form-label">CNPJ *</span>
                        <input className="form-input" placeholder="99.999.999/9999-99" value={form.cnpj}
                               onChange={(e) => set('cnpj', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Razão Social *</span>
                        <input className="form-input" placeholder="Razão Social" style={{gridColumn: 'span 3'}}
                               value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Fantasia *</span>
                        <input className="form-input" placeholder="Nome Fantasia" style={{gridColumn: 'span 3'}}
                               value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)}/>
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
                        <span className="form-label">Inscrição Municipal</span>
                        <input className="form-input" placeholder="Inscrição Municipal"
                               value={form.inscricaoMunicipal} onChange={(e) => set('inscricaoMunicipal', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Inscrição Estadual</span>
                        <input className="form-input" placeholder="Inscrição Estadual"
                               value={form.inscricaoEstadual} onChange={(e) => set('inscricaoEstadual', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail</span>
                        <input className="form-input" type="email" placeholder="E-mail"
                               style={{gridColumn: 'span 3'}} value={form.email}
                               onChange={(e) => set('email', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Foto / Logo</span>
                        <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Selecionar Imagem</button>
                            <button type="button" className="btnred">Limpar</button>
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
                        <span className="form-label">Telefone *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.telefone}
                               onChange={(e) => set('telefone', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999" value={form.celular}
                               onChange={(e) => set('celular', e.target.value)}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Fax</span>
                        <input className="form-input" placeholder="(99) 9999-9999" value={form.fax}
                               onChange={(e) => set('fax', e.target.value)}/>
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
                <h1>Cadastro de Pessoa Jurídica</h1>
                <div className="div_form">
                    <div className="form-title">{pjId ? `Pessoa Jurídica #${pjId}` : 'Pessoa Jurídica'}</div>
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
