import React, {useEffect, useState, useCallback} from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
    Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {api} from '../../shared/services/api';
import {AutoComplete, AutoCompleteOption} from '../../shared/components/AutoComplete';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../../theme';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const formatCep = (v: string): string => { const d = v.replace(/\D/g, '').slice(0, 8); if (d.length <= 5) return d; return `${d.slice(0, 5)}-${d.slice(5)}`; };

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
    cnpj: '', razaoSocial: '', nomeFantasia: '', inscricaoMunicipal: '', inscricaoEstadual: '',
    email: '', fax: '', telefone: '', celular: '', observacao: '',
};

export default function ViewFornecedorFormFornecedorListScreen() {
    const route: any = useRoute();
    const navigation: any = useNavigation();
    const idParam = route.params?.id;

    const [form, setForm] = useState<FormState>(FORM_VAZIO);
    const [pjId, setPjId] = useState<number | undefined>();
    const [pessoaId, setPessoaId] = useState<number | undefined>();
    const [pjOriginal, setPjOriginal] = useState<Record<string, unknown> | null>(null);
    const [pessoaOriginal, setPessoaOriginal] = useState<Record<string, unknown> | null>(null);
    const [fornecedorId, setFornecedorId] = useState<number | undefined>();
    const [fornecedorOriginal, setFornecedorOriginal] = useState<Record<string, unknown> | null>(null);

    // Endereco
    const [cep, setCep] = useState('');
    const [cidade, setCidade] = useState('');
    const [bairro, setBairro] = useState('');
    const [logradouro, setLogradouro] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [buscandoCep, setBuscandoCep] = useState(false);

    // Autocomplete para Pessoa Jurídica
    const [pjSelecionada, setPjSelecionada] = useState<AutoCompleteOption | null>(null);
    const [criarNovaPj, setCriarNovaPj] = useState(false);
    const [salvando, setSalvando] = useState(false);

    // Fetch Pessoa Jurídica para autocomplete
    const fetchPessoaJuridica = useCallback(async (query: string): Promise<AutoCompleteOption[]> => {
        if (!query.trim()) return [];
        try {
            const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-juridica/auto-complete', {
                params: {q: query, limit: 20}
            });
            return data.map(row => ({
                id: Number(row.id),
                label: `${str(row.razaoSocial)} (${str(row.cnpj)})`
            }));
        } catch {
            return [];
        }
    }, []);

    // Carregar dados se estiver editando
    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                const fornecedor = (await api.get<Record<string, unknown>>(`/api/basico/fornecedor/${idParam}`)).data;
                if (!ativo) return;
                setFornecedorId(fornecedor.id as number);
                setFornecedorOriginal(fornecedor);

                if (fornecedor.id_pessoa) {
                    const pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${fornecedor.id_pessoa}`)).data;
                    setPessoaId(pes.id as number);
                    setPessoaOriginal(pes);

                    if (pes.id_pessoa_juridica) {
                        const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${pes.id_pessoa_juridica}`)).data;
                        setPjId(pj.id as number);
                        setPjOriginal(pj);
                        setPjSelecionada({id: pj.id as number, label: `${str(pj.razaoSocial)} (${str(pj.cnpj)})`});

                        setForm({
                            cnpj: str(pj.cnpj), razaoSocial: str(pj.razaoSocial), nomeFantasia: str(pj.nomeFantasia),
                            inscricaoMunicipal: str(pj.inscricaoMunicipal), inscricaoEstadual: str(pj.inscricaoEstadual),
                            email: str(pes?.email), fax: str(pj.fax),
                            telefone: str(pes?.telefone), celular: str(pes?.celular),
                            observacao: str(pes?.observacao),
                        });

                        // Endereco
                        const cepVal = str(pes.cep);
                        const numVal = str(pes.numero);
                        const compVal = str(pes.complemento);
                        const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number|undefined;
                        setNumero(numVal); setComplemento(compVal);
                        if (idLog) {
                            try {
                                const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                                setLogradouro(str(logRes.descricao));
                                setCep(str(logRes.cep) ? formatCep(str(logRes.cep)) : formatCep(cepVal));
                                if (logRes.id_bairro) {
                                    const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                    setBairro(str(bRes.descricao));
                                    if ((bRes as any).cidadeId) {
                                        const cRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                        setCidade(str((cRes as any).cidadeEstado ?? cRes.nome));
                                    }
                                }
                            } catch {
                                setCep(formatCep(cepVal));
                            }
                        } else if (cepVal) setCep(formatCep(cepVal));
                    }
                }
            } catch (erro) {
                console.error('Erro ao carregar fornecedor:', erro);
                Alert.alert('Erro', 'Erro ao carregar registro.');
            }
        })();
        return () => { ativo = false; };
    }, [idParam]);

    // Quando seleciona uma PJ existente
    useEffect(() => {
        if (pjSelecionada && !criarNovaPj) {
            (async () => {
                try {
                    const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${pjSelecionada.id}`)).data;
                    let pes: Record<string, unknown> | null = null;
                    if (pj.pessoaId) {
                        pes = (await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;
                    }
                    setPjId(pj.id as number);
                    setPjOriginal(pj);
                    setPessoaId(pes?.id as number | undefined);
                    setPessoaOriginal(pes);
                    setForm({
                        cnpj: str(pj.cnpj), razaoSocial: str(pj.razaoSocial), nomeFantasia: str(pj.nomeFantasia),
                        inscricaoMunicipal: str(pj.inscricaoMunicipal), inscricaoEstadual: str(pj.inscricaoEstadual),
                        email: str(pes?.email), fax: str(pj.fax),
                        telefone: str(pes?.telefone), celular: str(pes?.celular),
                        observacao: str(pes?.observacao),
                    });
                    // Endereco
                    if (pes) {
                        const cepVal = str(pes.cep);
                        const numVal = str(pes.numero);
                        const compVal = str(pes.complemento);
                        const idLog = (pes.id_logradouro ?? (pes as any).logradouroId) as number|undefined;
                        setNumero(numVal); setComplemento(compVal);
                        if (idLog) {
                            try {
                                const logRes = (await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                                setLogradouro(str(logRes.descricao));
                                setCep(str(logRes.cep) ? formatCep(str(logRes.cep)) : formatCep(cepVal));
                                if (logRes.id_bairro) {
                                    const bRes = (await api.get<Record<string, unknown>>(`/api/basico/bairro/${logRes.id_bairro}`)).data;
                                    setBairro(str(bRes.descricao));
                                    if ((bRes as any).cidadeId) {
                                        const cRes = (await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                        setCidade(str((cRes as any).cidadeEstado ?? cRes.nome));
                                    }
                                }
                            } catch {
                                setCep(formatCep(cepVal));
                            }
                        } else if (cepVal) setCep(formatCep(cepVal));
                    }
                } catch (erro) {
                    console.error('Erro ao carregar pessoa jurídica:', erro);
                }
            })();
        } else if (!pjSelecionada && !criarNovaPj) {
            setPjId(undefined);
            setPjOriginal(null);
            setPessoaId(undefined);
            setPessoaOriginal(null);
            setForm(FORM_VAZIO);
            setCep(''); setCidade(''); setBairro(''); setLogradouro(''); setNumero(''); setComplemento('');
        }
    }, [pjSelecionada, criarNovaPj]);

    const handleChange = (campo: keyof FormState, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const buscarCep = async () => {
        const clean = cep.replace(/\D/g, '');
        if (clean.length !== 8) { Alert.alert('Aviso', 'Informe o CEP completo'); return; }
        setBuscandoCep(true);
        try {
            try {
                const {data} = await api.get<any>(`/api/basico/logradouro/buscar-endereco-por-cep`, {params: {cep: clean}});
                if (data?.logradouro) {
                    const l = data.logradouro;
                    setCep(formatCep(String(l?.cep ?? clean)));
                    if (data?.cidade) setCidade(String((data.cidade as any).nome ?? ''));
                    if (data?.bairro) setBairro(String((data.bairro as any).descricao ?? ''));
                    setLogradouro(String(l?.descricao ?? ''));
                    setBuscandoCep(false);
                    return;
                }
            } catch {}
            const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
            const d = await r.json();
            if (d?.erro) { Alert.alert('Aviso', 'CEP não encontrado'); setBuscandoCep(false); return; }
            setCep(formatCep(String(d?.cep ?? clean)));
            if (d?.localidade) setCidade(d.localidade);
            if (d?.bairro) setBairro(d.bairro);
            if (d?.logradouro) setLogradouro(d.logradouro);
        } catch { Alert.alert('Erro', 'Falha ao consultar o CEP'); }
        finally { setBuscandoCep(false); }
    };

    const salvar = async () => {
        if (!form.razaoSocial.trim() || !form.cnpj.trim()) {
            Alert.alert('Aviso', 'Informe pelo menos Razão Social e CNPJ.');
            return;
        }
        setSalvando(true);
        try {
            let finalPessoaId = pessoaId;
            let finalPjId = pjId;

            if (criarNovaPj) {
                const pjBody: Record<string, unknown> = {
                    ...pjOriginal, cnpj: form.cnpj, razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia || null,
                    inscricaoMunicipal: form.inscricaoMunicipal || null, inscricaoEstadual: form.inscricaoEstadual || null,
                    fax: form.fax || null,
                };
                delete pjBody.id;

                const respostaPj = pjId
                    ? await api.put(`/api/basico/pessoa-juridica/${pjId}`, pjBody)
                    : await api.post('/api/basico/pessoa-juridica', pjBody);
                finalPjId = (respostaPj.data as Record<string, unknown>)?.id ?? pjId;

                const pessoaBody: Record<string, unknown> = {
                    ...pessoaOriginal, email: form.email || null, telefone: form.telefone || null,
                    celular: form.celular || null, observacao: form.observacao || null,
                    cep: cep || null, numero: numero || null, complemento: complemento || null,
                };
                delete pessoaBody.id;

                if (pessoaId) {
                    await api.put(`/api/basico/pessoa/${pessoaId}`, pessoaBody);
                    finalPessoaId = pessoaId;
                } else {
                    finalPessoaId = ((await api.post('/api/basico/pessoa', pessoaBody)).data as Record<string, unknown>)?.id as number | undefined;
                }

                if (!pjId && finalPessoaId && finalPjId) {
                    await api.put(`/api/basico/pessoa-juridica/${finalPjId}`, {...pjBody, pessoaId: finalPessoaId});
                }
            }

            if (finalPessoaId) {
                const fornecedorBody: Record<string, unknown> = {
                    ...fornecedorOriginal, id_pessoa: finalPessoaId, ativo: true,
                };
                delete fornecedorBody.id;

                if (fornecedorId) {
                    await api.put(`/api/basico/fornecedor/${fornecedorId}`, fornecedorBody);
                } else {
                    const respostaFornecedor = await api.post('/api/basico/fornecedor', fornecedorBody);
                    setFornecedorId((respostaFornecedor.data as Record<string, unknown>)?.id as number | undefined);
                }
            }

            Alert.alert('Sucesso', 'Registro salvo com sucesso.');
            navigation.goBack();
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            Alert.alert('Erro', 'Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    const renderField = (label: string, name: keyof FormState, options: {
        type?: 'text' | 'email' | 'textarea' | 'mask';
        mask?: string;
        required?: boolean;
        full?: boolean;
        editable?: boolean;
        placeholder?: string;
    } = {}) => {
        const {type = 'text', mask, required = false, full = false, editable = true, placeholder = ''} = options;
        const disabled = (!editable || (!!pjSelecionada && !criarNovaPj));
        const currentValue = form[name] ?? '';

        return (
            <View key={name} style={[styles.fieldContainer, full && styles.fieldFull]}>
                <Text style={styles.fieldLabel}>
                    {label} {required && <Text style={styles.requiredStar}>*</Text>}
                </Text>
                <View style={styles.fieldControl}>
                    {type === 'textarea' ? (
                        <TextInput
                            style={[styles.fieldInput, styles.textarea, disabled && styles.fieldDisabled]}
                            value={currentValue}
                            onChangeText={(text) => handleChange(name, text)}
                            editable={!disabled}
                            placeholder={placeholder}
                            multiline
                            numberOfLines={4}
                        />
                    ) : (
                        <TextInput
                            style={[styles.fieldInput, disabled && styles.fieldDisabled]}
                            value={currentValue}
                            onChangeText={(text) => handleChange(name, text)}
                            editable={!disabled}
                            placeholder={placeholder}
                            keyboardType={type === 'email' ? 'email-address' : 'default'}
                        />
                    )}
                </View>
            </View>
        );
    };

    const renderCepField = () => (
        <View key="cep" style={[styles.fieldContainer, styles.fieldFull]}>
            <Text style={styles.fieldLabel}>CEP</Text>
            <View style={styles.fieldControl}>
                <View style={styles.actionRow}>
                    <View style={styles.actionRowInput}>
                        <TextInput
                            style={[styles.fieldInput, styles.cepInput, disabled && styles.fieldDisabled]}
                            value={cep}
                            onChangeText={(text) => setCep(formatCep(text))}
                            editable={!(!criarNovaPj && !!pjSelecionada)}
                            placeholder="99.999-999"
                            maxLength={9}
                        />
                    </View>
                    <Pressable
                        style={[styles.actionButton, buscandoCep && styles.actionButtonDisabled]}
                        disabled={buscandoCep || (!criarNovaPj && !!pjSelecionada)}
                        onPress={buscarCep}
                    >
                        <Text style={styles.actionButtonText}>{buscandoCep ? 'Buscando...' : 'Busca'}</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, styles.actionButtonSecondary, (!criarNovaPj && !!pjSelecionada) && styles.actionButtonDisabled]}
                        disabled={!criarNovaPj && !!pjSelecionada}
                        onPress={() => { setCep(''); setCidade(''); setBairro(''); setLogradouro(''); setNumero(''); setComplemento(''); Alert.alert('Ajuste', 'Preencha cidade/bairro/logradouro nos campos abaixo'); }}
                    >
                        <Text style={styles.actionButtonText}>Ajuste</Text>
                    </Pressable>
                    <Pressable
                        style={[styles.actionButton, styles.actionButtonDanger, (!criarNovaPj && !!pjSelecionada) && styles.actionButtonDisabled]}
                        disabled={!criarNovaPj && !!pjSelecionada}
                        onPress={() => { setCep(''); setCidade(''); setBairro(''); setLogradouro(''); setNumero(''); setComplemento(''); }}
                    >
                        <Text style={styles.actionButtonText}>Novo</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    const renderBooleanField = (label: string, value: boolean, onChange: (v: boolean) => void, disabled?: boolean) => (
        <View key={label} style={[styles.fieldContainer]}>
            <Text style={styles.fieldLabel}>{label}</Text>
            <View style={styles.fieldControl}>
                <View style={styles.booleanContainer}>
                    <Switch
                        value={value}
                        onValueChange={onChange}
                        disabled={disabled}
                        trackColor={{false: Colors.borderMedium, true: Colors.primary}}
                    />
                </View>
            </View>
        </View>
    );

    const isPjReadOnly = !!pjSelecionada && !criarNovaPj;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            

            <ScrollView style={styles.contentContainer} contentContainerStyle={styles.contentPadding}>
                {/* Aba Vínculo - Sempre visível */}
                <View style={styles.tabContent}>
                    <Text style={styles.sectionTitle}>Vínculo Pessoa Jurídica</Text>
                    <View style={[styles.fieldContainer, styles.fieldFull]}>
                        <Text style={styles.fieldLabel}>Pessoa Jurídica *</Text>
                        <AutoComplete
                            placeholder="Digite para buscar pessoa jurídica..."
                            value={pjSelecionada}
                            onChange={setPjSelecionada}
                            fetchOptions={fetchPessoaJuridica}
                            minChars={3}
                            disabled={criarNovaPj}
                        />
                    </View>
                    <View style={[styles.fieldContainer, styles.fieldFull]}>
                        <View style={styles.booleanContainer}>
                            <Switch
                                value={criarNovaPj}
                                onValueChange={setCriarNovaPj}
                                trackColor={{false: Colors.borderMedium, true: Colors.primary}}
                            />
                            <Text style={{marginLeft: 8, fontSize: 14, color: Colors.textPrimary}}>Criar nova Pessoa Jurídica</Text>
                        </View>
                    </View>
                </View>

                {criarNovaPj && (
                    <>
                        {/* Aba Identificação */}
                        <View style={styles.tabContent}>
                            <Text style={styles.sectionTitle}>Identificação</Text>
                            {renderField("CNPJ *", "cnpj", {required: true, full: true, editable: !isPjReadOnly, placeholder: "99.999.999/9999-99"})}
                            {renderField("Inscrição Municipal", "inscricaoMunicipal", {full: true, editable: !isPjReadOnly, placeholder: "Inscrição Municipal"})}
                            {renderField("Razão Social *", "razaoSocial", {required: true, full: true, editable: !isPjReadOnly, placeholder: "Razão Social"})}
                            {renderField("Nome Fantasia *", "nomeFantasia", {required: true, full: true, editable: !isPjReadOnly, placeholder: "Nome Fantasia"})}
                        </View>

                        {/* Aba Informações Básicas */}
                        <View style={styles.tabContent}>
                            <Text style={styles.sectionTitle}>Informações Básicas</Text>
                            {renderField("Inscrição Estadual", "inscricaoEstadual", {full: true, editable: !isPjReadOnly, placeholder: "Inscrição Estadual"})}
                            {renderField("E-mail", "email", {type: "email", full: true, editable: !isPjReadOnly, placeholder: "E-mail"})}
                        </View>

                        {/* Aba Contatos */}
                        <View style={styles.tabContent}>
                            <Text style={styles.sectionTitle}>Contatos</Text>
                            {renderField("Telefone *", "telefone", {required: true, full: true, editable: !isPjReadOnly, placeholder: "(99) 99999-9999"})}
                            {renderField("Celular *", "celular", {required: true, full: true, editable: !isPjReadOnly, placeholder: "(99) 99999-9999"})}
                            {renderField("Fax", "fax", {full: true, editable: !isPjReadOnly, placeholder: "(99) 9999-9999"})}
                        </View>

                        {/* Aba Endereço */}
                        <View style={styles.tabContent}>
                            <Text style={styles.sectionTitle}>Endereço</Text>
                            {renderCepField()}
                            {renderField("Cidade", "cidade", {full: true, editable: !isPjReadOnly, placeholder: "Cidade"})}
                            {renderField("Bairro", "bairro", {full: true, editable: !isPjReadOnly, placeholder: "Bairro"})}
                            {renderField("Logradouro", "logradouro", {full: true, editable: !isPjReadOnly, placeholder: "Logradouro"})}
                            {renderField("Número *", "numero", {required: true, full: true, editable: !isPjReadOnly, placeholder: "Número"})}
                            {renderField("Complemento", "complemento", {type: "textarea", full: true, editable: !isPjReadOnly, placeholder: "Complemento"})}
                        </View>

                        {/* Aba Outros */}
                        <View style={styles.tabContent}>
                            <Text style={styles.sectionTitle}>Outros</Text>
                            {renderBooleanField("Currículo / Banco de Talentos", false, () => {}, isPjReadOnly)}
                            {renderField("Observação", "observacao", {type: "textarea", full: true, editable: !isPjReadOnly, placeholder: "Observações"})}
                        </View>
                    </>
                )}
            </ScrollView>

            {criarNovaPj && (
                <View style={styles.footer}>
                    <Pressable style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()} disabled={salvando}>
                        <Text style={[styles.buttonText, styles.cancelButtonText]}>Voltar</Text>
                    </Pressable>
                    <Pressable style={[styles.button, styles.saveButton]} onPress={salvar} disabled={salvando}>
                        <Text style={[styles.buttonText, styles.saveButtonText]}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                    </Pressable>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.bgPrimary},
    header: {padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, backgroundColor: Colors.bgSecondary},
    headerTitle: {fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.textPrimary},
    contentContainer: {flex: 1},
    contentPadding: {padding: Spacing.lg, paddingBottom: 100},
    sectionTitle: {fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, color: Colors.textPrimary, marginBottom: Spacing.md, marginTop: Spacing.md},
    tabContent: {gap: Spacing.md},
    fieldContainer: {width: '48%', gap: Spacing.xs},
    fieldFull: {width: '100%'},
    fieldLabel: {fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.textPrimary, marginBottom: 2},
    requiredStar: {color: Colors.danger, marginLeft: 2},
    fieldControl: {flex: 1, gap: Spacing.xs},
    fieldInput: {height: 44, borderWidth: 1, borderColor: Colors.borderMedium, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, fontSize: Typography.sizes.md, color: Colors.textPrimary, backgroundColor: Colors.bgPrimary},
    fieldDisabled: {backgroundColor: Colors.bgSecondary, opacity: 0.7},
    fieldInputError: {borderColor: Colors.danger},
    textarea: {minHeight: 80, paddingVertical: Spacing.md},
    booleanContainer: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', minHeight: 44},
    actionRow: {flexDirection: 'row', gap: Spacing.sm, alignItems: 'center'},
    actionRowInput: {flex: 1},
    cepInput: {width: '120px', flexShrink: 0},
    actionButton: {height: 44, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary},
    actionButtonSecondary: {backgroundColor: Colors.warning},
    actionButtonDanger: {backgroundColor: Colors.danger},
    actionButtonDisabled: {opacity: 0.5},
    actionButtonText: {color: Colors.textWhite, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold},
    footer: {position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'flex-end', padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.bgSecondary, borderTopWidth: 1, borderTopColor: Colors.borderLight, ...Shadows.card},
    button: {borderRadius: BorderRadius.lg, paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minWidth: 120, alignItems: 'center', justifyContent: 'center'},
    cancelButton: {backgroundColor: Colors.warning},
    cancelButtonText: {color: Colors.textWhite, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold},
    saveButton: {backgroundColor: Colors.primary},
    saveButtonText: {color: Colors.textWhite, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold},
});