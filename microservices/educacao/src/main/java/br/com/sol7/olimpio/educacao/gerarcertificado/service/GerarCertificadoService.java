package br.com.sol7.olimpio.educacao.gerarcertificado;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped; import jakarta.inject.Inject; import jakarta.ws.rs.NotFoundException; import java.util.List;
import io.smallrye.mutiny.Uni;
@ApplicationScoped @WithTransaction public class GerarCertificadoService { @Inject GerarCertificadoRepository repository; public Uni<List<GerarCertificadoResponse>> list(){return repository.listAll().map(items->items.stream().map(this::toResponse).toList());}

    public Uni<PagedResponse<GerarCertificadoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }
 public Uni<GerarCertificadoResponse> find(Long id){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarCertificado not found")).map(this::toResponse);} public Uni<GerarCertificadoResponse> create(GerarCertificadoRequest r){var e=new GerarCertificado();apply(e,r);return repository.persist(e).replaceWith(()->toResponse(e));} public Uni<GerarCertificadoResponse> update(Long id,GerarCertificadoRequest r){return repository.findById(id).onItem().ifNull().failWith(()->new NotFoundException("GerarCertificado not found")).invoke(e->apply(e,r)).map(this::toResponse);} public Uni<Void> delete(Long id){return repository.deleteById(id).onItem().transformToUni(deleted->deleted?Uni.createFrom().voidItem():Uni.createFrom().failure(new NotFoundException("GerarCertificado not found")));} private void apply(GerarCertificado e,GerarCertificadoRequest r){e.nome=r.nome();e.dadosJson=r.dadosJson();} private GerarCertificadoResponse toResponse(GerarCertificado e){return new GerarCertificadoResponse(e.id,e.nome,e.dadosJson);} 

    // Migrado de GerarCertificadoController.gerarCertificado (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GerarCertificadoController.java:44, camada controller)
    // Observacao: retorno: era StreamedContent no legado
    // Logica original (adaptar):
    // public StreamedContent gerarCertificado(List<Contrato> contratos) throws MalformedURLException {
    //         HttpSession sessao = (HttpSession) FacesContext.getCurrentInstance().getExternalContext().getSession(false);
    // 
    //         File logoFile = new File(sessao.getServletContext().getRealPath(System.getProperty("file.separator") + "resources" + System.getProperty("file.separator") + "images" + System.getProperty("file.separator") + "newLogo.jpg"));
    // 
    //         List<Certificado> certificados = new ArrayList<Certificado>();
    //         for (Contrato c : contratos) {
    //             Certificado certificado = criarCertificado(c);
    //             certificado.setImagem(logoFile.getAbsolutePath());
    // 
    //             certific ...
    // // ... (truncado, ver fonte original)
    public Uni<String> gerarCertificado(List<Long> contratos) {
        // Obs: depende do microservico relatorios (geracao de relatorio Jasper/PDF)
        return Uni.createFrom().item(null);
    }


    // Migrado de GerarCertificadoController.gerarComponentes (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GerarCertificadoController.java:115, camada controller)
    // Observacao: retorno: lista de CertificadoComponenteCurricular original; parametro contratoId: era Contrato (referencia por id)
    // Logica original (adaptar):
    // public List<CertificadoComponenteCurricular> gerarComponentes(Contrato contrato) {
    //         List<CertificadoComponenteCurricular> listaComponentes = new ArrayList<CertificadoComponenteCurricular>();
    //         for (ComponenteCurricular c : matriculaService.buscarComponentesAprovadosPorAlunos(contrato.getPessoa())) {
    //             String html = c.getHabilidadeCompetencia();
    //             String habilidadesCompetencias = "";
    //             if (!ObjectUtil.nullOrEmpty(html)) {
    //                 html = html.replaceAll("<li>", "- ");
    //                 habilidadesCompetencias = Jsoup.parse(html).text().replaceAll(";", ";\n");
    //             }
    //             listaComponentes.add(new CertificadoComponenteCurricular(c.ge ...
    // // ... (truncado, ver fonte original)
    public Uni<List<String>> gerarComponentes(Long contratoId) {
        // Obs: depende do MatriculaService (buscarComponentesAprovadosPorAlunos) e da geracao de relatorio Jasper
        return Uni.createFrom().item(java.util.List.of());
    }

}