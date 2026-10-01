import {useState, useCallback} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';
import {Wizard, useWizardData} from '../../../shared/components/Wizard';
import {useApi} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';
import {ProdutoSelectionModal} from '../produto/ProdutoSelectionModal';
import {Plus} from 'lucide-react';
import type {ApiItem} from '../../../shared/types/types';

const CONTRATO_COLUMNS: DataTableColumn[] = [
    {key: 'pessoaId', label: 'Pessoa'},
    {key: 'curriculoId', label: 'Curso'},
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'unidadeResponsavelId', label: 'Unidade Responsável'},
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
    {key: 'mediaFinal', label: 'Média Final'},
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
    {key: 'cobraRematricula', label: 'Cobra Rematrícula'},
];

interface MaterialItem {
    key: string;
    produtoId?: number;
    produtoDescricao?: string;
    quantidade?: number;
    valorUnitario?: number;
    obrigatorio?: boolean;
}

interface RematriculaData {
    entity: {
        contratoId?: number;
        unidadeId?: number;
        testemunha1Id?: number;
        testemunha2Id?: number;
        responsavelId?: number;
    };
    ofertasSelecionadas: any[];
    materialEscolar: MaterialItem[];
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
    const {data, updateFields, updateField} = useWizardData<RematriculaData>({
        entity: {},
        ofertasSelecionadas: [],
        materialEscolar: [],
        valores: {},
    });

    const {post: saveRematricula} = useApi(API_PATHS.basico.rematricula);

    const [produtoModalOpen, setProdutoModalOpen] = useState(false);

    const validateStep1 = async (currentData: RematriculaData) => {
        if (!currentData.entity.contratoId) return 'Selecione o contrato';
        if (!currentData.entity.unidadeId) return 'Selecione a unidade';
        if (!currentData.entity.testemunha1Id) return 'Informe a primeira testemunha';
        if (!currentData.entity.testemunha2Id) return 'Informe a segunda testemunha';
        return true;
    };

    const validateStep2 = async (currentData: RematriculaData) => {
        if (!currentData.ofertasSelecionadas || currentData.ofertasSelecionadas.length === 0) {
            return 'Selecione pelo menos um oferecimento para a rematrícula';
        }
        return true;
    };

    const validateStep4 = async (currentData: RematriculaData) => {
        if (!currentData.valores.formaPagamentoId) return 'Selecione a forma de pagamento';
        if (!currentData.valores.dataPrimeiraParcela) return 'Defina a data da primeira parcela';
        if (!currentData.valores.parcelas || currentData.valores.parcelas.length === 0) return 'Configure as parcelas';
        return true;
    };

    const handleProdutoSelecionado = useCallback((produto: ApiItem) => {
        updateField('materialEscolar', (prev: MaterialItem[]) => [
            ...(prev ?? []),
            {
                key: `mat-${Date.now()}-${(prev ?? []).length}`,
                produtoId: produto.id,
                produtoDescricao: produto.nome,
                quantidade: 1,
                valorUnitario: (produto as Record<string, unknown>).valor ? Number((produto as Record<string, unknown>).valor) : undefined,
                obrigatorio: true,
            },
        ]);
        setProdutoModalOpen(false);
    }, [updateField]);

    const handleComplete = async (formData: RematriculaData) => {
        try {
            await saveRematricula({
                ...formData.entity,
                ofertasSelecionadas: formData.ofertasSelecionadas,
                materialEscolar: formData.materialEscolar,
                valores: formData.valores,
            });
            alert('Rematrícula realizada com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao realizar rematrícula');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Rematricula</h1>
                <div className="div_form">
                    <div className="form-title">Rematrícula</div>
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
                                    label: 'Matrícula/Rematrícula',
                                    content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}/>,
                                    validate: validateStep2,
                                },
                                {
                                    key: 'tabMaterial',
                                    label: 'Material',
                                    content: (
                                        <div>
                                            <fieldset className="form-fieldset">
                                                <legend>Material Escolar da Rematrícula</legend>
                                                <div className="form-buttons" style={{marginBottom: 16, display: 'flex', gap: 8}}>
                                                    <button type="button" className="btnstop" onClick={() => setProdutoModalOpen(true)}>
                                                        <Plus className="icon" style={{marginRight: 4}}/> Selecionar Produto
                                                    </button>
                                                </div>
                                                <ProdutoSelectionModal
                                                    isOpen={produtoModalOpen}
                                                    onClose={() => setProdutoModalOpen(false)}
                                                    onSelect={handleProdutoSelecionado}
                                                />
                                                {data.materialEscolar.length > 0 ? (
                                                    <table className="data-table" style={{width: '100%'}}>
                                                        <thead>
                                                        <tr>
                                                            <th>Produto</th>
                                                            <th>Quantidade</th>
                                                            <th>Valor Unitário</th>
                                                            <th>Obrigatório</th>
                                                            <th style={{width: 50}}></th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {data.materialEscolar.map((m: MaterialItem) => (
                                                            <tr key={m.key}>
                                                                <td>{m.produtoDescricao ?? '-'}</td>
                                                                <td>{m.quantidade ?? '-'}</td>
                                                                <td>{m.valorUnitario !== undefined ? m.valorUnitario.toFixed(2) : '-'}</td>
                                                                <td>{m.obrigatorio ? 'Sim' : 'Não'}</td>
                                                                <td>
                                                                    <button type="button" className="btn-action btnred" title="Remover"
                                                                            onClick={() => updateField('materialEscolar', (prev: MaterialItem[]) => prev.filter(item => item.key !== m.key))}>−</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                ) : (
                                                    <p className="master-detail-empty">Nenhum material adicionado.</p>
                                                )}
                                            </fieldset>
                                        </div>
                                    ),
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