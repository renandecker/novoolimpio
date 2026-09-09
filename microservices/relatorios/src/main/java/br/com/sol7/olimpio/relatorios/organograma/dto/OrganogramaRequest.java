package br.com.sol7.olimpio.relatorios.organograma.dto;
import br.com.sol7.olimpio.relatorios.tabela.entity.Tabela;

import java.util.Date;

/**
 * direcao: HORIZONTAL, VERTICAL ou TOGGLE_REVERSE (ver AgOrganizationSeries.direction/reverse).
 * sql: consulta livre cadastrada pelo usuário, executada em tempo real (sem gravar o resultado)
 *      para montar os nós do organograma. Ex.:
 *      select id, parentId, name, job, department, location, status, avatar from <Tabela> where <condição>
 */
public record OrganogramaRequest(String nome, String direcao, String sql, Date dataCadastro, Date dataAlteracao) {
}
