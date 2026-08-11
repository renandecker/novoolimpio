package br.com.sol7.olimpio.educacao.historicoaluno;
import java.util.Date;

public record HistoricoAlunoRequest(String descricao, Long usuarioId, Long alunoId, Date dataRegistro) {}
