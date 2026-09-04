import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ReactNode} from 'react';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'usuario_login', label: 'Usuário'},
    {key: 'usuario_pessoa_telefone', label: 'Telefone'},
    {key: 'usuario_pessoa_email', label: 'E-mail'},
    {key: 'usuario_pessoa_pessoaFisica_nome', label: 'Nome'},
    {key: 'usuario_pessoa_pessoaFisica_cpf', label: 'CPF'},
    {key: 'usuario_pessoa_pessoaFisica_rg', label: 'RG'},
    {key: 'usuario_pessoa_pessoaFisica_dataNascimento', label: 'Data Nasc.', render: (item): ReactNode => {
        const date = (item as Record<string, unknown>).usuario_pessoa_pessoaFisica_dataNascimento;
        if (!date) return '';
        try {
            const d = new Date(date as string);
            return d.toLocaleDateString('pt-BR');
        } catch {
            return String(date);
        }
    }},
];

export default function ViewConsultorListConsultorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Consultor</h1>
                <DataTable path="/api/view/consultor/listConsultor" columns={COLUMNS} maxMainColumns={COLUMNS.length}
                           editNavigateTo="/view/consultor/formConsultor"
                           createNavigateTo="/view/consultor/formConsultor"/>
            </main>
        </PermissionGate>
    );
}