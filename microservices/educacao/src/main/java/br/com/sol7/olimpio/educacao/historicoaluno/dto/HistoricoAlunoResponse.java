package br.com.sol7.olimpio.educacao.historicoaluno;
import java.util.Date;

public record HistoricoAlunoResponse(Long id, String descricao, Long usuarioId, Long alunoId, Date dataRegistro) {}
