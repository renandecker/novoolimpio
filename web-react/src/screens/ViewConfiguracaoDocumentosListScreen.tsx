import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {DataTable, type DataTableProps} from '../DataTable';
import type {ApiItem} from '../types';
import {useModulePaged} from '../useModulePaged';

const DOCUMENTOS_COLUMNS = [
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'tipoRelatorio', label: 'Tipo de Relatório'},
    {key: 'ativo', label: 'Ativo'},
];

interface DocumentoItem {
    id: number;
    nome: string;
    descricao: string | null;
    tipoRelatorio: string | null;
    ativo: boolean;
    arquivoNome: string | null;
}

function ViewConfiguracaoDocumentosListScreen() {
    const {data, isLoading, isError} = useModulePaged<DocumentoItem>('/api/view/configuracao/documentos', 1, 10);
    const items = data?.content ?? [];
    const totalElements = data?.totalElements ?? 0;

    if (isLoading) return <div>Carregando...</div>;
    if (isError) return <div>Erro ao carregar documentos.</div>;
    if (items.length === 0) return <div>Nenhum documento configurado.</div>;

    return (
        <div className="data-table">
            <DataTable
                columns={DOCUMENTOS_COLUMNS}
                items={items}
                path="/api/view/configuracao/documentos"
            />
        </div>
    );
}

export default ViewConfiguracaoDocumentosListScreen;