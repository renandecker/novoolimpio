import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {Wizard} from '../../shared/components/Wizard';

const SQL_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'tabela', label: 'Tabela'},
    {key: 'condicao', label: 'CondiÃ§Ã£o'},
    {key: 'nomeBanco', label: 'Banco'},
    {key: 'coordenada', label: 'Coordenada'},
    {key: 'zoom', label: 'Zoom'},
];

export default function ViewEstruturaFormEstruturaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Estrutura</h1>
                <div className="div_form">
                    <div className="form-title">Estrutura de RelatÃ³rio</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'sql',
                                    label: 'SQL',
                                    content: <DataTable path="/api/relatorios/estrutura" columns={SQL_COLUMNS}/>,
                                },
                                {
                                    key: 'campos',
                                    label: 'Campos',
                                    nextLabel: 'Salvar',
                                    content: <p className="master-detail-empty">DimensÃµes, tempo, medidas e
                                        georeferÃªncia da estrutura.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
