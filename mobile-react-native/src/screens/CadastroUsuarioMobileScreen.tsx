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
    Alert,
    ActivityIndicator,
} from 'react-native';
import {Colors, Spacing, BorderRadius, Typography, Layout} from '../theme';
import {api} from '../api';
import type {TipoPessoa} from '../cadastroUserTypes';

const GENEROS = [
    {value: '1', label: 'Masculino'},
    {value: '2', label: 'Feminino'},
    {value: '3', label: 'Outro'},
];

interface SelectProps {
    label: string;
    value: string;
    options: {value: string; label: string}[];
    onChange: (v: string) => void;
    required?: boolean;
}

function formatCnpj(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface SelectProps {
    label: string;
    value: string;
    options: {value: string; label: string}[];
    onChange: (v: string) => void;
    required?: boolean;
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

        etniaOptions: [],
        estadoCivilOptions: [],
        escolaridadeOptions: [],
    });

    useEffect(() => {
        async function fetchOptions() {
            try {
                const etnia = await api.get<Array<{id: number, descricao: string}>>('/api/basico/etnia');
                setForm(prev => ({
                    ...prev,
                    etniaOptions: etnia.data.map(e => ({value: String(e.id), label: e.descricao})),
                }));
            } catch (e) {
                console.error('Erro ao carregar etnias:', e);
            }
            try {
                const estadoCivil = await api.get<Array<{id: number, descricao: string}>>('/api/basico/estado-civil');
                setForm(prev => ({
                    ...prev,
                    estadoCivilOptions: estadoCivil.data.map(e => ({value: String(e.id), label: e.descricao})),
                }));
            } catch (e) {
                console.error('Erro ao carregar estado civil:', e);
            }
            try {
                const escolaridade = await api.get<Array<{id: number, descricao: string, ordem: number}>>('/api/basico/escolaridade');
                setForm(prev => ({
                    ...prev,
                    escolaridadeOptions: escolaridade.data.map(e => ({value: String(e.id), label: e.descricao})),
                }));
            } catch (e) {
                console.error('Erro ao carregar escolaridade:', e);
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
            // TODO: integrate with API
            Alert.alert('Sucesso', 'Registro salvo com sucesso.');
        } catch {
            Alert.alert('Erro', 'Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    }, [tipoPessoa, form]);

    const renderField = (name: string, label: string, opts?: {placeholder?: string; type?: string; format?: (v: string) => string; required?: boolean}) => (
        <View key={name} style={s.fieldContainer}>
            <Text style={s.fieldLabel}>
                {label} {opts?.required && <Text style={s.required}>*</Text>}
            </Text>
            <TextInput
                style={s.input}
                value={form[name]}
                onChangeText={(t) => set(name, opts?.format ? opts.format(t) : t)}
                placeholder={opts?.placeholder ?? label}
                placeholderTextColor={Colors.textPlaceholder}
                secureTextEntry={opts?.type === 'password'}
                keyboardType={opts?.type === 'email' ? 'email-address' : opts?.type === 'number' ? 'numeric' : 'default'}
                autoCapitalize="none"
            />
        </View>
    );

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

            <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
                <View style={s.section}>
                    <Text style={s.sectionTitle}>Acesso</Text>
                </View>
                {renderField('login', 'Login', {placeholder: 'Login do usuário', required: true})}
                {renderField('senha', 'Senha', {type: 'password', placeholder: 'Senha'})}

                {tipoPessoa === 'FISICA' && (
                    <>
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Dados Pessoais</Text>
                        </View>
                        {renderField('cpf', 'CPF', {placeholder: '999.999.999-99', format: formatCpf, required: true})}
                        {renderField('rg', 'RG', {placeholder: 'Registro Geral'})}
                        {renderField('nome', 'Nome Completo', {placeholder: 'Nome completo', required: true})}
                        {renderField('nomeSocial', 'Nome Social', {placeholder: 'Nome social'})}
                        {renderField('dataNascimento', 'Data Nascimento', {type: 'date', required: true})}
                        {renderField('cidadeOrigem', 'Cidade Origem', {placeholder: 'Cidade de origem'})}
                        <SelectField label="Gênero" value={form.generoId} options={GENEROS} onChange={(v) => set('generoId', v)} />
                        <SelectField label="Etnia" value={form.etniaId} options={form.etniaOptions} onChange={(v) => set('etniaId', v)} />
                        <SelectField label="Estado Civil" value={form.estadoCivilId} options={form.estadoCivilOptions} onChange={(v) => set('estadoCivilId', v)} required />
                        <SelectField label="Escolaridade" value={form.escolaridadeId} options={form.escolaridadeOptions} onChange={(v) => set('escolaridadeId', v)} required />
                        {renderField('nomePai', 'Nome do Pai', {placeholder: 'Nome do pai'})}
                        {renderField('nomeMae', 'Nome da Mãe', {placeholder: 'Nome da mãe', required: true})}

                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Referências</Text>
                        </View>
                        {renderField('nomeReferencia', 'Nome Referência', {placeholder: 'Nome referência', required: true})}
                        {renderField('telefoneReferencia', 'Telefone Referência', {placeholder: '(99) 9999-9999', format: formatPhone})}
                        {renderField('celularReferencia', 'Celular Referência', {placeholder: '(99) 99999-9999', format: formatPhone})}
                        {renderField('nomeReferencia2', 'Nome Referência 2', {placeholder: 'Nome referência 2'})}
                        {renderField('telefoneReferencia2', 'Telefone Referência 2', {placeholder: '(99) 9999-9999', format: formatPhone})}
                        {renderField('celularReferencia2', 'Celular Referência 2', {placeholder: '(99) 99999-9999', format: formatPhone})}
                    </>
                )}

                {tipoPessoa === 'JURIDICA' && (
                    <>
                        <View style={s.section}>
                            <Text style={s.sectionTitle}>Dados da Empresa</Text>
                        </View>
                        {renderField('cnpj', 'CNPJ', {placeholder: '99.999.999/9999-99', format: formatCnpj, required: true})}
                        {renderField('razaoSocial', 'Razão Social', {placeholder: 'Razão social', required: true})}
                        {renderField('nomeFantasia', 'Nome Fantasia', {placeholder: 'Nome fantasia'})}
                        {renderField('inscricaoMunicipal', 'Inscrição Municipal', {placeholder: 'Inscrição municipal'})}
                        {renderField('inscricaoEstadual', 'Inscrição Estadual', {placeholder: 'Inscrição estadual'})}
                    </>
                )}

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Contato</Text>
                </View>
                {renderField('email', 'E-mail', {type: 'email', placeholder: 'E-mail', required: true})}
                {renderField('telefoneResidencial', 'Telefone Residencial', {placeholder: '(99) 9999-9999', format: formatPhone})}
                {renderField('telefoneComercial', 'Telefone Comercial', {placeholder: '(99) 9999-9999', format: formatPhone})}
                {renderField('celular', 'Celular', {placeholder: '(99) 99999-9999', format: formatPhone})}
                {tipoPessoa === 'JURIDICA' && renderField('fax', 'Fax', {placeholder: '(99) 9999-9999', format: formatPhone})}
                {tipoPessoa === 'FISICA' && (
                    <>
                        {renderField('facebook', 'Facebook', {placeholder: 'Facebook'})}
                        {renderField('twitter', 'Twitter', {placeholder: 'Twitter'})}
                        {renderField('googlePlus', 'Google+', {placeholder: 'Google+'})}
                        {renderField('telegram', 'Telegram', {placeholder: 'Telegram'})}
                    </>
                )}

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Endereço</Text>
                </View>
                {renderField('cep', 'CEP', {placeholder: '99999-999'})}
                {renderField('logradouro', 'Logradouro', {placeholder: 'Logradouro'})}
                {renderField('numero', 'Número', {placeholder: 'Número', type: 'number'})}
                {renderField('bairro', 'Bairro', {placeholder: 'Bairro'})}
                {renderField('cidade', 'Cidade', {placeholder: 'Cidade'})}
                {renderField('complemento', 'Complemento', {placeholder: 'Complemento'})}

                <View style={s.section}>
                    <Text style={s.sectionTitle}>Outros</Text>
                </View>
                {renderField('observacao', 'Observação', {placeholder: 'Observações'})}
            </ScrollView>

            <View style={s.footer}>
                <Pressable style={[s.btn, s.btnYellow]} disabled={salvando}>
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
    scroll: {flex: 1},
    scrollContent: {padding: Spacing.lg, paddingBottom: 100, gap: Spacing.sm},
    section: {marginTop: Spacing.lg, marginBottom: Spacing.xs},
    sectionTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    fieldContainer: {gap: Spacing.xs},
    fieldLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        color: Colors.textPrimary,
    },
    required: {color: Colors.danger},
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
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: Spacing.lg,
        gap: Spacing.md,
        backgroundColor: Colors.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: Colors.borderLight,
        ...Shadows.card,
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