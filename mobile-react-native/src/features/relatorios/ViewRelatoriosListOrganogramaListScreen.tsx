import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ModuleList} from '../ModuleListScreen';
import type {ModuleListExtraAction} from '../ModuleListScreen';

export default function ViewRelatoriosListOrganogramaListScreen() {
    const navigation = useNavigation();

    const extraActions: ModuleListExtraAction[] = [
        {
            key: 'acessar',
            title: 'Acessar',
            icon: '▶',
            permission: 'EXECUTE',
            onPress: (item) => {
                navigation.navigate('view/relatorios/viewOrganograma' as never, {id: String(item.id)} as never);
            },
        },
        {
            key: 'configurar',
            title: 'Configurar',
            icon: '✎',
            permission: 'UPDATE',
            onPress: (item) => {
                navigation.navigate('view/relatorios/formOrganograma' as never, {id: String(item.id)} as never);
            },
        },
    ];

    return <ModuleList path="/api/view/relatorios/listOrganograma" extraActions={extraActions}/>;
}
