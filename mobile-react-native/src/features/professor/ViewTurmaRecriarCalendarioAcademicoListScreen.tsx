import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, Pressable, Alert} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ModuleList} from '../../shared/components/ModuleListScreen';
import {MasterDetail} from '../../MasterDetail';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH, COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH} from '../../masterDetailSources';
import {api} from '../../shared/services/api';
import {can} from '../../shared/services/permissions';
import {useAuth} from '../auth/auth';

const asRecord = (item: any) => (item ?? {}) as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const CALENDARIO_COLUMNS = [
    {key: 'data', label: 'Dia Aula', render: (item: any) => formatDate(asRecord(item).data)},
    {
        key: 'aulaPresencial',
        label: 'Aula Presencial',
        render: (item: any) => {
            const v = asRecord(item).aulaPresencial;
            if (v === null || v === undefined) return '';
            return v ? 'Sim' : 'Não';
        },
    },
    {key: 'sala_descricao', label: 'Sala'},
    {key: 'dia_semana', label: 'Dia Semana'},
    {key: 'tipo', label: 'Tipo'},
];

export default function ViewTurmaRecriarCalendarioAcademicoListScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const {session} = useAuth();
    const turmaId = route?.params?.turmaId != null ? Number(route.params.turmaId) : null;
    const [turmaInfo, setTurmaInfo] = useState<string>('');
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        if (!turmaId) return;
        let active = true;
        api.get<any>(`/api/educacao/turma/${turmaId}`)
            .then(({data}) => {
                if (!active) return;
                const r = asRecord(data);
                setTurmaInfo(
                    [r.unidade_descricao, r.grupo_descricao, r.curriculo_descricao, r.componente_curricular_descricao]
                        .filter(Boolean)
                        .join(' · ')
                );
            })
            .catch(() => {
                if (active) setTurmaInfo('');
            });
        return () => {
            active = false;
        };
    }, [turmaId]);

    const salvar = async () => {
        if (!turmaId) {
            Alert.alert('Aviso', 'Nenhuma turma selecionada.');
            return;
        }
        setSalvando(true);
        try {
            await api.post(`/api/educacao/calendario/recriar`, {turmaId: Number(turmaId)});
            Alert.alert('Sucesso', 'Calendário recriado com sucesso!');
        } catch (e: any) {
            Alert.alert('Erro', e.response?.data?.error || e.response?.data?.message || 'Não foi possível recriar o calendário.');
        } finally {
            setSalvando(false);
        }
    };

    const outcome = '/view/turma/recriarCalendarioAcademico';

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>← Voltar</Text>
                </Pressable>
                <Text style={styles.title}>Recriar Calendário Acadêmico{turmaId ? ` - Turma #${turmaId}` : ''}</Text>
            </View>
            {turmaInfo && <Text style={styles.info}>{turmaInfo}</Text>}

            <ModuleList
                path="/api/educacao/ocorrencia-componente-curricular"
                params={turmaId ? {turmaId: Number(turmaId)} : undefined}
                title="Dias Aula"
                columns={CALENDARIO_COLUMNS}
                hideCreate
                hideUpdate
                hideDelete
                hideView
            />

            <View style={styles.footer}>
                <Pressable style={[styles.btn, styles.btnBlue, salvando && styles.btnDisabled]} onPress={salvar} disabled={salvando || !turmaId}>
                    <Text style={styles.btnText}>{salvando ? 'Salvando...' : 'Salvar'}</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnYellow]} onPress={() => navigation.goBack()}>
                    <Text style={styles.btnText}>Voltar</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8fafc'},
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backBtn: {padding: 8},
    backBtnText: {color: '#337ab7', fontSize: 16, fontWeight: '600'},
    title: {fontSize: 18, fontWeight: '700', color: '#1d2025', flex: 1, textAlign: 'center', marginLeft: -40},
    info: {padding: 12, backgroundColor: '#eff6ff', margin: 16, borderRadius: 8, color: '#1e40af', fontSize: 13},
    footer: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    btn: {flex: 1, borderRadius: 8, paddingVertical: 12, alignItems: 'center'},
    btnBlue: {backgroundColor: '#337ab7'},
    btnYellow: {backgroundColor: '#c2aa3c'},
    btnDisabled: {opacity: 0.6},
    btnText: {color: '#fff', fontWeight: '700', fontSize: 15},
});