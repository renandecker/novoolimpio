package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CurriculoCampoInformacaoRepository implements PanacheRepository<CurriculoCampoInformacao> {
}
