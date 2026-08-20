package br.com.sol7.olimpio.basico.configuracaoemail.dto;

import java.util.Date;
import java.math.BigDecimal;

public record ConfiguracaoEmailResponse(Long id,String host,int port,String protocol,String username,String password,Boolean principal,String periodicidade,String googleMapsApi,BigDecimal googleMapsCota,BigDecimal googleMapsUsar,BigDecimal googleMapsUsado,boolean habilitarApi,String tipoApiEmail,Date dateCota,Integer cota,Integer usado,String tokenCorreio,String tokenSendgrip,String clientId,String clientSecret,String accessToken,String refreshToken,Integer quitwait,Integer starttls,Integer auth,Integer debug,Integer autenticated,Integer fallback){}
