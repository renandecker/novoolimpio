import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, FlatList } from 'react-native';

interface Campo {
    id: number;
    nome: string;
}

interface ControleProspectoItem {
    id: number;
    nome: string;
    valor: string;
    outro?: string;
    unidade?: { sucinto: string };
    nota?: number;
}

export default function ViewProspectoControleProspectoListScreen() {
    const [campos, setCampos] = useState<Campo[]>([]);
    const [selectedCampo, setSelectedCampo] = useState<Campo | null>(null);
    const [items, setItems] = useState<ControleProspectoItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Modals
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [detailHtml, setDetailHtml] = useState('');

    const [ajustarModalVisible, setAjustarModalVisible] = useState(false);
    const [ajustarItem, setAjustarItem] = useState<ControleProspectoItem | null>(null);

    const [ajustarSelecionarModalVisible, setAjustarSelecionarModalVisible] = useState(false);
    const [prospectosSimilares, setProspectosSimilares] = useState<ControleProspectoItem[]>([]);
    const [selectedProspectosIds, setSelectedProspectosIds] = useState<number[]>([]);

    useEffect(() => {
        fetch('http://localhost:8080/api/comercial/campo')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setCampos(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleCampoSelect = (campo: Campo) => {
        setSelectedCampo(campo);
        setLoading(true);
        fetch(`http://localhost:8080/api/comercial/controle-prospecto?campoId=${campo.id}`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleCarregarDetalhes = (id: number) => {
        setLoading(true);
        fetch(`http://localhost:8080/api/comercial/controle-prospecto/carregar-prospecto-para-visualizacao?id=${id}`)
            .then(res => res.text())
            .then(html => {
                setDetailHtml(html || 'Detalhes do prospecto.');
                setDetailModalVisible(true);
                setLoading(false);
            })
            .catch(() => {
                setDetailHtml('Informações detalhadas do prospecto.');
                setDetailModalVisible(true);
                setLoading(false);
            });
    };

    const handleOpenAjustar = (item: ControleProspectoItem) => {
        setAjustarItem(item);
        setAjustarModalVisible(true);
    };

    const handleSalvarAjustar = () => {
        if (!ajustarItem) return;
        fetch(`http://localhost:8080/api/comercial/controle-prospecto/salvar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ajustarItem.id, outro: ajustarItem.outro })
        }).then(() => {
            setAjustarModalVisible(false);
            if (selectedCampo) handleCampoSelect(selectedCampo);
        });
    };

    const handleOpenAjustarSelecionar = (item: ControleProspectoItem) => {
        setAjustarItem(item);
        fetch(`http://localhost:8080/api/comercial/controle-prospecto/carregar-outros-prospecto?id=${item.id}&valor=${encodeURIComponent(item.valor || '')}`)
            .then(res => res.json())
            .then(data => {
                setProspectosSimilares(Array.isArray(data) ? data : []);
                setSelectedProspectosIds([]);
                setAjustarSelecionarModalVisible(true);
            })
            .catch(() => {
                setProspectosSimilares([]);
                setAjustarSelecionarModalVisible(true);
            });
    };

    const handleSalvarSelecionados = () => {
        if (!ajustarItem) return;
        fetch(`http://localhost:8080/api/comercial/controle-prospecto/salvar-selecionados`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: ajustarItem.id, selectedIds: selectedProspectosIds })
        }).then(() => {
            setAjustarSelecionarModalVisible(false);
            if (selectedCampo) handleCampoSelect(selectedCampo);
        });
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Controle Prospecto</Text>
            
            <Text style={styles.label}>Campo *</Text>
            <View style={styles.pickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {campos.map(c => (
                        <TouchableOpacity
                            key={c.id}
                            style={[styles.pickerItem, selectedCampo?.id === c.id && styles.pickerItemSelected]}
                            onPress={() => handleCampoSelect(c)}
                        >
                            <Text style={[styles.pickerItemText, selectedCampo?.id === c.id && styles.pickerItemTextSelected]}>
                                {c.nome}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 20 }} />}

            {items.map(item => (
                <View key={item.id} style={styles.card}>
                    <Text style={styles.cardText}>ID: {item.id}</Text>
                    <Text style={styles.cardText}>Nome: {item.nome}</Text>
                    <Text style={styles.cardText}>Valor: {item.valor}</Text>
                    
                    <View style={styles.actions}>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: '#f0ad4e' }]} onPress={() => handleCarregarDetalhes(item.id)}>
                            <Text style={styles.btnText}>Info</Text>
                        </TouchableOpacity>
                        {item.outro ? (
                            <>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#d9534f' }]} onPress={() => handleOpenAjustar(item)}>
                                    <Text style={styles.btnText}>Ajustar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#5cb85c' }]} onPress={() => handleOpenAjustarSelecionar(item)}>
                                    <Text style={styles.btnText}>Selecionados</Text>
                                </TouchableOpacity>
                            </>
                        ) : null}
                    </View>
                </View>
            ))}

            {/* Modal Ajustar */}
            <Modal visible={ajustarModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Ajustar prospecto</Text>
                        {ajustarItem && (
                            <>
                                <Text style={styles.modalText}>Você tem certeza que deseja Ajustar o prospecto {ajustarItem.nome}?</Text>
                                <Text style={styles.modalSubText}>{ajustarItem.outro}</Text>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#0275d8' }]} onPress={handleSalvarAjustar}>
                                        <Text style={styles.btnText}>Sim</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#d9534f' }]} onPress={() => setAjustarModalVisible(false)}>
                                        <Text style={styles.btnText}>Não</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal Ajustar Selecionados */}
            <Modal visible={ajustarSelecionarModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentLarge}>
                        <Text style={styles.modalTitle}>Prospectos encontrados</Text>
                        {ajustarItem && (
                            <>
                                <Text style={styles.modalText}>Você tem certeza que deseja Ajustar o prospecto {ajustarItem.nome}?</Text>
                                <FlatList
                                    data={prospectosSimilares}
                                    keyExtractor={item => String(item.id)}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.similiarItem, selectedProspectosIds.includes(item.id) && styles.similiarItemSelected]}
                                            onPress={() => {
                                                if (selectedProspectosIds.includes(item.id)) {
                                                    setSelectedProspectosIds(selectedProspectosIds.filter(id => id !== item.id));
                                                } else {
                                                    setSelectedProspectosIds([...selectedProspectosIds, item.id]);
                                                }
                                            }}
                                        >
                                            <Text>{item.id} - {item.nome} ({item.unidade?.sucinto || 'Unidade'})</Text>
                                        </TouchableOpacity>
                                    )}
                                />
                                <View style={styles.modalActions}>
                                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#0275d8' }]} onPress={handleSalvarSelecionados}>
                                        <Text style={styles.btnText}>Sim</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#d9534f' }]} onPress={() => setAjustarSelecionarModalVisible(false)}>
                                        <Text style={styles.btnText}>Não</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Modal Detalhes */}
            <Modal visible={detailModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Informações Prospecto</Text>
                        <Text style={{ marginVertical: 15 }}>{detailHtml}</Text>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#0275d8', alignSelf: 'flex-end' }]} onPress={() => setDetailModalVisible(false)}>
                            <Text style={styles.btnText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
    label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    pickerContainer: { flexDirection: 'row', marginBottom: 16 },
    pickerItem: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, marginRight: 8, backgroundColor: '#f9f9f9' },
    pickerItemSelected: { backgroundColor: '#0275d8', borderColor: '#0275d8' },
    pickerItemText: { color: '#333' },
    pickerItemTextSelected: { color: '#fff', fontWeight: 'bold' },
    card: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 12, backgroundColor: '#fafafa' },
    cardText: { fontSize: 14, marginBottom: 4 },
    actions: { flexDirection: 'row', marginTop: 8, gap: 8 },
    btn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', backgroundColor: '#fff', padding: 20, borderRadius: 8 },
    modalContentLarge: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', padding: 20, borderRadius: 8 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    modalText: { fontSize: 14, marginBottom: 8 },
    modalSubText: { fontSize: 12, color: '#666', marginBottom: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16 },
    modalBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
    similiarItem: { padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 4, marginBottom: 6 },
    similiarItemSelected: { backgroundColor: '#e2f0d9', borderColor: '#b2d2a4' }
});
