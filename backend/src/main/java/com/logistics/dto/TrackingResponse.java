package com.logistics.dto;

import com.logistics.model.Order;
import com.logistics.model.TrackingEvent;

import java.time.LocalDateTime;
import java.util.List;

public class TrackingResponse {
    private String orderNumber;
    private String status;
    private String trackingNumber;
    private ProductInfo product;
    private ShippingInfo shipping;
    private PricingInfo pricing;
    private List<TrackingEvent> timeline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TrackingResponse(Order order) {
        this.orderNumber = order.getOrderNumber();
        this.status = order.getStatus().toString();
        this.trackingNumber = order.getShipping().getTrackingNumber();
        this.product = new ProductInfo(order.getProduct());
        this.shipping = new ShippingInfo(order.getShipping());
        this.pricing = new PricingInfo(order.getPricing());
        this.timeline = order.getTimeline();
        this.createdAt = order.getCreatedAt();
        this.updatedAt = order.getUpdatedAt();
    }

    // Getters
    public String getOrderNumber() { return orderNumber; }
    public String getStatus() { return status; }
    public String getTrackingNumber() { return trackingNumber; }
    public ProductInfo getProduct() { return product; }
    public ShippingInfo getShipping() { return shipping; }
    public PricingInfo getPricing() { return pricing; }
    public List<TrackingEvent> getTimeline() { return timeline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static class ProductInfo {
        private String name;
        private String category;
        private double weight;
        private double value;

        public ProductInfo(Order.Product product) {
            this.name = product.getName();
            this.category = product.getCategory();
            this.weight = product.getWeight();
            this.value = product.getValue();
        }

        // Getters
        public String getName() { return name; }
        public String getCategory() { return category; }
        public double getWeight() { return weight; }
        public double getValue() { return value; }
    }

    public static class ShippingInfo {
        private String courierService;
        private LocalDateTime estimatedDelivery;

        public ShippingInfo(Order.Shipping shipping) {
            this.courierService = shipping.getCourierService();
            this.estimatedDelivery = shipping.getEstimatedDelivery();
        }

        // Getters
        public String getCourierService() { return courierService; }
        public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
    }

    public static class PricingInfo {
        private double productValue;
        private double shippingCost;
        private double total;

        public PricingInfo(Order.Pricing pricing) {
            this.productValue = pricing.getProductValue();
            this.shippingCost = pricing.getShippingCost();
            this.total = pricing.getTotal();
        }

        // Getters
        public double getProductValue() { return productValue; }
        public double getShippingCost() { return shippingCost; }
        public double getTotal() { return total; }
    }
}
