import {useState} from 'react';
import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import type {DataTableColumn, ComboSource} from '../../../shared/components/DataTable';
import type {AutoCompleteOption} from '../../../shared/components/AutoComplete';

const PRODUTO_COLUMNS: DataTableColumn[] = [
    {key: 'nome', label: 'Nome'},
    {key: 'valor', label: 'Valor'},
    {key: 'imagem', label: 'Imagem'},
    {key: 'tamanho', label: 'Tamanho'},
    {key: 'ativo', label: 'Ativo'},
    {key: 'dataCadastro', label: 'Data Cadastro'},
    {key: 'categoriaId', label: 'Categoria'},
    {key: 'marcaId', label: 'Marca'},
];

const PRODUTO_COMBOS: Record<string, ComboSource> = {
    categoriaId: {path: '/api/view/categoriaEstoque/listCategoria', valueKey: 'id', labelKey: 'descricao'},
    marcaId: {path: '/api/view/marca/listMarca', valueKey: 'id', labelKey: 'descricao'},
};

export default function ViewProdutoFormProdutoListScreen() {
    const [unidade, setUnidade] = useState<AutoCompleteOption | null>(null);
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Produto</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'informacoesBasicas',
                            label: 'Informações básicas',
                            path: '/api/view/produto/formProduto',
                            columns: PRODUTO_COLUMNS,
                            combos: PRODUTO_COMBOS,
                        },
                        {
                            key: 'unidades',
                            label: 'Unidade',
                            unidadeCombo: {
                                label: 'Unidade',
                                value: unidade,
                                onChange: setUnidade,
                            }
                        },
                        {key: 'fornecedores', label: 'Fornecedores', empty: 'Conteúdo de Fornecedores.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
