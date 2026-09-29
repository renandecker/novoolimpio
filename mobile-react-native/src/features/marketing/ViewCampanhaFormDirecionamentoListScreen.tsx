import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, View} from 'react-native';
import {FormLayout} from '../../FormLayout';
import {MasterDetail} from '../../MasterDetail';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types';

export default function ViewCampanhaFormDirecionamentoListScreen({navigation}: {navigation?: any}) {
    const [operadores, setOperadores] = useState<ApiItem[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (values: Record<string, unknown>) => {
        if (!values.direcionamento) { setError('Selecione o direcionamento'); return; }
        if (operadores.length === 0) { setError('Selecione pelo menos um operador'); return; }
        setError('');
        setSaving(true);
        try {
            await api.post('/api/view/campanha/formDirecionamento', {
                campanhaId: values.campanhaId ? Number(values.campanhaId) : null,
                direcionamento: values.direcionamento,
                operadores: operadores.map(o => (o as any).id),
            });
            Alert.alert('Sucesso', 'Direcionamento gerado com sucesso!');
            navigation?.goBack?.();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erro ao gerar direcionamento');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.page}>
            <Text style={styles.title}>Direcionamento de Pacotes</Text>
            <FormLayout
                title="Direcionamento"
                tabs={[
                    {
                        key: 'direcionamento',
                        label: 'Direcionamento',
                        fields: [
                            {name: 'campanhaId', label: 'ID Campanha', readOnly: true},
                            {name: 'campanhaDescricao', label: 'Campanha', readOnly: true},
                            {name: 'direcionamento', label: 'Direcionamento', type: 'select', required: true, options: [
                                {value: 'PRIORITARIA', label: 'Prioritária'},
                                {value: 'NORMAL', label: 'Normal'},
                                {value: 'RETORNO', label: 'Retorno'},
                            ]},
                        ],
                    },
                ]}
                initialValues={{}}
                onSubmit={handleSubmit}
                onCancel={() => navigation?.goBack?.()}
                saving={saving}
                error={error}
                submitLabel="Gerar Pacote"
            />
            <View style={styles.mdWrap}>
                <MasterDetail
                    label="Operadores (telemarketing)"
                    source="/api/basico/usuario"
                    valueKey="id"
                    searchKeys={['login', 'nome', 'email']}
                    columns={[{key: 'login', label: 'Login'}, {key: 'nome', label: 'Nome'}]}
                    items={operadores}
                    onChange={setOperadores}
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
