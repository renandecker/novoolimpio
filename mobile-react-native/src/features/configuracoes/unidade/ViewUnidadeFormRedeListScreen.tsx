import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {Alert} from '../../../shared/components/SweetAlert';
import {useRoute} from '@react-navigation/native';
import {api} from '../api';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);
const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

function FormField({label, value, onChange, type = 'text', placeholder, mask, options, editable = true, required = false, style}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: 'text' | 'number' | 'email' | 'select';
    placeholder?: string;
    mask?: string;
    options?: Array<{value: string; label: string}>;
    editable?: boolean;
    required?: boolean;
    style?: any;
}) {
    return (
        <View style={[styles.field, style]}>
            <Text style={styles.fieldLabel}>{label} {required && <Text style={styles.required}>*</Text>}</Text>
            <TextInput
                style={[styles.fieldInput, type === 'select' ? styles.selectInput : {}]}
                value={value}
                onChangeText={onChange}
                editable={editable}
                placeholder={placeholder ?? mask}
                keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
            />
        </View>
    );
}

export default function ViewUnidadeFormRedeListScreen() {
    const route = useRoute();
    const idParam = route.params?.id;

    const [redeId, setRedeId] = useState<number | undefined>();
    const [redeOriginal, setRedeOriginal] = useState<Record<string, unknown> | null>(null);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [values, setValues] = useState<Record<string, string>>({});

    const tabsData = [
        {
            key: 'geral',
            label: 'Geral',
            fields: [
                {name: 'id', label: 'ID', type: 'text', required: false, editable: false, span: 1},
                {name: 'razaoSocial', label: 'Razão Social', required: true, span: 3},
                {name: 'nomeFantasia', label: 'Nome Fantasia', required: true, span: 3},
                {name: 'cnpj', label: 'CNPJ', type: 'text', mask: '99.999.999/9999-99', required: true, span: 2},
                {name: 'usuario', label: 'Usuário', type: 'text', span: 2},
                {name: 'layout', label: 'Layout', type: 'text', span: 2},
            ],
        },
        {
            key: 'unidade',
            label: 'Unidade',
            isMasterDetail: true,
            masterDetailConfig: {
                label: 'Unidade',
                source: UNIDADE_SOURCE,
                valueKey: 'id',
                searchKeys: UNIDADE_SEARCH,
                columns: UNIDADE_COLUMNS,
            },
        },
    ];

    const tabItems: TabItem[] = tabsData.map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: (
            <ScrollView style={styles.tabContent}>
                {tab.key === 'geral' ? (
                    <>
                        <View style={styles.formRow}>
                            <FormField
                                label="ID"
                                value={values.id ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, id: text}))}
                                type="text"
                                editable={false}
                                style={styles.fieldHalf}
                            />
                            <FormField
                                label="Razão Social"
                                value={values.razaoSocial ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, razaoSocial: text}))}
                                required
                                style={styles.fieldHalf}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <FormField
                                label="Nome Fantasia"
                                value={values.nomeFantasia ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, nomeFantasia: text}))}
                                required
                                style={styles.fieldHalf}
                            />
                            <FormField
                                label="CNPJ"
                                value={values.cnpj ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, cnpj: text}))}
                                type="text"
                                mask="99.999.999/9999-99"
                                required
                                style={styles.fieldHalf}
                            />
                        </View>
                        <View style={styles.formRow}>
                            <FormField
                                label="Usuário"
                                value={values.usuario ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, usuario: text}))}
                                type="text"
                                style={styles.fieldHalf}
                            />
                            <FormField
                                label="Layout"
                                value={values.layout ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, layout: text}))}
                                type="text"
                                style={styles.fieldHalf}
                            />
                        </View>
                    </>
                ) : (
                    <>
                        {tab.fields && tab.fields.map((field) => (
                            <FormField
                                key={field.name}
                                label={field.label}
                                value={values[field.name] ?? ''}
                                onChange={(text) => setValues((prev) => ({...prev, [field.name]: text}))}
                                type={field.type}
                                placeholder={field.placeholder}
                                mask={field.mask}
                                options={field.options}
                                editable={field.editable !== false}
                                required={field.required}
                                style={styles.fieldFull}
                            />
                        ))}
                    </>
                )}
                {tab.isMasterDetail && tab.masterDetailConfig && (
                    <MasterDetail
                        label={tab.masterDetailConfig.label}
                        source={tab.masterDetailConfig.source}
                        valueKey={tab.masterDetailConfig.valueKey}
                        searchKeys={tab.masterDetailConfig.searchKeys}
                        columns={tab.masterDetailConfig.columns}
                        items={unidades}
                        onChange={setUnidades}
                    />
                )}
            </ScrollView>
        ),
    }));

    useEffect(() => {
        if (!idParam) return;
        let ativo = true;
        (async () => {
            try {
                let rede: Record<string, unknown> | null = null;
                try {
                    rede = (await api.get<Record<string, unknown>>(`/api/basico/rede/${idParam}`)).data;
                } catch {
                    try {
                        rede = (await api.get<Record<string, unknown>>(`/api/view/unidade/formRede/${idParam}`)).data;
                    } catch {
                        rede = null;
                    }
                }
                if (!ativo || !rede) return;
                setRedeId(rede.id as number);
                setRedeOriginal(rede as Record<string, unknown>);
                setValues({
                    id: str(rede.id),
                    razaoSocial: str((rede as any).razaoSocial ?? (rede as any).razao_social ?? ''),
                    nomeFantasia: str((rede as any).nomeFantasia ?? (rede as any).nome_fantasia ?? ''),
                    cnpj: str((rede as any).cnpj ?? ''),
                    usuario: str((rede as any).usuario?.id ?? (rede as any).usuarioId ?? (rede as any).id_usuario ?? (rede as any).usuario ?? ''),
                    layout: str((rede as any).layout?.id ?? (rede as any).layoutId ?? (rede as any).id_layout ?? (rede as any).layout ?? ''),
                });
                const unidadesRaw = (rede as any).unidades ?? (rede as any).listaDetalheUnidade ?? (rede as any).listaUnidades ?? [];
                if (Array.isArray(unidadesRaw) && unidadesRaw.length > 0) {
                    setUnidades(unidadesRaw as ApiItem[]);
                }
            } catch (erro) {
                console.error('Erro ao carregar rede:', erro);
                Alert.alert('Erro', 'Erro ao carregar registro.');
            }
        })();
        return () => { ativo = false; };
    }, [idParam]);

    const salvar = async () => {
        if (!values.razaoSocial || !values.nomeFantasia || !values.cnpj) {
            setError('Informe pelo menos Razão Social, Nome Fantasia e CNPJ.');
            Alert.alert('Erro', 'Informe pelo menos Razão Social, Nome Fantasia e CNPJ.');
            return;
        }
        if (!values.usuario) {
            setError('Informe o usuário responsável.');
            Alert.alert('Erro', 'Informe o usuário responsável.');
            return;
        }
        if (unidades.length === 0) {
            setError('Selecione pelo menos uma unidade.');
            Alert.alert('Erro', 'Selecione pelo menos uma unidade.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const unidadeBody: Record<string, unknown> = {
                ...semId(redeOriginal),
                razaoSocial: values.razaoSocial,
                nomeFantasia: values.nomeFantasia,
                cnpj: values.cnpj,
                usuarioId: num(values.usuario),
                layoutId: values.layout ? num(values.layout) : null,
                unidades: unidades.map(u => ({id: (u as any).id})),
                unidadeIds: unidades.map(u => (u as any).id),
            };
            const resposta = redeId
                ? await api.put(`/api/basico/rede/${redeId}`, unidadeBody)
                : await api.post('/api/basico/rede', unidadeBody);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? redeId;
            if (novoId && !redeId) {
                Alert.alert('Sucesso', 'Registro salvo com sucesso.');
            } else {
                Alert.alert('Sucesso', 'Registro salvo com sucesso.');
            }
        } catch (erro) {
            console.error('Erro ao salvar rede:', erro);
            setError('Erro ao salvar registro.');
            Alert.alert('Erro', 'Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Rede</Text>
            </View>
            {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
            <Tabs tabs={tabItems} initial="geral" className="form-tabs"/>
            <View style={styles.footer}>
                <Text style={styles.cancelButton}>Voltar</Text>
                <Text style={[styles.saveButton, salvando && styles.saveButtonDisabled]} onPress={salvar}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: Colors.bgPrimary},
    header: {padding: Spacing.lg, borderBottomWidth: 1, borderColor: Colors.borderLight},
    title: {fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold, color: Colors.textPrimary},
    errorBox: {backgroundColor: Colors.errorBg, borderWidth: 1, borderColor: Colors.error, borderRadius: BorderRadius.lg, padding: Spacing.md, margin: Spacing.lg},
    errorText: {color: Colors.error, fontSize: Typography.sizes.base, textAlign: 'center'},
    tabContent: {flex: 1, padding: Spacing.lg},
    field: {marginBottom: Spacing.sm},
    formRow: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm},
    fieldHalf: {width: '47%'},
    fieldFull: {width: '100%'},
    fieldLabel: {fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.textSecondary, marginBottom: Spacing.xs},
    required: {color: Colors.error, marginLeft: 2},
    fieldInput: {flex: 1, borderWidth: 1, borderColor: Colors.formInputBorder, borderRadius: BorderRadius.lg, padding: Spacing.md, fontSize: Typography.sizes.lg, color: Colors.textPrimary, backgroundColor: Colors.bgSecondary},
    selectInput: {backgroundColor: Colors.bgSecondary},
    footer: {flexDirection: 'row', justifyContent: 'space-between', padding: Spacing.lg, borderTopWidth: 1, borderColor: Colors.borderLight},
    cancelButton: {color: Colors.textSecondary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
    saveButton: {color: Colors.primary, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold},
    saveButtonDisabled: {opacity: 0.5},
});
