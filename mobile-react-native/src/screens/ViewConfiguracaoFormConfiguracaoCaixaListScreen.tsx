import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import {api} from '../api';

export default function ViewConfiguracaoFormConfiguracaoCaixaListScreen({navigation, route}: any) {
    const [form, setForm] = useState({
        unidadeId: '',
        usuarioId: '',
        responsavelId: '',
        email: '',
        dias: '5',
        impressao: '1',
        fundoCaixa: '0.00',
        pagPropriaUnid: false,
        tipoModeloCaixa: '0'
    });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.post('/api/financeiro/configuracao-caixa', {
                ...form,
                dias: Number(form.dias),
                impressao: Number(form.impressao),
                fundoCaixa: Number(form.fundoCaixa),
                tipoModeloCaixa: Number(form.tipoModeloCaixa)
            });
            Alert.alert('Sucesso', 'Configuração de caixa salva com sucesso!');
            navigation.goBack();
        } catch (err: any) {
            Alert.alert('Erro', err?.response?.data?.error || err.message || 'Erro ao salvar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Configuração de Caixa</Text>

            <Text style={styles.label}>E-mail *</Text>
            <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(v) => setForm({...form, email: v})}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Dias (Validade 2ª via)</Text>
            <TextInput
                style={styles.input}
                value={form.dias}
                onChangeText={(v) => setForm({...form, dias: v})}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Impressão / Cota</Text>
            <TextInput
                style={styles.input}
                value={form.impressao}
                onChangeText={(v) => setForm({...form, impressao: v})}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Fundo de Caixa *</Text>
            <TextInput
                style={styles.input}
                value={form.fundoCaixa}
                onChangeText={(v) => setForm({...form, fundoCaixa: v})}
                keyboardType="numeric"
            />

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar Configuração'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 16, backgroundColor: '#fff'},
    title: {fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333'},
    label: {fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#444'},
    input: {borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 14, fontSize: 14},
    button: {backgroundColor: '#2e7d32', padding: 14, borderRadius: 6, alignItems: 'center', marginTop: 10, marginBottom: 30},
    buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'}
});
