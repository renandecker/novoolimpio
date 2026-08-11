package br.com.sol7.olimpio.asaas.dto;

import br.com.sol7.olimpio.asaas.enumm.AsaasWebHookEvent;

public class WebHook {
    private AsaasWebHookEvent event;
    private WebHookPayment payment;

    public AsaasWebHookEvent getEvent() {
        return event;
    }

    public void setEvent(AsaasWebHookEvent event) {
        this.event = event;
    }

    public WebHookPayment getPayment() {
        return payment;
    }

    public void setPayment(WebHookPayment payment) {
        this.payment = payment;
    }
}

