package br.com.sol7.olimpio.educacao.gerirnap;
import java.util.Date;

public record GerirNapResponse(Long id, Date data, long qtdEmails, long qtdCartas, long qtdLigacoes, long qtdPresente, long qtdAusente, long qtdAtestado, long qtdMeiaPresenca, long qtdSemRegistro, long qtdCancelado, long qtdTrocaTurma, long qtdProrrogado, long qtdDesistente, long qtdAtrasado) {}
