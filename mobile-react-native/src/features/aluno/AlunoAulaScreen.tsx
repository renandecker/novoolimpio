import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {alunoApi, AulaAnexoMobile, AulaDetalheMobile} from './aluno';
import type {ParamList} from '../../HomeScreen';

export default function AlunoAulaScreen({route}: NativeStackScreenProps<ParamList, 'aluno/aulas/aula'>) {
    const aulaId = route.params?.aulaId;

    const [aula, setAula] = useState<AulaDetalheMobile | null>(null);
    const [anexos, setAnexos] = useState<AulaAnexoMobile[]>([]);
    const [jaAssistida, setJaAssistida] = useState(false);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(true);
    const [marcando, setMarcando] = useState(false);

    useEffect(() => {
        if (!aulaId) return;
        let active = true;
        Promise.all([
            alunoApi.aula(Number(aulaId)),
            alunoApi.anexosDaAula(Number(aulaId)),
            alunoApi.jaAssistida(Number(aulaId)),
        ])
            .then(([a, listAnexos, assistida]) => {
                if (!active) return;
                setAula(a);
                setAnexos(listAnexos ?? []);
                setJaAssistida(assistida);
            })
            .catch((e: any) => {
                if (active) setError(e.response?.data?.error || e.response?.data?.message || 'Não foi possível carregar a aula.');
            })
            .finally(() => {
                if (active) setBusy(false);
            });
        return () => {
            active = false;
        };
    }, [aulaId]);

    const marcarAssistida = () => {
        if (!aulaId) return;
        setMarcando(true);
        alunoApi
            .marcarAssistida(Number(aulaId))
            .then(() => {
                setJaAssistida(true);
                Alert.alert('Sucesso', 'Aula marcada como assistida!');
            })
            .catch((e: any) => {
                Alert.alert('Erro', e.response?.data?.error || e.response?.data?.message || 'Não foi possível marcar a aula como assistida.');
            })
            .finally(() => setMarcando(false));
    };

    if (busy) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.page}>
                <Text style={styles.title}>Detalhe da Aula</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!aula) {
        return (
            <View style={styles.page}>
                <Text style={styles.empty}>Aula não encontrada.</Text>
            </View>
        );
    }

    const videos = anexos.filter((a) => a.tipo === 'VIDEO');
    const documentos = anexos.filter((a) => a.tipo === 'PDF' || a.tipo === 'IMAGEM');

    return (
        <ScrollView style={styles.page} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{aula.nome || `Aula ${aula.id}`}</Text>

            {aula.descricao ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Descrição</Text>
                    <Text style={styles.descText}>{aula.descricao}</Text>
                </View>
            ) : null}

            {videos.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vídeos da Aula</Text>
                    {videos.map((v) => (
                        <View key={v.id} style={styles.anexoItem}>
                            <Text style={styles.anexoName}>{v.nome}</Text>
                            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(v.anexo)}>
                                <Text style={styles.linkButtonText}>Assistir / Abrir Vídeo</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {documentos.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materiais de Apoio</Text>
                    {documentos.map((d) => (
                        <View key={d.id} style={styles.anexoItem}>
                            <Text style={styles.anexoName}>{d.nome}</Text>
                            <TouchableOpacity style={styles.linkButton} onPress={() => Linking.openURL(d.anexo)}>
                                <Text style={styles.linkButtonText}>Baixar / Visualizar</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.actionContainer}>
                {jaAssistida ? (
                    <View style={styles.successBadge}>
                        <Text style={styles.successBadgeText}>✓ Aula assistida</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.button, marcando && styles.buttonDisabled]}
                        onPress={marcarAssistida}
                        disabled={marcando}
                    >
                        <Text style={styles.buttonText}>{marcando ? 'Marcando...' : 'Marcar como assistida'}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: {flex: 1, backgroundColor: '#f8f9fa'},
    content: {padding: 16, paddingBottom: 30},
    center: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    title: {fontSize: 22, fontWeight: 'bold', color: '#2a5a88', marginBottom: 12},
    errorText: {color: '#a61b29', fontSize: 14},
    empty: {textAlign: 'center', color: '#888', marginTop: 16},
    section: {backgroundColor: '#ffffff', borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e5e5'},
    sectionTitle: {fontSize: 14, fontWeight: '700', color: '#2b2b2b', marginBottom: 8},
    descText: {fontSize: 13, color: '#444', lineHeight: 18},
    anexoItem: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f1f1f1'},
    anexoName: {fontSize: 13, color: '#333', flex: 1, marginRight: 8},
    linkButton: {backgroundColor: '#eef2f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6},
    linkButtonText: {fontSize: 12, fontWeight: '600', color: '#2a5a88'},
    actionContainer: {marginTop: 20, alignItems: 'center'},
    button: {backgroundColor: '#1e7e45', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, width: '100%', alignItems: 'center'},
    buttonDisabled: {backgroundColor: '#9e9e9e'},
    buttonText: {color: '#ffffff', fontSize: 15, fontWeight: 'bold'},
    successBadge: {backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#a7f3d0', padding: 12, borderRadius: 8, width: '100%', alignItems: 'center'},
    successBadgeText: {color: '#059669', fontSize: 15, fontWeight: 'bold'},
});
