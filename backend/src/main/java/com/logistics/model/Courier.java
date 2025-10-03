package com.logistics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "couriers")
public class Courier {
    @Id
    private String id;
    
    private String name;
    private String serviceType;
    private Pricing pricing;
    private List<String> coverage;
    private int avgDeliveryTime; // in hours
    private double rating;
    private boolean isActive;

    public Courier() {
        this.isActive = true;
        this.rating = 4.0;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }

    public Pricing getPricing() { return pricing; }
    public void setPricing(Pricing pricing) { this.pricing = pricing; }

    public List<String> getCoverage() { return coverage; }
    public void setCoverage(List<String> coverage) { this.coverage = coverage; }

    public int getAvgDeliveryTime() { return avgDeliveryTime; }
    public void setAvgDeliveryTime(int avgDeliveryTime) { this.avgDeliveryTime = avgDeliveryTime; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public static class Pricing {
        private double baseRate;
        private double perKgRate;
        private double expressMultiplier;

        // Getters and Setters
        public double getBaseRate() { return baseRate; }
        public void setBaseRate(double baseRate) { this.baseRate = baseRate; }

        public double getPerKgRate() { return perKgRate; }
        public void setPerKgRate(double perKgRate) { this.perKgRate = perKgRate; }

        public double getExpressMultiplier() { return expressMultiplier; }
        public void setExpressMultiplier(double expressMultiplier) { this.expressMultiplier = expressMultiplier; }
    }
}
