import React from 'react';
import {Text} from 'react-native';
import {ModuleList, type ModuleListActionGroup} from '../../shared/components/ModuleListScreen';

const actionGroups: ModuleListActionGroup[] = [
    {
        icon: <Text style={{fontSize: 20}}>ℹ️</Text>,
        className: 'btnyellow',
        title: 'Relatórios',
        permission: 'EXECUTE',
        items: [
            // onSelect recebe () => void (sem o item): RowMenu chama item.onSelect?.() sem argumentos.
            {key: 'info', label: 'Informações', className: 'btnyellow', onSelect: () => alert('Informações do oferecimento')},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>✏️</Text>,
        className: 'btngreen',
        title: 'Editar',
        permission: 'UPDATE',
        items: [
            {key: 'ativarReplicar', label: 'Ativar Replicação', className: 'btnblue', onSelect: () => alert('Ativar replicação do oferecimento')},
            {key: 'desativarReplicar', label: 'Desativar Replicação', className: 'btnorange', onSelect: () => alert('Desativar replicação do oferecimento')},
            {key: 'replicar', label: 'Replicar Oferecimento', className: 'btnblack', onSelect: () => alert('Replicar oferecimento')},
            {key: 'editar', label: 'Editar', className: 'btngreen', onSelect: () => alert('Editar oferecimento')},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>👁️</Text>,
        className: 'btnyellow',
        title: 'Visualizar',
        permission: 'READ',
        items: [
            {key: 'view', label: 'Visualizar', className: 'btnyellow', onSelect: () => alert('Visualizar oferecimento')},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>🗑️</Text>,
        className: 'btnred',
        title: 'Remover',
        permission: 'DELETE',
        items: [
            {key: 'excluir', label: 'Excluir', className: 'btnred', onSelect: () => alert('Excluir oferecimento')},
        ],
    },
];

export default function ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen() {
    return <ModuleList path="/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular" actionGroups={actionGroups}/>;
}