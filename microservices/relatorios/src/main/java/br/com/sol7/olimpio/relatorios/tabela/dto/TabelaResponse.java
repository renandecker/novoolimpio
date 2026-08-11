package br.com.sol7.olimpio.relatorios.tabela;
import java.util.Date;

public record TabelaResponse(Long id, String nome, Date dataCadastro, Date dataAlteracao, boolean todosUnidades, boolean todosPerfis, boolean todosUsuarios, Long estruturaId) {}
