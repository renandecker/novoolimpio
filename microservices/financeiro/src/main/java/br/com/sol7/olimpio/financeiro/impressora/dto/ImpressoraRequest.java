package br.com.sol7.olimpio.financeiro.impressora;
import java.util.Date;

public record ImpressoraRequest(Long unidadeId, String porta, int modelo, boolean manual, String tamanho, Date dataAlteracao) {}
