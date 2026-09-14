import React, {useCallback, useEffect, useState} from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import {Alert} from '../../shared/components/SweetAlert';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';
import {Tabs} from '../Tabs';
import {api} from '../api';
import type {TipoPessoa} from '../cadastroUsuarioTypes';
import {
    GENEROS,
    ETNIAS,
    ESTADOS_CIVIS,
    ESCOLARIDADES,
    formatCpf,
    formatCnpj,
    formatPhone,
    formatCep,
} from '../cadastroUsuarioTypes';

type AbaUsuario = 'pessoal' | 'endereco' | 'contato' | 'documentos' | 'trabalho' | 'acessos';

interface SelectProps {
    label: string;
    value: string;
    options: {value: string; label: string}[];
    onChange: (v: string) => void;
    required?: boolean;
}

interface FieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    required?: boolean;
    type?: 'text' | 'email' | 'number' | 'date' | 'password';
    format?: (v: string) => string;
    multiline?: boolean;
}

interface OptionItem {
    value: string;
    label: string;
}

function SelectField({label, value, options, onChange, required}: SelectProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.value === value);
    return (
        <View style={s.fieldContainer}>
            <Text style={s.fieldLabel}>
                {label} {required && <Text style={s.required}>*</Text>}
            </Text>
            <Pressable style={s.selectContainer} onPress={() => setOpen(!open)}>
                <Text style={[s.selectText, !selected && s.placeholder]}>
                    {selected?.label ?? '-- Selecione --'}
                </Text>
                <Text style={s.selectArrow}>▾</Text>
            </Pressable>
            {open && (
                <View style={s.dropdown}>
                    <Pressable style={s.dropdownItem} onPress={() => { onChange(''); setOpen(false); }}>
                        <Text style={s.dropdownItemText}>-- Selecione --</Text>
                    </Pressable>
                    {options.map((opt) => (
                        <Pressable
                            key={opt.value}
                            style={[s.dropdownItem, opt.value === value && s.dropdownItemActive]}
                            onPress={() => { onChange(opt.value); setOpen(false); }}
                        >
                            <Text style={[s.dropdownItemText, opt.value === value && s.dropdownItemTextActive]}>
                                {opt.label}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            )}
        </View>
    );
}

function Field({label, value, onChange, placeholder, required, type, format, multiline}: FieldProps) {
    return (
        <View style={s.fieldContainer}>
            <Text style={s.fieldLabel}>
                {label} {required && <Text style={s.required}>*</Text>}
            </Text>
            <TextInput
                style={[s.input, multiline && s.inputMultiline]}
                value={value}
                onChangeText={(t) => onChange(format ? format(t) : t)}
                placeholder={placeholder ?? label}
                placeholderTextColor={Colors.textPlaceholder}
                secureTextEntry={type === 'password'}
                keyboardType={type === 'email' ? 'email-address' : type === 'number' ? 'numeric' : 'default'}
                autoCapitalize={type === 'email' || type === 'password' ? 'none' : 'sentences'}
                multiline={multiline}
                numberOfLines={multiline ? 4 : 1}
            />
        </View>
    );
}

function Section({title}: {title: string}) {
    return (
        <View style={s.section}>
            <Text style={s.sectionTitle}>{title}</Text>
        </View>
    );
}

export default function CadastroUsuarioMobileScreen() {
    const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>('FISICA');
    const [salvando, setSalvando] = useState(false);

    const [form, setForm] = useState<Record<string, string>>({
        login: '',
        senha: '',
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
        nomePai: '',
        nomeMae: '',
        nomeReferencia: '',
        telefoneReferencia: '',
        celularReferencia: '',
        nomeReferencia2: '',
        telefoneReferencia2: '',
        celularReferencia2: '',
        telefoneResidencial: '',
        telefoneComercial: '',
        celular: '',
        facebook: '',
        twitter: '',
        googlePlus: '',
        telegram: '',
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        inscricaoMunicipal: '',
        inscricaoEstadual: '',
        fax: '',
        cep: '',
        cidade: '',
        bairro: '',
        logradouro: '',
        numero: '',
        complemento: '',
        observacao: '',
    });

    const [etniaOptions, setEtniaOptions] = useState<OptionItem[]>([]);
    const [estadoCivilOptions, setEstadoCivilOptions] = useState<OptionItem[]>([]);
    const [escolaridadeOptions, setEscolaridadeOptions] = useState<OptionItem[]>([]);

    useEffect(() => {
        async function fetchOptions() {
            try {
                const etnia = await api.get<Array<{id: number, descricao: string}>>('/api/basico/etnia');
                const data = etnia.data?.length ? etnia.data.map(e => ({value: String(e.id), label: e.descricao})) : ETNIAS;
                setEtniaOptions(data);
            } catch (e) {
                console.error('Erro ao carregar etnias:', e);
                setEtniaOptions(ETNIAS);
            }
            try {
                const estadoCivil = await api.get<Array<{id: number, descricao: string}>>('/api/basico/estado-civil');
                const data = estadoCivil.data?.length ? estadoCivil.data.map(e => ({value: String(e.id), label: e.descricao})) : ESTADOS_CIVIS;
                setEstadoCivilOptions(data);
            } catch (e) {
                console.error('Erro ao carregar estado civil:', e);
                setEstadoCivilOptions(ESTADOS_CIVIS);
            }
            try {
                const escolaridade = await api.get<Array<{id: number, descricao: string, ordem: number}>>('/api/basico/escolaridade');
                const data = escolaridade.data?.length ? escolaridade.data.map(e => ({value: String(e.id), label: e.descricao})) : ESCOLARIDADES;
                setEscolaridadeOptions(data);
            } catch (e) {
                console.error('Erro ao carregar escolaridade:', e);
                setEscolaridadeOptions(ESCOLARIDADES);
            }
        }
        fetchOptions();
    }, []);

    const set = (campo: string, valor: string) => setForm((prev) => ({...prev, [campo]: valor}));

    const handleSave = useCallback(async () => {
        if (tipoPessoa === 'FISICA') {
            if (!form.nome.trim() || !form.cpf.trim()) {
                Alert.alert('Erro', 'Informe pelo menos Nome e CPF.');
                return;
            }
        } else {
            if (!form.razaoSocial.trim() || !form.cnpj.trim()) {
                Alert.alert('Erro', 'Informe pelo menos Razão Social e CNPJ.');
                return;
            }
        }
        setSalvando(true);
        try {
            const {data} = await api.post<{id: number, login: string}>(
                '/api/basico/usuario',
                {login: form.login || undefined, senha: form.senha || undefined},
            );
            Alert.alert('Sucesso', `Usuário ${data?.login ?? 'cadastrado'} salvo com sucesso.`);
            setForm((prev) => ({...prev, login: '', senha: ''}));
        } catch {
            Alert.alert('Erro', 'Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    }, [tipoPessoa, form]);

    const handleCancel = useCallback(() => {
        Alert.alert('Confirmar', 'Deseja descartar as alterações?', [
            {text: 'Não', style: 'cancel'},
            {text: 'Sim', style: 'destructive', onPress: () => {
                setForm((prev) => {
                    const novo: Record<string, string> = {};
                    Object.keys(prev).forEach((k) => { novo[k] = ''; });
                    return novo;
                });
            }},
        ]);
    }, []);

    const abaPessoal = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Dados Pessoais" />
            {tipoPessoa === 'FISICA' ? (
                <>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="CPF" value={form.cpf} onChange={(v) => set('cpf', v)}
                                placeholder="999.999.999-99" format={formatCpf} required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="RG" value={form.rg} onChange={(v) => set('rg', v)} placeholder="Registro Geral" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Nome Completo" value={form.nome} onChange={(v) => set('nome', v)}
                                placeholder="Nome completo" required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Nome Social" value={form.nomeSocial} onChange={(v) => set('nomeSocial', v)}
                                placeholder="Nome social" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Data Nascimento" value={form.dataNascimento}
                                onChange={(v) => set('dataNascimento', v)} type="date" required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Cidade Origem" value={form.cidadeOrigem} onChange={(v) => set('cidadeOrigem', v)}
                                placeholder="Cidade de origem" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <SelectField label="Gênero" value={form.generoId} options={GENEROS}
                                onChange={(v) => set('generoId', v)} />
                        </View>
                        <View style={s.fieldHalf}>
                            <SelectField label="Etnia" value={form.etniaId} options={etniaOptions}
                                onChange={(v) => set('etniaId', v)} />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <SelectField label="Estado Civil" value={form.estadoCivilId} options={estadoCivilOptions}
                                onChange={(v) => set('estadoCivilId', v)} required />
                        </View>
                        <View style={s.fieldHalf}>
                            <SelectField label="Escolaridade" value={form.escolaridadeId} options={escolaridadeOptions}
                                onChange={(v) => set('escolaridadeId', v)} required />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Nome do Pai" value={form.nomePai} onChange={(v) => set('nomePai', v)}
                                placeholder="Nome do pai" />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Nome da Mãe" value={form.nomeMae} onChange={(v) => set('nomeMae', v)}
                                placeholder="Nome da mãe" required />
                        </View>
                    </View>
                </>
            ) : (
                <>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="CNPJ" value={form.cnpj} onChange={(v) => set('cnpj', v)}
                                placeholder="99.999.999/9999-99" format={formatCnpj} required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Inscrição Estadual" value={form.inscricaoEstadual}
                                onChange={(v) => set('inscricaoEstadual', v)} placeholder="Inscrição estadual" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Razão Social" value={form.razaoSocial} onChange={(v) => set('razaoSocial', v)}
                                placeholder="Razão social" required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Nome Fantasia" value={form.nomeFantasia} onChange={(v) => set('nomeFantasia', v)}
                                placeholder="Nome fantasia" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Inscrição Municipal" value={form.inscricaoMunicipal}
                                onChange={(v) => set('inscricaoMunicipal', v)} placeholder="Inscrição municipal" />
                        </View>
                    </View>
                </>
            )}

            {tipoPessoa === 'FISICA' && (
                <>
                    <Section title="Referências" />
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Nome Referência 1" value={form.nomeReferencia}
                                onChange={(v) => set('nomeReferencia', v)} placeholder="Nome referência" required />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Telefone" value={form.telefoneReferencia}
                                onChange={(v) => set('telefoneReferencia', v)}
                                placeholder="(99) 9999-9999" format={formatPhone} />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Celular" value={form.celularReferencia}
                                onChange={(v) => set('celularReferencia', v)}
                                placeholder="(99) 99999-9999" format={formatPhone} />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Nome Referência 2" value={form.nomeReferencia2}
                                onChange={(v) => set('nomeReferencia2', v)} placeholder="Nome referência 2" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Telefone" value={form.telefoneReferencia2}
                                onChange={(v) => set('telefoneReferencia2', v)}
                                placeholder="(99) 9999-9999" format={formatPhone} />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Celular" value={form.celularReferencia2}
                                onChange={(v) => set('celularReferencia2', v)}
                                placeholder="(99) 99999-9999" format={formatPhone} />
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );

    const abaEndereco = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Endereço" />
            <View style={s.formRow}>
                <View style={s.fieldHalf}>
                    <Field label="CEP" value={form.cep} onChange={(v) => set('cep', v)}
                        placeholder="99999-999" format={formatCep} />
                </View>
                <View style={s.fieldHalf}>
                    <Field label="Número" value={form.numero} onChange={(v) => set('numero', v)}
                        placeholder="Número" type="number" />
                </View>
            </View>
            <View style={s.formRow}>
                <View style={s.fieldFull}>
                    <Field label="Logradouro" value={form.logradouro} onChange={(v) => set('logradouro', v)}
                        placeholder="Logradouro" />
                </View>
            </View>
            <View style={s.formRow}>
                <View style={s.fieldHalf}>
                    <Field label="Bairro" value={form.bairro} onChange={(v) => set('bairro', v)}
                        placeholder="Bairro" />
                </View>
                <View style={s.fieldHalf}>
                    <Field label="Cidade" value={form.cidade} onChange={(v) => set('cidade', v)}
                        placeholder="Cidade" />
                </View>
            </View>
            <View style={s.formRow}>
                <View style={s.fieldFull}>
                    <Field label="Complemento" value={form.complemento} onChange={(v) => set('complemento', v)}
                        placeholder="Complemento" multiline />
                </View>
            </View>
        </ScrollView>
    );

    const abaContato = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Contato" />
            <View style={s.formRow}>
                <View style={s.fieldHalf}>
                    <Field label="E-mail" value={form.email} onChange={(v) => set('email', v)}
                        placeholder="E-mail" type="email" required />
                </View>
                <View style={s.fieldHalf}>
                    <Field label="Telefone Residencial" value={form.telefoneResidencial}
                        onChange={(v) => set('telefoneResidencial', v)}
                        placeholder="(99) 9999-9999" format={formatPhone} />
                </View>
            </View>
            {tipoPessoa === 'FISICA' ? (
                <View style={s.formRow}>
                    <View style={s.fieldHalf}>
                        <Field label="Telefone Comercial" value={form.telefoneComercial}
                            onChange={(v) => set('telefoneComercial', v)}
                            placeholder="(99) 9999-9999" format={formatPhone} />
                    </View>
                    <View style={s.fieldHalf}>
                        <Field label="Celular" value={form.celular} onChange={(v) => set('celular', v)}
                            placeholder="(99) 99999-9999" format={formatPhone} />
                    </View>
                </View>
            ) : (
                <View style={s.formRow}>
                    <View style={s.fieldHalf}>
                        <Field label="Celular" value={form.celular} onChange={(v) => set('celular', v)}
                            placeholder="(99) 99999-9999" format={formatPhone} />
                    </View>
                    <View style={s.fieldHalf}>
                        <Field label="Fax" value={form.fax} onChange={(v) => set('fax', v)}
                            placeholder="(99) 9999-9999" format={formatPhone} />
                    </View>
                </View>
            )}

            {tipoPessoa === 'FISICA' && (
                <>
                    <Section title="Redes Sociais" />
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Facebook" value={form.facebook} onChange={(v) => set('facebook', v)}
                                placeholder="Facebook" />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Twitter" value={form.twitter} onChange={(v) => set('twitter', v)}
                                placeholder="Twitter" />
                        </View>
                    </View>
                    <View style={s.formRow}>
                        <View style={s.fieldHalf}>
                            <Field label="Google+" value={form.googlePlus} onChange={(v) => set('googlePlus', v)}
                                placeholder="Google+" />
                        </View>
                        <View style={s.fieldHalf}>
                            <Field label="Telegram" value={form.telegram} onChange={(v) => set('telegram', v)}
                                placeholder="Telegram" />
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );

    const abaDocumentos = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Documentos" />
            <View style={s.infoBox}>
                <Text style={s.infoText}>
                    Documentos do funcionário (CTPS, RG, CPF, Comprovante de Residência, etc.)
                    são gerenciados na seção específica de documentos. A integração completa
                    com upload de arquivos será adicionada em versões futuras.
                </Text>
            </View>
        </ScrollView>
    );

    const abaTrabalho = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Trabalho" />
            <View style={s.infoBox}>
                <Text style={s.infoText}>
                    Dados funcionais (cargo, turno, data de admissão, tipo de contrato) são
                    gerenciados na seção específica de Recursos Humanos.
                </Text>
            </View>
            <Field label="Observação" value={form.observacao} onChange={(v) => set('observacao', v)}
                placeholder="Observações" multiline />
        </ScrollView>
    );

    const abaAcessos = (
        <ScrollView
            style={s.abaScroll}
            contentContainerStyle={s.abaContent}
            keyboardShouldPersistTaps="handled"
        >
            <Section title="Acesso ao Sistema" />
            <View style={s.formRow}>
                <View style={s.fieldHalf}>
                    <Field label="Login" value={form.login} onChange={(v) => set('login', v)}
                        placeholder="Login do usuário" required />
                </View>
                <View style={s.fieldHalf}>
                    <Field label="Senha" value={form.senha} onChange={(v) => set('senha', v)}
                        placeholder="Senha" type="password" />
                </View>
            </View>
            <Section title="Unidades" />
            <View style={s.infoBox}>
                <Text style={s.infoText}>
                    A seleção de unidades vinculadas ao usuário é feita pelo componente de
                    Master Detail, disponível na versão web.
                </Text>
            </View>
        </ScrollView>
    );

    const abas: {key: AbaUsuario; label: string; content: React.ReactNode}[] = [
        {key: 'pessoal', label: 'Pessoal', content: abaPessoal},
        {key: 'endereco', label: 'Endereço', content: abaEndereco},
        {key: 'contato', label: 'Contato', content: abaContato},
        {key: 'documentos', label: 'Documentos', content: abaDocumentos},
        {key: 'trabalho', label: 'Trabalho', content: abaTrabalho},
        {key: 'acessos', label: 'Acessos', content: abaAcessos},
    ];

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.header}>
                <Text style={s.headerTitle}>Cadastro de Usuário</Text>
            </View>

            <View style={s.toggleContainer}>
                <Pressable
                    style={[s.toggleBtn, tipoPessoa === 'FISICA' && s.toggleBtnActive]}
                    onPress={() => setTipoPessoa('FISICA')}
                >
                    <Text style={[s.toggleBtnText, tipoPessoa === 'FISICA' && s.toggleBtnTextActive]}>
                        Pessoa Física
                    </Text>
                </Pressable>
                <Pressable
                    style={[s.toggleBtn, tipoPessoa === 'JURIDICA' && s.toggleBtnActive]}
                    onPress={() => setTipoPessoa('JURIDICA')}
                >
                    <Text style={[s.toggleBtnText, tipoPessoa === 'JURIDICA' && s.toggleBtnTextActive]}>
                        Pessoa Jurídica
                    </Text>
                </Pressable>
            </View>

            <Tabs tabs={abas} initial="pessoal" />

            <View style={s.footer}>
                <Pressable style={[s.btn, s.btnYellow]} onPress={handleCancel} disabled={salvando}>
                    <Text style={s.btnText}>Voltar</Text>
                </Pressable>
                <Pressable style={[s.btn, s.btnBlue]} onPress={handleSave} disabled={salvando}>
                    {salvando ? (
                        <ActivityIndicator color={Colors.textWhite} size="small" />
                    ) : (
                        <Text style={s.btnText}>Salvar</Text>
                    )}
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.bgPrimary},
    header: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
        backgroundColor: Colors.bgSecondary,
    },
    headerTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    toggleContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.sm,
        backgroundColor: Colors.bgSecondary,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borderLight,
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: Colors.borderMedium,
        alignItems: 'center',
        backgroundColor: Colors.bgPrimary,
    },
    toggleBtnActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary,
    },
    toggleBtnText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.medium,
        color: Colors.textSecondary,
    },
    toggleBtnTextActive: {
        color: Colors.textWhite,
        fontWeight: Typography.weights.bold,
    },
    abaScroll: {flex: 1},
    abaContent: {padding: Spacing.lg, gap: Spacing.sm, paddingBottom: 100},
    section: {marginTop: Spacing.md, marginBottom: Spacing.xs},
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldContainer: {gap: Spacing.xs},
    formRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md},
    fieldHalf: {width: '47%'},
    fieldFull: {width: '100%'},
    fieldLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    required: {color: Colors.error},
    input: {
        height: 44,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.sizes.md,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgPrimary,
    },
    inputMultiline: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: Spacing.sm,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.bgPrimary,
    },
    selectText: {flex: 1, fontSize: Typography.sizes.md, color: Colors.textPrimary},
    placeholder: {color: Colors.textPlaceholder},
    selectArrow: {fontSize: 12, color: Colors.textLight},
    dropdown: {
        backgroundColor: Colors.bgPrimary,
        borderWidth: 1,
        borderColor: Colors.borderMedium,
        borderRadius: BorderRadius.md,
        marginTop: -4,
        ...Shadows.medium,
    },
    dropdownItem: {padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.borderLight},
    dropdownItemActive: {backgroundColor: Colors.primary + '15'},
    dropdownItemText: {fontSize: Typography.sizes.md, color: Colors.textPrimary},
    dropdownItemTextActive: {color: Colors.primary, fontWeight: Typography.weights.bold},
    infoBox: {
        backgroundColor: Colors.goldBg,
        borderLeftWidth: 4,
        borderLeftColor: Colors.gold,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
    },
    infoText: {
        color: Colors.goldText,
        fontSize: Typography.sizes.md,
        lineHeight: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: Spacing.lg,
        gap: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
    },
    btn: {
        borderRadius: BorderRadius.lg,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnBlue: {backgroundColor: Colors.primary},
    btnYellow: {backgroundColor: Colors.warning},
    btnText: {color: Colors.textWhite, fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold},
});
