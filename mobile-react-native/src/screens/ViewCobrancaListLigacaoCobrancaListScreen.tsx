import React from 'react';
import {ActivityIndicator, StyleSheet, Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {Tabs} from '../Tabs';
import {ModuleList, ModuleListExtraAction} from '../ModuleListScreen';
import {executeAction} from '../actions';
import type {ApiItem} from '../types';

interface EtapaCobranca {
    id: number;
    descricao: string;
}

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const extraActions: ModuleListExtraAction[] = [
    {
        key: 'detalhes',
        title: 'Detalhes',
        icon: 'ℹ️',
        permission: 'READ',
        onPress: async (item) => {
            await executeAction('ligacao-cobranca', 'carregarDetalhes', JSON.stringify({contrato: asRecord(item).contrato}), 'financeiro');
        },
    },
    {
        key: 'documento',
        title: 'Documento',
        icon: '📄',
        permission: 'READ',
        onPress: async (item) => {
            await executeAction('ligacao-cobranca', 'carregarContrato', JSON.stringify({contrato: asRecord(item).contrato}), 'financeiro');
        },
    },
    {
        key: 'ligacao',
        title: 'Ligação',
        icon: '📞',
        permission: 'EXECUTE',
        onPress: async (item) => {
            await executeAction('ligacao-cobranca', 'iniciarLigacao', JSON.stringify({cobranca: asRecord(item).cobranca, contrato: asRecord(item).contrato}), 'financeiro');
        },
    },
    {
        key: 'email',
        title: 'E-mail',
        icon: '✉️',
        permission: 'EXECUTE',
        onPress: async (item) => {
            await executeAction('ligacao-cobranca', 'prepararEnvioEmail', JSON.stringify({id: item.id}), 'financeiro');
        },
    },
];

export default function ViewCobrancaListLigacaoCobrancaListScreen() {
    const etapasQuery = useQuery({
        queryKey: ['etapas-cobranca'],
        queryFn: async () => (await api.get<EtapaCobranca[]>('/api/financeiro/etapas-cobranca')).data,
    });
    const etapas = etapasQuery.data ?? [];

    if (etapasQuery.isLoading && etapas.length === 0) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    return (
        <View style={styles.page}>
            <Text style={styles.title}>Ligação Cobrança</Text>
            {etapasQuery.isError ? <Text style={styles.errorText}>Erro ao carregar as etapas.</Text> : null}
            <Tabs
                tabs={etapas.map((etapa) => ({
                    key: String(etapa.id),
                    label: etapa.descricao || `Etapa ${etapa.id}`,
                    content: (
                        <ModuleList
                            path="/api/view/cobranca/listLigacaoCobranca"
                            params={{etapasCobrancaId: etapa.id}}
                            extraActions={extraActions}
                            outcome="view/cobranca/listLigacaoCobranca/actions"
                            hideCreate={true}
                            hideUpdate={true}
                            hideDelete={true}
                        />
                    ),
                }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 16},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2b2b2b', marginBottom: 12},
    errorText: {color: '#a61b29', fontSize: 14, marginBottom: 8},
});
