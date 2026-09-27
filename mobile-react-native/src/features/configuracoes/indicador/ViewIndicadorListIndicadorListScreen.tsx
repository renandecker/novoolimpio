import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ModuleList} from '../../ModuleListScreen';
import {INDICADOR_LIST_SOURCE} from '../meta/metaDinamica';
import type {ApiItem} from '../../../shared/types/types';

export default function ViewIndicadorListIndicadorListScreen() {
    const navigation = useNavigation();

    return (
        <ModuleList
            path={INDICADOR_LIST_SOURCE}
            title="Indicador"
            createNavigateTo="view/indicador/formIndicador"
            // A exclusão de um indicador remove em cascata suas metas e metas dinâmicas.
            hideDelete
            extraActions={[
                {
                    key: 'editar',
                    title: 'Editar',
                    icon: 'pencil',
                    permission: 'UPDATE',
                    onPress: (item: ApiItem) =>
                        navigation.navigate('view/indicador/formIndicador' as never, {id: String(item.id)} as never),
                },
                {
                    key: 'metas',
                    title: 'Metas',
                    permission: 'UPDATE',
                    onPress: (item: ApiItem) =>
                        navigation.navigate('view/meta/formMetaDinamica' as never, {indicadorId: String(item.id)} as never),
                },
            ]}
        />
    );
}
