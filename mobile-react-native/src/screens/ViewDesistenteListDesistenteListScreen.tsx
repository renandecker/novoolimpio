import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {ModuleList} from '../ModuleListScreen';
import {CancelamentoModal} from '../CancelamentoModal';

// listDesistente.xhtml (olimpio.zip) shows a plain list of alunos desistentes; the row actions
// "Reativar", "Reparcelamento" and "Cancelamento de Contrato" each open their own modal — the
// "Cancelamento" wizard is not a page-level tab.
export default function ViewDesistenteListDesistenteListScreen() {
    const [cancelamentoAberto, setCancelamentoAberto] = useState(false);

    return (
        <View style={styles.container}>
            <View style={styles.actionsRow}>
                <Pressable style={styles.dangerBtn} onPress={() => setCancelamentoAberto(true)}>
                    <Text style={styles.btnText}>Cancelamento de Contrato</Text>
                </Pressable>
            </View>
            <ModuleList path="/api/educacao/desistente" title="Desistente"/>
            <CancelamentoModal visible={cancelamentoAberto} onClose={() => setCancelamentoAberto(false)}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1},
    actionsRow: {paddingVertical: 8, paddingHorizontal: 8},
    dangerBtn: {
        backgroundColor: '#b93f2a',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignSelf: 'flex-start',
        shadowColor: '#b93f2a',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3
    },
    btnText: {color: '#fff', fontWeight: '600', fontSize: 14},
});
