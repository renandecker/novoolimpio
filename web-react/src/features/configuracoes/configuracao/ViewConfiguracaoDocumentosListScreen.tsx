import {DataTable} from '../../../shared/components/DataTable';

const DOCUMENTOS_COLUMNS = [
    {key: 'nome', label: 'Nome'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'tipoRelatorio', label: 'Tipo de Relatório'},
    {key: 'ativo', label: 'Ativo'},
];

function ViewConfiguracaoDocumentosListScreen() {
    return (
        <div className="data-table">
            <DataTable path="/api/view/configuracao/documentos" columns={DOCUMENTOS_COLUMNS}/>
        </div>
    );
}

export default ViewConfiguracaoDocumentosListScreen;