import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {Wizard, useWizardData} from '../../shared/components/Wizard';
import {useApi} from '../../shared/services/api';

const CONTRATO_COLUMNS: DataTableColumn[] = [
    {key: 'pessoaId', label: 'Pessoa'},
    {key: 'curriculoId', label: 'Curso'},
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'unidadeResponsavelId', label: 'Unidade ResponsÃ¡vel'},
    {key: 'valorParcelas', label: 'Valor'},
    {key: 'ativo', label: 'Ativo'},
    {key: 'data', label: 'Data'},
];

const MATRICULA_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},
    {key: 'formaPagamentoId', label: 'Forma de Pagamento'},
    {key: 'status', label: 'Status'},
    {key: 'data', label: 'Data'},
    {key: 'mediaFinal', label: 'MÃ©dia Final'},
];

const MATERIAL_COLUMNS: DataTableColumn[] = [
    {key: 'dataCompra', label: 'Data Compra'},
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'pessoaId', label: 'Pessoa'},
    {key: 'tipoFormaPagamento', label: 'Forma de Pagamento'},
    {key: 'valor', label: 'Valor'},
    {key: 'quantidade', label: 'Quantidade'},
];

const VALORES_COLUMNS: DataTableColumn[] = [
    {key: 'curriculoId', label: 'Curso'},
    {key: 'valor', label: 'Valor'},
    {key: 'juros', label: 'Juros'},
    {key: 'multa', label: 'Multa'},
    {key: 'descontoCarne', label: 'Desconto Carne'},
    {key: 'cobraRematricula', label: 'Cobra RematrÃ­cula'},
];

interface RematriculaData {
    entity: {
        contratoId?: number;
        unidadeId?: number;
        testemunha1Id?: number;
        testemunha2Id?: number;
        responsavelId?: number;
    };
    ofertasSelecionadas: any[];
    materialEscolar: any[];
    valores: {
        formaPagamentoId?: number;
        dataPrimeiraParcela?: string;
        dataParcela?: string;
        parcelas?: any[];
        taxas?: any[];
        bonificacao?: number;
    };
}

export default function ViewMatriculaFormRematriculaListScreen() {
    const {data, updateFields} = useWizardData<RematriculaData>({
        entity: {},
        ofertasSelecionadas: [],
        materialEscolar: [],
        valores: {},
    });

    const {post: saveRematricula} = useApi('/api/educacao/rematricula');

    const validateStep1 = async (currentData: RematriculaData) => {
        if (!currentData.entity.contratoId) return 'Selecione o contrato';
        if (!currentData.entity.unidadeId) return 'Selecione a unidade';
        if (!currentData.entity.testemunha1Id) return 'Informe a primeira testemunha';
        if (!currentData.entity.testemunha2Id) return 'Informe a segunda testemunha';
        return true;
    };

    const validateStep2 = async (currentData: RematriculaData) => {
        if (!currentData.ofertasSelecionadas || currentData.ofertasSelecionadas.length === 0) {
            return 'Selecione pelo menos um oferecimento para a rematrÃ­cula';
        }
        return true;
    };

    const validateStep4 = async (currentData: RematriculaData) => {
        if (!currentData.valores.formaPagamentoId) return 'Selecione a forma de pagamento';
        if (!currentData.valores.dataPrimeiraParcela) return 'Defina a data da primeira parcela';
        if (!currentData.valores.parcelas || currentData.valores.parcelas.length === 0) return 'Configure as parcelas';
        return true;
    };

    const handleComplete = async (formData: RematriculaData) => {
        try {
            await saveRematricula({
                ...formData.entity,
                ofertasSelecionadas: formData.ofertasSelecionadas,
                materialEscolar: formData.materialEscolar,
                valores: formData.valores,
            });
            alert('RematrÃ­cula realizada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao realizar rematrÃ­cula');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Rematricula</h1>
                <div className="div_form">
                    <div className="form-title">RematrÃ­cula</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'tabContrato',
                                    label: 'Contrato',
                                    content: <DataTable path="/api/educacao/contrato" columns={CONTRATO_COLUMNS}/>,
                                    validate: validateStep1,
                                },
                                {
                                    key: 'tabMatricula',
                                    label: 'MatrÃ­cula/RematrÃ­cula',
                                    content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}/>,
                                    validate: validateStep2,
                                },
                                {
                                    key: 'tabMaterial',
                                    label: 'Material',
                                    content: <DataTable path="/api/estoque/venda-produto" columns={MATERIAL_COLUMNS}/>,
                                },
                                {
                                    key: 'tabValores',
                                    label: 'Valores',
                                    nextLabel: 'Salvar',
                                    content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS}/>,
                                    validate: validateStep4,
                                },
                            ]}
                            onComplete={handleComplete}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
