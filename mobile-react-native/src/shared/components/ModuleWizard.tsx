import React, {useEffect, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {MasterDetail} from '../../MasterDetail';
import type {MasterDetailColumn} from '../../MasterDetail';
import {Wizard} from './Wizard';
import type {WizardStep} from './Wizard';
import {UnidadeCombo, toUnidadeOption} from './UnidadeCombo';
import type {AutoCompleteOption} from './AutoComplete';
import {api} from '../services/api';
import type {ApiItem} from '../types/types';

export interface ModuleWizardMasterDetail {
    label: string;
    source: string;
    valueKey?: string;
    searchKeys?: string[];
    columns?: MasterDetailColumn[];
    /** Endpoint que lista os vínculos existentes do registro em edição (ex.: /api/educacao/curriculo-unidade). */
    loadPath?: string;
    /** Query param usado para filtrar os vínculos pelo registro em edição (ex.: curriculoId). */
    loadParam?: string;
    /** Campo do item de vínculo que guarda o id do item mestre (ex.: unidadeId). */
    linkKey?: string;
}

export interface ModuleWizardField {
    label: string;
    placeholder?: string;
    secure?: boolean;
}

export interface ModuleWizardCombo {
    label: string;
    source: string;
    valueKey?: string;
    /** Endpoint que lista os vínculos existentes do registro em edição (ex.: /api/educacao/curriculo-unidade). */
    loadPath?: string;
    /** Query param usado para filtrar os vínculos pelo registro em edição (ex.: curriculoId). */
    loadParam?: string;
    /** Campo do item de vínculo que guarda o id do item mestre (ex.: unidadeId). */
    linkKey?: string;
    minChars?: number;
}

export interface ModuleWizardStep {
    key: string;
    label: string;
    path?: string;
    empty?: string;
    masterDetail?: ModuleWizardMasterDetail;
    combo?: ModuleWizardCombo;
    fields?: ModuleWizardField[];
    nextLabel?: string;
}

interface ModuleWizardProps {
    steps: ModuleWizardStep[];
    completeLabel?: string;
    onSave?: (data: Record<string, unknown>) => void;
    /** Id do registro em edição. Quando presente, carrega e enriquece os vínculos das etapas masterDetail. */
    editId?: string | number | null;
}

const PRIMARY = '#2a5a88';

const PREFERRED_LABELS = ['nome', 'descricao', 'razaoSocial', 'nomeFantasia', 'sucinto', 'rotulo', 'titulo', 'sigla', 'login', 'uf'];

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const toTitle = (value: string) =>
    value
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .replace(/([a-z\d])([A-Z])/g, '$1 $2')
        .replace(/^./, (c) => c.toUpperCase());

const primaryLabel = (item: ApiItem): string => {
    const record = asRecord(item);
    for (const key of PREFERRED_LABELS) {
        const value = record[key];
        if (value !== null && value !== undefined && String(value) !== '') return String(value);
    }
    for (const key of Object.keys(record)) {
        if (key.endsWith('_descricao')) {
            const value = record[key];
            if (value !== null && value !== undefined && String(value) !== '') return String(value);
        }
    }
    return `#${item.id}`;
};

const apiErrorMessage = (error: unknown) =>
    (error as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? (error as Error)?.message
        ?? 'erro desconhecido';

function MasterDetailStep({
                              config,
                              items,
                              onChange,
                          }: {
    config: ModuleWizardMasterDetail;
    items: ApiItem[];
    onChange: (items: ApiItem[]) => void;
}) {
    return (
        <MasterDetail
            label={config.label}
            source={config.source}
            valueKey={config.valueKey}
            searchKeys={config.searchKeys}
            columns={config.columns}
            items={items}
            onChange={onChange}
        />
    );
}

function ComboStep({
                      config,
                      value,
                      onChange,
                  }: {
    config: ModuleWizardCombo;
    value: AutoCompleteOption | null;
    onChange: (option: AutoCompleteOption | null) => void;
}) {
    return (
        <UnidadeCombo
            label={config.label}
            value={value}
            onChange={onChange}
            minChars={config.minChars ?? 0}
            style={styles.combo}
        />
    );
}

function FieldsStep({fields}: { fields: ModuleWizardField[] }) {
    return (
        <View style={styles.formGrid}>
            {fields.map((field) => (
                <View key={field.label} style={styles.formField}>
                    <Text style={styles.formLabel}>{field.label}</Text>
                    <TextInput
                        style={styles.formInput}
                        placeholder={field.placeholder ?? field.label}
                        secureTextEntry={field.secure}
                    />
                </View>
            ))}
        </View>
    );
}

function LoadListStep({path}: { path: string }) {
    const [items, setItems] = useState<ApiItem[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;
        api
            .get<ApiItem[]>(path)
            .then((response) => {
                const data = Array.isArray(response.data) ? response.data : [];
                if (!cancelled) setItems(data);
            })
            .catch((err) => {
                if (!cancelled) setError(apiErrorMessage(err));
            });
        return () => {
            cancelled = true;
        };
    }, [path]);

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>Não foi possível carregar os dados.</Text>
                <Text style={styles.empty}>{error}</Text>
            </View>
        );
    }

    if (!items) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={PRIMARY} size="large"/>
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.center}>
                <Text style={styles.empty}>Nenhum registro encontrado.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.list}>
            {items.map((item) => (
                <View key={String(item.id)} style={styles.row}>
                    <Text style={styles.rowLabel}>{primaryLabel(item)}</Text>
                    <Text style={styles.rowId}>#{item.id}</Text>
                </View>
            ))}
        </ScrollView>
    );
}

export function ModuleWizard({steps, completeLabel, onSave, editId}: ModuleWizardProps) {
    const [masterItems, setMasterItems] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState<boolean>(() =>
        editId != null && steps.some((step) => Boolean((step.masterDetail ?? step.combo)?.loadPath)),
    );

    useEffect(() => {
        if (editId == null) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        (async () => {
            const next: Record<string, unknown> = {};
            try {
                for (const step of steps) {
                    const conf = step.masterDetail ?? step.combo;
                    if (!conf?.loadPath || !conf.loadParam || !conf.linkKey) continue;
                    const vinculos = (await api.get<ApiItem[]>(conf.loadPath, {params: {[conf.loadParam]: editId}})).data ?? [];
                    const todos = (await api.get<ApiItem[]>(conf.source)).data ?? [];
                    const ids = new Set(vinculos.map((vinc) => String(asRecord(vinc)[conf.linkKey!])));
                    const valueKey = conf.valueKey ?? 'id';
                    const selected = todos.filter((item) => ids.has(String(asRecord(item)[valueKey])));
                    next[step.key] = step.combo ? toUnidadeOption(selected[0]) : selected;
                }
            } catch (error) {
                console.error('ModuleWizard: falha ao carregar dados em edição', error);
            }
            if (!cancelled) {
                setMasterItems(next);
                setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // steps é estável por tela; recarrega apenas quando o id de edição muda.
    }, [editId]);

    const updateMasterItems = (stepKey: string, value: unknown) => {
        setMasterItems((prev) => ({...prev, [stepKey]: value}));
    };

    const wizardSteps: WizardStep[] = steps.map((step, index) => ({
        key: step.key,
        label: step.label,
        content: step.masterDetail ? (
            <MasterDetailStep
                config={step.masterDetail}
                items={(masterItems[step.key] as ApiItem[] | undefined) ?? []}
                onChange={(items) => updateMasterItems(step.key, items)}
            />
        ) : step.combo ? (
            <ComboStep
                config={step.combo}
                value={(masterItems[step.key] as AutoCompleteOption | null | undefined) ?? null}
                onChange={(option) => updateMasterItems(step.key, option)}
            />
        ) : step.fields ? (
            <FieldsStep fields={step.fields}/>
        ) : step.path ? (
            <LoadListStep path={step.path}/>
        ) : (
            <View style={styles.center}>
                <Text style={styles.empty}>{step.empty ?? 'Sem conteúdo nesta etapa.'}</Text>
            </View>
        ),
        nextLabel: index === steps.length - 1 ? undefined : step.nextLabel,
    }));

    const lastStep = steps[steps.length - 1];

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={PRIMARY} size="large"/>
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }

    return (
        <Wizard
            steps={wizardSteps}
            initialData={masterItems}
            completeLabel={lastStep?.nextLabel ?? completeLabel}
            onComplete={(data) => onSave?.({...data, ...masterItems})}
        />
    );
}

const styles = StyleSheet.create({
    center: {flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 32, gap: 8},
    empty: {color: '#888', fontStyle: 'italic', textAlign: 'center'},
    loadingText: {color: '#888', fontSize: 13, marginTop: 8},
    loader: {color: PRIMARY},
    formGrid: {paddingVertical: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 12},
    formField: {width: '47%', marginBottom: 4},
    formLabel: {fontSize: 13, fontWeight: '700', color: '#2b2b2b', marginBottom: 4},
    formInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
        backgroundColor: '#ffffff',
    },
    combo: {width: '100%'},
    list: {flex: 1},
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 4,
        padding: 10,
        marginBottom: 6,
        backgroundColor: '#fafafa',
    },
    rowLabel: {flex: 1, fontSize: 13, color: '#2b2b2b'},
    rowId: {fontSize: 12, color: '#888', marginLeft: 8},
});