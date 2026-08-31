import React from 'react';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Currículo'},
    {key: 'nome', label: 'Nome do Currículo'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'dataCriacao', label: 'Data Criação'},
];

export default function ViewCurriculoListCurriculoListScreen() {
    return (
        <DataTable
            path="/api/curriculo/list"
            columns={COLUMNS}
            maxMainColumns={COLUMNS.length}
        />
    );
}