import React from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {useAuth} from '../auth/auth';
import {api} from '../../shared/services/api';

export default function ViewGestaoProfessorGestaoProfessorListScreen() {
    const {session} = useAuth();
    const username = session?.username;

    const identidadeQuery = useQuery({
        queryKey: ['gestao-professor-identidade', username],
        queryFn: async () =>
            (
                await api.get<{ souProfessor: boolean; professorId: number | null }>('/api/professor/gestao-professor/identidade', {
                    params: {username},
                })
            ).data,
        enabled: !!username,
    });

    const souProfessor = identidadeQuery.data?.souProfessor === true && !!identidadeQuery.data?.professorId;

    if (identidadeQuery.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator/>
            </View>
        );
    }

    const tabs = [
        {key: 'gestao', label: 'Gestão', path: '/api/view/gestaoProfessor/gestaoProfessor'},
        ...(souProfessor
            ? [{
                key: 'disponibilidade',
                label: 'Disponibilidade do Professor',
                path: '/api/view/disponibilidadeProfessor/listDisponibilidadeProfessor'
            }]
            : []),
    ];

    return <ModuleTabs tabs={tabs}/>;
}

const styles = StyleSheet.create({
    center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
});