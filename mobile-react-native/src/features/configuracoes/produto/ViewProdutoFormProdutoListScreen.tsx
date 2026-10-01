import React from 'react';
import {ModuleList} from '../ModuleListScreen';
import type {ComboSource} from '../../shared/types/types';

const PRODUTO_COLUMNS = [
    'nome',
    'valor',
    'imagem',
    'tamanho',
    'ativo',
    'dataCadastro',
    'categoriaId',
    'marcaId',
];

const PRODUTO_COMBOS: Record<string, ComboSource> = {
    categoriaId: {path: '/api/view/categoriaEstoque/listCategoria', valueKey: 'id', labelKey: 'descricao'},
    marcaId: {path: '/api/view/marca/listMarca', valueKey: 'id', labelKey: 'descricao'},
};

export default function ViewProdutoFormProdutoListScreen() {
    return <ModuleList path="/api/view/produto/formProduto" columns={PRODUTO_COLUMNS} combos={PRODUTO_COMBOS} />;
}
