import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {alunoApi, formatarData, formatarPercentual, Frequencia, Matricula} from '../aluno';

export default function AlunoFrequenciaScreen() {
    const [matriculas, setMatriculas] = useState<Matricula[]>([]);
    const [selecionada, setSelecionada] = useState<number | null>(null);
    const [frequencia, setFrequencia] = useState<Frequencia | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);

    useEffect(() => {
        let active = true;
        alunoApi
            .matriculas()
            .then((data) => {
                if (!active) return;
                setMatriculas(data ? ? []);
                if (data && data.length > 0) setSelecionada(data[0].id);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar as matrículas.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        if (selecionada == null) return;
        let active = true;
        setBusy(true);
        setError('');
        alunoApi
            .frequencia(selecionada)
            .then((data) => {
                if (active) setFrequencia(data);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a frequência.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [selecionada]);

    if (matriculas.length === 0 && !busy) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Frequência</Text>
                {error ? <Text style={styles.errorText}>{error}</Text> :
                    <Text style={styles.empty}>Nenhuma matrícula encontrada.</Text>}
            </View>
        );
    }

    const matriculaAtual = matriculas.find((m) => m.id === selecionada);

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Frequência</Text>

            {matriculas.length > 1 && (
                <Pressable style={styles.select} onPress={() => setPickerOpen(true)}>
                    <Text style={styles.selectLabel}>Matrícula:</Text>
                    <Text
                        style={styles.selectValue}>{matriculaAtual?.componente || matriculaAtual?.curso || 'Selecionar'} ▾</Text>
                </Pressable>
            )}

            {busy && <ActivityIndicator style={styles.spinner}/>}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {frequencia && (
                <View style={styles.section}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemHeaderText}>
                            <Text style={styles.itemTitle}>
                                {frequencia.matricula.componente || frequencia.matricula.curso || 'Disciplina'}
                            </Text>
                            <Text style={styles.itemMeta}>
                                {[
                                    frequencia.matricula.curso,
                                    frequencia.matricula.turma ? `Turma ${frequencia.matricula.turma}` : null,
                                    frequencia.matricula.periodo,
                                ]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </Text>
                        </View>
                        <Text
                            style={styles.headerPercent}>Frequência: {formatarPercentual(frequencia.frequenciaPerc)}</Text>
                    </View>

                    <View style={styles.countersGrid}>
                        <Text style={styles.counter}><Text style={styles.bold}>Aulas
                            realizadas:</Text> {frequencia.aulasRealizadas}</Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Presente:</Text> {frequencia.presentes}
                        </Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Meia presença:</Text> {frequencia.meias}
                        </Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Ausente:</Text> {frequencia.ausentes}
                        </Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Atestado:</Text> {frequencia.atestados}
                        </Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Atrasado:</Text> {frequencia.atrasos}
                        </Text>
                        <Text style={styles.counter}><Text style={styles.bold}>Sem
                            marcação:</Text> {frequencia.semMarcacao}</Text>
                    </View>

                    {frequencia.ocorrencias.length === 0 ? (
                        <Text style={styles.empty}>Sem registros de presença.</Text>
                    ) : (
                        <View style={styles.table}>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={[styles.tableCell, styles.tableHeaderText]}>Data</Text>
                                <Text
                                    style={[styles.tableCell, styles.tableCellWide, styles.tableHeaderText]}>Presença</Text>
                            </View>
                            {frequencia.ocorrencias.map((o, i) => (
                                <View style={styles.tableRow} key={i}>
                                    <Text style={styles.tableCell}>{formatarData(o.data)}</Text>
                                    <Text
                                        style={[styles.tableCell, styles.tableCellWide]}>{o.presencaDescricao || o.presenca}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
                    <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Selecionar Matrícula</Text>
                            <Pressable style={styles.closeBtn} onPress={() => setPickerOpen(false)}
                                       accessibilityLabel="Fechar">
                                <Text style={styles.closeBtnText}>✕</Text>
                            </Pressable>
                        </View>
                        {matriculas.map((m) => (
                            <Pressable
                                key={m.id}
                                style={styles.modalOption}
                                onPress={() => {
                                    setSelecionada(m.id);
                                    setPickerOpen(false);
                                }}
                            >
                                <Text
                                    style={[styles.modalOptionText, m.id === selecionada && styles.modalOptionTextActive]}>
                                    {m.componente || m.curso}
                                </Text>
                            </Pressable>
                        ))}
                    </Pressable>
                </Pressable>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, padding: 16},
    content: {paddingBottom: 24},
    title: {fontSize: 22, fontWeight: 'bold', color: '#1d2025', marginBottom: 12},
    errorText: {color: '#a61b29', fontSize: 14},
    empty: {color: '#888', fontSize: 13, marginTop: 4},
    spinner: {marginVertical: 12},
    select: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f4f7fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12
    },
    selectLabel: {fontSize: 13, color: '#555', marginRight: 6},
    selectValue: {fontSize: 14, color: '#265a88', fontWeight: '600'},
    section: {backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, padding: 16},
    itemHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10},
    itemHeaderText: {flex: 1, marginRight: 8},
    itemTitle: {fontSize: 16, fontWeight: '600', color: '#1d2025'},
    itemMeta: {fontSize: 12, color: '#888', marginTop: 2},
    headerPercent: {fontSize: 12, fontWeight: '600', color: '#265a88'},
    countersGrid: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12},
    counter: {fontSize: 12, color: '#444', width: '50%', marginBottom: 6},
    bold: {fontWeight: '600', color: '#1d2025'},
    table: {borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, overflow: 'hidden'},
    tableRow: {flexDirection: 'row', borderBottomWidth: 1, borderColor: '#eee'},
    tableHeader: {backgroundColor: '#f4f7fa'},
    tableHeaderText: {fontWeight: '600', color: '#555'},
    tableCell: {flex: 1, fontSize: 12, color: '#333', padding: 10, textAlign: 'center'},
    tableCellWide: {flex: 2, textAlign: 'left'},
    modalOverlay: {flex: 1, backgroundColor: 'rgba(29, 32, 37, 0.55)', justifyContent: 'center', padding: 16},
    modalBox: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        maxHeight: '85%',
        shadowColor: '#1d2025',
        shadowOffset: {width: 0, height: 12},
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(194, 170, 60, 0.15)',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#2f333b',
        borderBottomWidth: 3,
        borderBottomColor: '#c2aa3c',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#ffffff',
        letterSpacing: 0.3,
    },
    closeBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeBtnText: {
        color: '#e8d27a',
        fontSize: 18,
        fontWeight: '500',
    },
    modalOption: {paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#f0f0f0'},
    modalOptionText: {fontSize: 15, color: '#1d2025'},
    modalOptionTextActive: {color: '#265a88', fontWeight: '600'},
});
