import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Button, ScrollView, StyleSheet, TouchableOpacity, Picker} from 'react-native';
import {api} from '../../../shared/services/api'; // Adjust path if needed or use fetch

const TIPOS_SERVICO = [
    {label: 'Por Contato', value: 0},
    {label: 'Por Minuto', value: 1},
    {label: 'Por Dia', value: 2},
    {label: 'Por Semana', value: 3},
    {label: 'Por Mês', value: 4},
    {label: 'Por Ano', value: 5},
];

export default function ViewCustoServicoFormCustoServicoListScreen() {
    const [valorEmail, setValorEmail] = useState('');
    const [tipoEmail, setTipoEmail] = useState(0);
    const [valorSms, setValorSms] = useState('');
    const [tipoSms, setTipoSms] = useState(0);
    const [valorLigacao, setValorLigacao] = useState('');
    const [tipoLigacao, setTipoLigacao] = useState(0);
    const [unidades, setUnidades] = useState<any[]>([]);
    const [listaUnidades, setListaUnidades] = useState<any[]>([]);
    const [unidadeSelecionada, setUnidadeSelecionada] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/api/basico/unidade').then(res => {
            if (Array.isArray(res.data)) {
                setListaUnidades(res.data);
            }
        }).catch(() => {});
    }, []);

    const handleSave = () => {
        if (unidades.length === 0) {
            setMsg('Selecione ao menos 1 unidade.');
            return;
        }
        setLoading(true);
        setMsg('');

        const payload = {
            valorEmail: Number(valorEmail || 0),
            tipoEmail: Number(tipoEmail),
            valorSms: Number(valorSms || 0),
            tipoSms: Number(tipoSms),
            valorLigacao: Number(valorLigacao || 0),
            tipoLigacao: Number(tipoLigacao),
            dataAlteracao: new Date().toISOString()
        };

        api.post('/api/financeiro/custo-servico', payload).then(() => {
            setMsg('Salvo com sucesso!');
            setLoading(false);
        }).catch(err => {
            setMsg(err.response?.data?.message || 'Erro ao salvar.');
            setLoading(false);
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Custo por Serviço</Text>

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <Text style={styles.label}>Valor Email *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={valorEmail} onChangeText={setValorEmail} placeholder="0.00" />

            <Text style={styles.label}>Valor SMS *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={valorSms} onChangeText={setValorSms} placeholder="0.00" />

            <Text style={styles.label}>Valor Ligação *</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={valorLigacao} onChangeText={setValorLigacao} placeholder="0.00" />

            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Salvando...' : 'Salvar'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    title: {fontSize: 22, fontWeight: 'bold', marginBottom: 20},
    label: {fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 5},
    input: {borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, fontSize: 16},
    button: {backgroundColor: '#007bff', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 25},
    buttonText: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
    msg: {padding: 10, backgroundColor: '#e2e3e5', color: '#383d41', marginBottom: 15, borderRadius: 5}
});
