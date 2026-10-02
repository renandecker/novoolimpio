package br.com.sol7.olimpio.financeiro.movimentacaofinanceira.entity;

public enum TipoPagamento {

    DINHEIRO("Dinheiro"),
    CHEQUE("Cheque"),
    CARTAO("Cartão"),
    BOLETO("Boleto"),
    PIX("Pix"),
    TRANFERENCIA("Transferência"),
    DEPOSITO("Depósito");

    private final String label;

    TipoPagamento(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
