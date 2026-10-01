package br.com.sol7.olimpio.schedule.educacao.oferecimentocomponentecurricular.service;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class OferecimentoComponenteCurricularService {

    public Uni<Integer> replicarOferecimento(Long id) {
        // Implementacao minim: retorna 0 (nao replicado)
        return Uni.createFrom().item(0);
    }
}