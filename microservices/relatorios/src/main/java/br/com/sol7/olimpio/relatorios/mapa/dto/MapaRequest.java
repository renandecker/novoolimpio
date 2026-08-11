package br.com.sol7.olimpio.relatorios.mapa;
import java.util.Date;

public record MapaRequest(String nome, boolean todosUnidades, boolean todosPerfis, boolean todosUsuarios, String zoom, String coordenada, boolean utilizando, Integer altura, Integer markerTamanho, Date dataAlteracao, Long georeferenciaId, Long dimensaoId, Long medidaId, Long estruturaId) {}
