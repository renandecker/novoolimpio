import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ModuleList} from '../ModuleListScreen';
import type {ModuleListExtraAction} from '../ModuleListScreen';

export default function ViewRelatoriosListTabelaListScreen() {
    const navigation = useNavigation();

    const extraActions: ModuleListExtraAction[] = [
        {
            key: 'acessar',
            title: 'Acessar',
            icon: '▶',
            permission: 'EXECUTE',
            onPress: (item) => {
                navigation.navigate('view/relatorios/viewTabela' as never, {id: String(item.id)} as never);
            },
        },
    ];

    return <ModuleList path="/api/view/relatorios/listTabela" extraActions={extraActions}/>;
}
