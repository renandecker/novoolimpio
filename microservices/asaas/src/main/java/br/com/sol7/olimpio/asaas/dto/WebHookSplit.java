package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;

public class WebHookSplit {
    private String walletId;

    private BigDecimal fixedValue;

    private String status;

    private String refusalReason;

    public String getWalletId() {
        return walletId;
    }

    public void setWalletId(String walletId) {
        this.walletId = walletId;
    }

    public BigDecimal getFixedValue() {
        return fixedValue;
    }

    public void setFixedValue(BigDecimal fixedValue) {
        this.fixedValue = fixedValue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRefusalReason() {
        return refusalReason;
    }

    public void setRefusalReason(String refusalReason) {
        this.refusalReason = refusalReason;
    }
}

