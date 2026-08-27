import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {Colors, Spacing, BorderRadius, Typography, Shadows} from '../theme';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH} from '../masterDetailSources';

const TIPO_UNIDADE_OPTIONS = [
    {value: '1', label: 'Matriz'},
    {value: '2', label: 'Filial'},
    {value: '3', label: 'Polo'},
];

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);
const bool = (v: unknown): boolean => v === true || v === 'true';

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
            {type === 'select' ? (
                <TextInput
                    style={[styles.fieldInput, styles.selectInput]}
                    value={value}
                    onChangeText={onChange}
                    editable={editable}
                    placeholder={placeholder}
                />
            ) : (
                <TextInput
                    style={styles.fieldInput}
                    value={value}
                    onChangeText={onChange}
                    editable={editable}
                    placeholder={placeholder ?? mask}
                    keyboardType={type === 'number' ? 'numeric' : type === 'email' ? 'email-address' : 'default'}
                />
            )}
        </View>
    );
}

export default function ViewUnidadeFormUnidadeListScreen() {
    const route = useRoute();
    const idParam = route.params?.id;
    const navigate = () => {}; // Navigation would be handled by React Navigation

    const [unidadeId, setUnidadeId] = useState<number | undefined>();
    const [unidadeOriginal, setUnidadeOriginal] = useState<Record<string, unknown> | null>(null);
    const [telefones, setTelefones] = useState<ApiItem[]>([]);
    const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);
    const [salvando, setSalvando] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [values, setValues] = useState<Record<string, string>>({});

    const tabsData = [
        {
            key: 'geral',
            label: 'Geral',
            fields: [
                {name: 'id', label: 'ID', type: 'text' as const, required: false, editable: false, span: 1},
                {name: 'sucinto', label: 'Sucinto', required: true, span: 2},
                {name: 'razaoSocial', label: 'Razão Social', required: true, span: 3},
                {name: 'nomeFantasia', label: 'Nome Fantasia', required: true, span: 3},
                {name: 'CNPJ', label: 'CNPJ', type: 'text' as const, mask: '99.999.999/9999-99', required: true, span: 2},
                {name: 'inscricaoEstadual', label: 'Inscrição Estadual', required: true, span: 3},
                {name: 'layout', label: 'Layout', type: 'text' as const, span: 3},
                {name: 'responsavel', label: 'Responsável', type: 'text' as const, span: 3},
                {name: 'email', label: 'E-mail', type: 'email' as const, required: true, span: 3},
                {name: 'tipoUnidade', label: 'Tipo Unidade', type: 'select' as const, options: TIPO_UNIDADE_OPTIONS, required: true, span: 2},
                {name: 'ativo', label: 'Ativo', type: 'select' as const, options: [{value: 'true', label: 'Sim'}, {value: 'false', label: 'Não'}], span: 1},
                {name: 'emailRH', label: 'E-mail RH', type: 'email' as const, span: 3},
                {name: 'diretorEnsino', label: 'Diretor de Ensino', span: 3},
                {name: 'coordenador', label: 'Coordenador', span: 3},
                {name: 'registro', label: 'Registro', span: 3},
            ],
        },
        {
            key: 'telefones',
            label: 'Telefones',
            isMasterDetail: true,
            masterDetailConfig: {
                label: 'Telefone',
                source: '/api/basico/telefone',
                valueKey: 'id',
                searchKeys: ['numero', 'ddd'],
                columns: [
                    {key: 'id', label: 'ID'},
                    {key: 'ddd', label: 'DDD'},
                    {key: 'numero', label: 'Número'},
                    {key: 'tipo', label: 'Tipo'},
                ],
            },
        },
        {
            key: 'endereco',
            label: 'Endereço',
            fields: [
                {name: 'cep', label: 'CEP', type: 'text' as const, mask: '99.999-999', required: true, span: 1},
                {name: 'cidade', label: 'Cidade', type: 'text' as const, required: true, span: 2},
                {name: 'bairro', label: 'Bairro', type: 'text' as const, required: true, span: 2},
                {name: 'logradouro', label: 'Logradouro', type: 'text' as const, required: true, span: 3},
                {name: 'numero', label: 'Número', type: 'number' as const, required: true, span: 1},
                {name: 'regiao', label: 'Região', type: 'text' as const, required: true, span: 2},
                {name: 'pontoReferencia', label: 'Ponto de Referência', span: 3},
                {name: 'area', label: 'Área', span: 3},
            ],
        },
        {
            key: 'turnoTrabalho',
            label: 'Turno Trabalho',
            fields: [
                {name: 'turnoFuncionario', label: 'Modelo de Turno', type: 'text' as const, span: 3},
            ],
            isMasterDetail: true,
            masterDetailConfig: {
                label: 'Turno Trabalho',
                source: TURNO_TRABALHO_SOURCE,
                valueKey: 'id',
                searchKeys: TURNO_TRABALHO_SEARCH,
                columns: TURNO_TRABALHO_COLUMNS,
            },
        },
    ];

    const tabItems: TabItem[] = tabsData.map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: (
            <ScrollView style={styles.tabContent}>
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
                    />
                ))}
                {tab.isMasterDetail && tab.masterDetailConfig && (
                    <MasterDetail
                        label={tab.masterDetailConfig.label}
                        source={tab.masterDetailConfig.source}
                        valueKey={tab.masterDetailConfig.valueKey}
                        searchKeys={tab.masterDetailConfig.searchKeys}
                        columns={tab.masterDetailConfig.columns}
                        items={tab.key === 'telefones' ? telefones : turnosTrabalho}
                        onChange={tab.key === 'telefones' ? setTelefones : setTurnosTrabalho}
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
                const unidade = (await api.get<Record<string, unknown>>(`/api/view/unidade/formUnidade/${idParam}`)).data;
                if (!ativo) return;
                setUnidadeId(unidade.id as number);
                setUnidadeOriginal(unidade);

                const newValues = {
                    id: str(unidade.id),
                    sucinto: str(unidade.sucinto),
                    razaoSocial: str(unidade.razaoSocial),
                    nomeFantasia: str(unidade.nomeFantasia),
                    CNPJ: str(unidade.CNPJ),
                    inscricaoEstadual: str(unidade.inscricaoEstadual),
                    layout: str(unidade.layout?.id ?? unidade.layout),
                    responsavel: str(unidade.responsavel?.id ?? unidade.responsavel),
                    email: str(unidade.email),
                    tipoUnidade: str(unidade.tipoUnidade?.id ?? unidade.tipoUnidade),
                    ativo: String(bool(unidade.ativo)),
                    emailRH: str(unidade.emailRH),
                    diretorEnsino: str(unidade.diretorEnsino),
                    coordenador: str(unidade.coordenador),
                    registro: str(unidade.registro),
                    cep: str(unidade.cep),
                    cidade: str(unidade.cidade?.id ?? unidade.cidade),
                    bairro: str(unidade.bairro?.id ?? unidade.bairro),
                    logradouro: str(unidade.logradouro?.id ?? unidade.logradouro),
                    numero: str(unidade.numero),
                    regiao: str(unidade.regiao?.id ?? unidade.regiao),
                    pontoReferencia: str(unidade.pontoReferencia),
                    area: str(unidade.area),
                    turnoFuncionario: str(unidade.turnoFuncionario?.id ?? unidade.turnoFuncionario),
                };
                setValues(newValues);

                if (unidade.telefones && Array.isArray(unidade.telefones)) {
                    setTelefones(unidade.telefones);
                }

                if (unidade.listaTurnosTrabalho && Array.isArray(unidade.listaTurnosTrabalho)) {
                    setTurnosTrabalho(unidade.listaTurnosTrabalho);
                }
            } catch (erro) {
                console.error('Erro ao carregar unidade:', erro);
                Alert.alert('Erro', 'Erro ao carregar registro.');
            }
        })();
        return () => {
            ativo = false;
        };
    }, [idParam]);

    const voltar = () => {
        // Navigation handled by React Navigation
    };

    const salvar = async (voltarDepois: boolean) => {
        if (!values.sucinto || !values.razaoSocial || !values.nomeFantasia || !values.CNPJ) {
            setError('Informe pelo menos Sucinto, Razão Social, Nome Fantasia e CNPJ.');
            Alert.alert('Erro', 'Informe pelo menos Sucinto, Razão Social, Nome Fantasia e CNPJ.');
            return;
        }
        setSalvando(true);
        setError(undefined);
        try {
            const unidadeBody: Record<string, unknown> = {
                ...semId(unidadeOriginal),
                sucinto: values.sucinto,
                razaoSocial: values.razaoSocial,
                nomeFantasia: values.nomeFantasia,
                CNPJ: values.CNPJ,
                inscricaoEstadual: values.inscricaoEstadual || null,
                layoutId: num(values.layout),
                responsavelId: num(values.responsavel),
                email: values.email || null,
                tipoUnidadeId: num(values.tipoUnidade),
                ativo: values.ativo === 'true',
                emailRH: values.emailRH || null,
                diretorEnsino: values.diretorEnsino || null,
                coordenador: values.coordenador || null,
                registro: values.registro || null,
                cep: values.cep || null,
                cidadeId: num(values.cidade),
                bairroId: num(values.bairro),
                logradouroId: num(values.logradouro),
                numero: num(values.numero),
                regiaoId: num(values.regiao),
                pontoReferencia: values.pontoReferencia || null,
                area: values.area || null,
                turnoFuncionarioId: num(values.turnoFuncionario),
                telefones: telefones.map(t => ({id: t.id})),
                listaTurnosTrabalho: turnosTrabalho.map(t => ({id: t.id})),
            };
            const resposta = unidadeId
                ? await api.put(`/api/basico/unidade/${unidadeId}`, unidadeBody)
                : await api.post('/api/basico/unidade', unidadeBody);
            const novoId = (resposta.data as Record<string, unknown>)?.id ?? unidadeId;
            if (voltarDepois) {
                voltar();
            } else {
                Alert.alert('Sucesso', 'Registro salvo com sucesso.');
            }
        } catch (erro) {
            console.error('Erro ao salvar:', erro);
            setError('Erro ao salvar registro.');
            Alert.alert('Erro', 'Erro ao salvar registro.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Unidade</Text>
            </View>
            {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
            <Tabs tabs={tabItems} initial="geral" className="form-tabs"/>
            <View style={styles.footer}>
                <Text style={styles.cancelButton} onPress={voltar}>Voltar</Text>
                <Text style={[styles.saveButton, salvando && styles.saveButtonDisabled]} onPress={() => salvar(false)}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.bgPrimary,
    },
    header: {
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderColor: Colors.borderLight,
    },
    title: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        color: Colors.textPrimary,
    },
    errorBox: {
        backgroundColor: Colors.errorBg,
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        margin: Spacing.lg,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.sizes.base,
        textAlign: 'center',
    },
    tabContent: {
        flex: 1,
        padding: Spacing.lg,
    },
    field: {
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    required: {
        color: Colors.error,
        marginLeft: 2,
    },
    fieldInput: {
        borderWidth: 1,
        borderColor: Colors.formInputBorder,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        fontSize: Typography.sizes.lg,
        color: Colors.textPrimary,
        backgroundColor: Colors.bgSecondary,
    },
    selectInput: {
        backgroundColor: Colors.bgSecondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderTopWidth: 1,
        borderColor: Colors.borderLight,
    },
    cancelButton: {
        color: Colors.textSecondary,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    saveButton: {
        color: Colors.primary,
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
});