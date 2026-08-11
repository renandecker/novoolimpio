package br.com.sol7.olimpio.relatorios.tabela;
import java.util.Date;

public record TabelaRequest(String nome, Date dataCadastro, Date dataAlteracao, boolean todosUnidades, boolean todosPerfis, boolean todosUsuarios, Long estruturaId) {}
