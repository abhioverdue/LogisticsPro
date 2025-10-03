package com.logistics.model;

public enum OrderStatus {
    PENDING("Order created and pending confirmation"),
    CONFIRMED("Order confirmed and ready for pickup"), 
    SHIPPED("Package has been picked up"),
    IN_TRANSIT("Package is in transit"),
    OUT_FOR_DELIVERY("Package is out for delivery"),
    DELIVERED("Package has been delivered"),
    CANCELLED("Order has been cancelled"),
    FLAGGED("Order has been flagged for issues");

    private final String description;

    OrderStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return description;
    }
}


