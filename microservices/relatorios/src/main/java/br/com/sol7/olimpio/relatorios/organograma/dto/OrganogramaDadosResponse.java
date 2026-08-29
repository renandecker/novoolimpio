package br.com.sol7.olimpio.relatorios.organograma;

import java.util.List;
import java.util.Map;

/**
 * Resultado da execução, em tempo real (sem persistir), do SQL cadastrado no organograma.
 * "colunas" traz os nomes de colunas originais devolvidos pelo banco (para depuração/telas de apoio).
 * "nos" traz cada linha já normalizada para as chaves esperadas pelo AG Charts Org Chart
 * (id, parentId, name, job, department, location, status, avatar, cor), preservando também
 * quaisquer colunas extras que o SQL do usuário tenha retornado.
 */
public record OrganogramaDadosResponse(
        Long id,
        String nome,
        String direcao,
        List<String> colunas,
        List<Map<String, Object>> nos
) {
}
