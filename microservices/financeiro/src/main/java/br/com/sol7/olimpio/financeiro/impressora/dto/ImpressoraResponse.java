package br.com.sol7.olimpio.financeiro.impressora;
import java.util.Date;

public record ImpressoraResponse(Long id, Long unidadeId, String porta, int modelo, boolean manual, String tamanho, Date dataAlteracao) {}
