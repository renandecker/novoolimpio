import React from 'react';
import {Text} from 'react-native';
import {ModuleList, type ModuleListActionGroup} from '../../shared/components/ModuleListScreen';
import {RowMenu} from '../../shared/components/RowMenu';

const actionGroups: ModuleListActionGroup[] = [
    {
        icon: <Text style={{fontSize: 20}}>ℹ️</Text>,
        className: 'btnyellow',
        title: 'Relatórios',
        permission: 'EXECUTE',
        items: [
            {key: 'info', label: 'Informações', className: 'btnyellow', onSelect: (item) => alert(`Informações do oferecimento #${item.id}`)},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>✏️</Text>,
        className: 'btngreen',
        title: 'Editar',
        permission: 'UPDATE',
        items: [
            {key: 'ativarReplicar', label: 'Ativar Replicação', className: 'btnblue', onSelect: (item) => alert(`Ativar replicação #${item.id}`)},
            {key: 'desativarReplicar', label: 'Desativar Replicação', className: 'btnorange', onSelect: (item) => alert(`Desativar replicação #${item.id}`)},
            {key: 'replicar', label: 'Replicar Oferecimento', className: 'btnblack', onSelect: (item) => alert(`Replicar oferecimento #${item.id}`)},
            {key: 'editar', label: 'Editar', className: 'btngreen', onSelect: (item) => alert(`Editar oferecimento #${item.id}`)},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>👁️</Text>,
        className: 'btnyellow',
        title: 'Visualizar',
        permission: 'READ',
        items: [
            {key: 'view', label: 'Visualizar', className: 'btnyellow', onSelect: (item) => alert(`Visualizar oferecimento #${item.id}`)},
        ],
    },
    {
        icon: <Text style={{fontSize: 20}}>🗑️</Text>,
        className: 'btnred',
        title: 'Remover',
        permission: 'DELETE',
        items: [
            {key: 'excluir', label: 'Excluir', className: 'btnred', onSelect: (item) => alert(`Excluir oferecimento #${item.id}`)},
        ],
    },
];

export default function ViewOferecimentoComponenteCurricularListOferecimentoComponenteCurricularListScreen() {
    return <ModuleList path="/api/view/oferecimentoComponenteCurricular/listOferecimentoComponenteCurricular" actionGroups={actionGroups}/>;
}
