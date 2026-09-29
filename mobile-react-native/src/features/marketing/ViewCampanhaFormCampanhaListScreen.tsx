import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {FormLayout} from '../../FormLayout';
import {MasterDetail} from '../../MasterDetail';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types';

export default function ViewCampanhaFormCampanhaListScreen({navigation}: {navigation?: any}) {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (values: Record<string, unknown>) => {
        const descricao = String(values.descricao ?? '').trim();
        if (descricao.length < 3) { setError('Descrição deve ter pelo menos 3 caracteres'); return; }
        if (!values.dataInicial) { setError('Data inicial é obrigatória'); return; }
        if (unidades.length === 0) { setError('Selecione pelo menos uma unidade'); return; }
        setError('');
        setSaving(true);
        try {
            await api.post('/api/view/campanha/formCampanha', {
                id: values.id ? Number(values.id) : null,
                descricao,
                dataInicial: values.dataInicial,
                meta: values.meta ? Number(values.meta) : null,
                ativo: values.ativo ?? true,
                unidades: unidades.map(u => (u as any).id),
            });
            Alert.alert('Sucesso', 'Campanha salva com sucesso!');
            navigation?.goBack?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erro ao salvar campanha');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.page}>
            <Text style={styles.title}>Form Campanha</Text>
            <FormLayout
                title="Campanha"
                tabs={[
                    {
                        key: 'dados',
                        label: 'Dados Gerais',
                        fields: [
                            {name: 'id', label: 'ID', readOnly: true},
                            {name: 'descricao', label: 'Descrição', required: true, placeholder: 'Ex: Campanha Matrículas 2026'},
                            {name: 'dataInicial', label: 'Data Inicial', type: 'date', required: true},
                            {name: 'meta', label: 'Meta (qtd prospectos)', type: 'number', required: true},
                            {name: 'ativo', label: 'Ativo', type: 'boolean'},
                        ],
                    },
                    {
                        key: 'acoes',
                        label: 'Ações',
                        fields: [
                            {name: 'tipoCanal', label: 'Tipo Canal', placeholder: 'ID do tipo de canal'},
                            {name: 'estrategia', label: 'Estratégia', placeholder: 'ID da estratégia'},
                            {name: 'acaoDataInicial', label: 'Data Inicial Ação', type: 'date'},
                            {name: 'acaoDataFinal', label: 'Data Final Ação', type: 'date'},
                        ],
                    },
                ]}
                initialValues={{ativo: true}}
                onSubmit={handleSubmit}
                onCancel={() => navigation?.goBack?.()}
                saving={saving}
                error={error}
            />
            <View style={styles.mdWrap}>
                <MasterDetail
                    label="Unidades da campanha"
                    source="/api/basico/unidade"
                    valueKey="id"
                    searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                    columns={[{key: 'sucinto', label: 'Unidade'}, {key: 'CNPJ', label: 'CNPJ'}]}
                    items={unidades}
                    onChange={setUnidades}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#fff', padding: 12},
    title: {fontSize: 18, fontWeight: '700', marginBottom: 8},
    mdWrap: {marginTop: 12, marginBottom: 24},
});
