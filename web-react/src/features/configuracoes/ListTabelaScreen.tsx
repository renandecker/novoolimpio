import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {api} from '../api';
import {PermissionGate} from '../permissions';
import {DataTable, DataTableRowAction} from '../DataTable';

export default function ListTabelaScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar Relatório',
            icon: <i className="fa fa-external-link" />,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewTabela?id=${item.id}`);
            },
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Relatórios - Tabela</h1>
                <DataTable
                    path="/api/relatorios/tabela"
                    extraRowActions={extraRowActions}
                />
            </main>
        </PermissionGate>
    );
}