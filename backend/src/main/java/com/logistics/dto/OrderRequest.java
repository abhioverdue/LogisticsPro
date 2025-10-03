package com.logistics.dto;

import com.logistics.model.Address;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class OrderRequest {
    @NotBlank
    private String productName;
    
    @NotBlank
    private String productCategory;
    
    @NotNull
    @Positive
    private Double weight;
    
    @NotNull
    @Positive
    private Double productValue;
    
    @NotNull
    private Address fromAddress;
    
    @NotNull
    private Address toAddress;
    
    @NotBlank
    private String courierService;
    
    @NotBlank
    private String buyerEmail;

    // Getters and Setters
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductCategory() { return productCategory; }
    public void setProductCategory(String productCategory) { this.productCategory = productCategory; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public Double getProductValue() { return productValue; }
    public void setProductValue(Double productValue) { this.productValue = productValue; }

    public Address getFromAddress() { return fromAddress; }
    public void setFromAddress(Address fromAddress) { this.fromAddress = fromAddress; }

    public Address getToAddress() { return toAddress; }
    public void setToAddress(Address toAddress) { this.toAddress = toAddress; }

    public String getCourierService() { return courierService; }
    public void setCourierService(String courierService) { this.courierService = courierService; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
}
