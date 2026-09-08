import React, {useState} from 'react';
import {View, Text, TextInput, Button, ScrollView, Modal, StyleSheet} from 'react-native';
import {ModuleTabs} from '../ModuleTabs';

const CAMPO_COLUMNS = [
    {key: 'rotulo', label: 'Rótulo'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo de Campo'},
    {key: 'categoria', label: 'Categoria de Campo'},
    {key: 'obrigatorio', label: 'Obrigatório'},
    {key: 'permitirHistorico', label: 'Permitir Histórico'},
    {key: 'ordem', label: 'Ordem'},
];

const UNIDADE_COLUMNS = [
    {key: 'id', label: 'Id'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razaoSocial', label: 'Razão Social'},
    {key: 'nomeFantasia', label: 'Nome Fantasia'},
    {key: 'CNPJ', label: 'CNPJ'},
    {key: 'ativo', label: 'Ativo'},
];

export default function ViewAcaoFormAcaoListScreen() {
    const [descricao, setDescricao] = useState('');
    const [responsavelId, setResponsavelId] = useState('');
    const [dataColeta, setDataColeta] = useState('');
    const [dataInicial, setDataInicial] = useState('');
    const [dataFinalCaptacao, setDataFinalCaptacao] = useState('');
    const [tipoAcaoId, setTipoAcaoId] = useState('');
    const [dataFinal, setDataFinal] = useState('');
    const [meta, setMeta] = useState('');
    const [custo, setCusto] = useState('');
    const [showModal, setShowModal] = useState(false);

    const handleSave = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/comercial/acao', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    descricao,
                    responsavelId: responsavelId ? Number(responsavelId) : null,
                    tipoAcaoId: tipoAcaoId ? Number(tipoAcaoId) : null,
                    meta: meta ? Number(meta) : null,
                    custo: custo ? Number(custo) : null,
                })
            });
            if (res.ok) {
                alert('Ação salva com sucesso!');
            } else {
                alert('Erro ao salvar.');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ModuleTabs
            tabs={[
                {
                    key: 'acao',
                    label: 'Ação',
                    content: (
                        <ScrollView style={styles.container}>
                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Descrição *</Text>
                                <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Contratante (Responsável) *</Text>
                                <View style={styles.fieldButtonGroup}>
                                    <TextInput style={styles.input} value={responsavelId} onChangeText={setResponsavelId} placeholder="ID Responsável" />
                                    <Button title="+" onPress={() => setShowModal(true)} />
                                </View>
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Data Coleta</Text>
                                <TextInput style={styles.input} value={dataColeta} onChangeText={setDataColeta} placeholder="DD/MM/YYYY" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Data Inicial Captação</Text>
                                <TextInput style={styles.input} value={dataInicial} onChangeText={setDataInicial} placeholder="DD/MM/YYYY" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Data Final Captação</Text>
                                <TextInput style={styles.input} value={dataFinalCaptacao} onChangeText={setDataFinalCaptacao} placeholder="DD/MM/YYYY" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Tipo Ação *</Text>
                                <TextInput style={styles.input} value={tipoAcaoId} onChangeText={setTipoAcaoId} placeholder="ID Tipo Ação" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Data Final Cadastro</Text>
                                <TextInput style={styles.input} value={dataFinal} onChangeText={setDataFinal} placeholder="DD/MM/YYYY" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Prev. Meta *</Text>
                                <TextInput style={styles.input} value={meta} onChangeText={setMeta} keyboardType="numeric" />
                            </View>

                            <View style={styles.fieldRow}>
                                <Text style={styles.label}>Prev. Custo *</Text>
                                <TextInput style={styles.input} value={custo} onChangeText={setCusto} keyboardType="numeric" />
                            </View>

                            <Button title="Salvar" onPress={handleSave} />

                            <Modal visible={showModal} animationType="slide">
                                <View style={{flex: 1, padding: 20, justifyContent: 'center'}}>
                                    <Text style={{fontSize: 18, fontWeight: 'bold'}}>Cadastro de Aluno / Pessoa</Text>
                                    <Button title="Fechar" onPress={() => setShowModal(false)} />
                                </View>
                            </Modal>
                        </ScrollView>
                    )
                },
                {
                    key: 'campos',
                    label: 'Campos',
                    masterDetail: {
                        label: 'Campo',
                        source: '/api/comercial/campo',
                        valueKey: 'id',
                        searchKeys: ['rotulo', 'nome', 'tipo'],
                        columns: CAMPO_COLUMNS,
                    },
                },
                {
                    key: 'unidade',
                    label: 'Unidade',
                    masterDetail: {
                        label: 'Unidade',
                        source: '/api/basico/unidade',
                        valueKey: 'id',
                        searchKeys: ['sucinto', 'razaoSocial', 'nomeFantasia'],
                        columns: UNIDADE_COLUMNS,
                    },
                },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    container: {padding: 15},
    fieldRow: {flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12},
    fieldButtonGroup: {flex: 1, flexDirection: 'row', gap: 5},
    label: {width: 150, fontWeight: 'bold'},
    input: {flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 4},
});
