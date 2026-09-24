package br.com.sol7.olimpio.basico.configuracaoemail.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "bas_email")
public class ConfiguracaoEmail extends PanacheEntity {

    @Column(name = "host")
    public String host;
    @Column(name = "port")
    public int port;
    @Column(name = "protocol")
    public String protocol;
    @Column(name = "username")
    public String username;
    @Column(name = "password")
    public String password;
    @Column(name = "fl_principal")
    public Boolean principal;
    @Column(name = "periodicidade")
    public String periodicidade;
    @Column(name = "google_maps_api")
    public String googleMapsApi;
    @Column(name = "google_maps_cota_total")
    public BigDecimal googleMapsCota;
    @Column(name = "google_maps_cota_usar")
    public BigDecimal googleMapsUsar;
    @Column(name = "google_maps_cota_usada")
    public BigDecimal googleMapsUsado;
    @Column(name = "fl_api_email")
    public boolean habilitarApi;
    @Column(name = "tipo_api")
    public String tipoApiEmail;
    @Column(name = "data_atualizacao")
    public Date dateCota;
    @Column(name = "cota")
    public Integer cota;
    @Column(name = "usado")
    public Integer usado;
    @Column(name = "token_correio")
    public String tokenCorreio;
    @Column(name = "token_sendgrip")
    public String tokenSendgrip;
    @Column(name = "client_id")
    public String clientId;
    @Column(name = "client_secret")
    public String clientSecret;
    @Column(name = "access_token")
    public String accessToken;
    @Column(name = "refrsh_token")
    public String refreshToken;
    @Column(name = "quitwait")
    public Integer quitwait;
    @Column(name = "starttls")
    public Integer starttls;
    @Column(name = "auth")
    public Integer auth;
    @Column(name = "debug")
    public Integer debug;
    @Column(name = "autenticated")
    public Integer autenticated;
    @Column(name = "fallback")
    public Integer fallback;
    @Column(name = "tls")
    public Boolean tls;
    @Column(name = "ssl")
    public Boolean ssl;
    @Column(name = "auto")
    public Boolean auto;
}
