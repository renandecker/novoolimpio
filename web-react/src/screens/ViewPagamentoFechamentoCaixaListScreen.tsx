import { PermissionGate } from '../permissions';
import { ModuleTabs } from '../ModuleTabs';

export default function ViewPagamentoFechamentoCaixaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Fechamento Caixa</h1>
        <ModuleTabs
          tabs={[
            { key: 'configuracoesImpressora', label: 'Configurações impressora', path: '/api/view/pagamento/fechamentoCaixa' },
            { key: 'movimentacaoFinanceira', label: 'Movimentação Financeira', empty: 'Conteúdo de Movimentação Financeira.' },
            { key: 'pagamentoAberto', label: 'Pagamento aberto ()', empty: 'Conteúdo de Pagamento aberto ().' },
            { key: 'verTodos', label: 'Ver Todos ()', empty: 'Conteúdo de Ver Todos ().' },
            { key: 'noCarrinho', label: 'No Carrinho', empty: 'Conteúdo de No Carrinho.' },
            { key: 'parcelado', label: 'Parcelado', empty: 'Conteúdo de Parcelado.' },
            { key: 'fechamentoCaixa', label: 'Fechamento Caixa', empty: 'Conteúdo de Fechamento Caixa.' },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
