package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;
import java.util.Date;

public class ResponseChavePix {
    private Integer dueDateLimitDays;

    private BigDecimal value;

    private String type;

    private String id;

    private String key;

    private String status;

    private Boolean canBeDeleted;

    private String cannotBeDeletedReason;

    private QrCode qrCode;

    private Date dateCreated;

    public Integer getDueDateLimitDays() {
        return dueDateLimitDays;
    }

    public void setDueDateLimitDays(Integer dueDateLimitDays) {
        this.dueDateLimitDays = dueDateLimitDays;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getCanBeDeleted() {
        return canBeDeleted;
    }

    public void setCanBeDeleted(Boolean canBeDeleted) {
        this.canBeDeleted = canBeDeleted;
    }

    public String getCannotBeDeletedReason() {
        return cannotBeDeletedReason;
    }

    public void setCannotBeDeletedReason(String cannotBeDeletedReason) {
        this.cannotBeDeletedReason = cannotBeDeletedReason;
    }

    public QrCode getQrCode() {
        return qrCode;
    }

    public void setQrCode(QrCode qrCode) {
        this.qrCode = qrCode;
    }

    public Date getDateCreated() {
        return dateCreated;
    }

    public void setDateCreated(Date dateCreated) {
        this.dateCreated = dateCreated;
    }
}

