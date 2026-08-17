package br.com.sol7.olimpio.relatorios.tabela.dto;
import java.util.Date;
import java.util.List;

public record TabelaRequest(String nome, Date dataCadastro, Date dataAlteracao, boolean todosUnidades, boolean todosPerfis, boolean todosUsuarios, Long estruturaId, List<TabelaColunaRequest> colunas) {}
