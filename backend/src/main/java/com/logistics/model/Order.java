package com.logistics.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    
    private String orderNumber;
    private String sellerId;
    private String buyerId;
    private String courierId;
    private Product product;
    private Shipping shipping;
    private OrderStatus status;
    private List<TrackingEvent> timeline;
    private Pricing pricing;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Order() {
        this.orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        this.status = OrderStatus.PENDING;
        this.timeline = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { this.sellerId = sellerId; }

    public String getBuyerId() { return buyerId; }
    public void setBuyerId(String buyerId) { this.buyerId = buyerId; }

    public String getCourierId() { return courierId; }
    public void setCourierId(String courierId) { this.courierId = courierId; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Shipping getShipping() { return shipping; }
    public void setShipping(Shipping shipping) { this.shipping = shipping; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public List<TrackingEvent> getTimeline() { return timeline; }
    public void setTimeline(List<TrackingEvent> timeline) { this.timeline = timeline; }

    public Pricing getPricing() { return pricing; }
    public void setPricing(Pricing pricing) { this.pricing = pricing; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static class Product {
        private String name;
        private String category;
        private double weight;
        private Dimensions dimensions;
        private double value;

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }

        public Dimensions getDimensions() { return dimensions; }
        public void setDimensions(Dimensions dimensions) { this.dimensions = dimensions; }

        public double getValue() { return value; }
        public void setValue(double value) { this.value = value; }
    }

    public static class Dimensions {
        private double length;
        private double width;
        private double height;

        // Getters and Setters
        public double getLength() { return length; }
        public void setLength(double length) { this.length = length; }

        public double getWidth() { return width; }
        public void setWidth(double width) { this.width = width; }

        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = height; }
    }

    public static class Shipping {
        private Address from;
        private Address to;
        private String courierService;
        private String trackingNumber;
        private LocalDateTime estimatedDelivery;

        // Getters and Setters
        public Address getFrom() { return from; }
        public void setFrom(Address from) { this.from = from; }

        public Address getTo() { return to; }
        public void setTo(Address to) { this.to = to; }

        public String getCourierService() { return courierService; }
        public void setCourierService(String courierService) { this.courierService = courierService; }

        public String getTrackingNumber() { return trackingNumber; }
        public void setTrackingNumber(String trackingNumber) { this.trackingNumber = trackingNumber; }

        public LocalDateTime getEstimatedDelivery() { return estimatedDelivery; }
        public void setEstimatedDelivery(LocalDateTime estimatedDelivery) { this.estimatedDelivery = estimatedDelivery; }
    }

    public static class Pricing {
        private double productValue;
        private double shippingCost;
        private double total;

        // Getters and Setters
        public double getProductValue() { return productValue; }
        public void setProductValue(double productValue) { this.productValue = productValue; }

        public double getShippingCost() { return shippingCost; }
        public void setShippingCost(double shippingCost) { this.shippingCost = shippingCost; }

        public double getTotal() { return total; }
        public void setTotal(double total) { this.total = total; }
    }
}


