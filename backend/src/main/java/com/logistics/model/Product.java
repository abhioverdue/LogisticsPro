package com.logistics.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "products")
public class Product {
    @Id
    private String id;
    
    private String name;
    private String description;
    private String category;
    private String sku; // Stock Keeping Unit
    private double weight; // in kg
    private Dimensions dimensions;
    private double value; // product price
    private String imageUrl;
    private boolean isActive;
    private List<String> tags;
    private String sellerId;
    private ProductStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Product() {
        this.isActive = true;
        this.status = ProductStatus.AVAILABLE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Product(String name, String category, double weight, double value) {
        this();
        this.name = name;
        this.category = category;
        this.weight = weight;
        this.value = value;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { 
        this.name = name;
        this.updatedAt = LocalDateTime.now();
    }

    public String getDescription() { return description; }
    public void setDescription(String description) { 
        this.description = description;
        this.updatedAt = LocalDateTime.now();
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { 
        this.category = category;
        this.updatedAt = LocalDateTime.now();
    }

    public String getSku() { return sku; }
    public void setSku(String sku) { 
        this.sku = sku;
        this.updatedAt = LocalDateTime.now();
    }

    public double getWeight() { return weight; }
    public void setWeight(double weight) { 
        this.weight = weight;
        this.updatedAt = LocalDateTime.now();
    }

    public Dimensions getDimensions() { return dimensions; }
    public void setDimensions(Dimensions dimensions) { 
        this.dimensions = dimensions;
        this.updatedAt = LocalDateTime.now();
    }

    public double getValue() { return value; }
    public void setValue(double value) { 
        this.value = value;
        this.updatedAt = LocalDateTime.now();
    }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { 
        this.imageUrl = imageUrl;
        this.updatedAt = LocalDateTime.now();
    }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { 
        this.isActive = active;
        this.updatedAt = LocalDateTime.now();
    }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { 
        this.tags = tags;
        this.updatedAt = LocalDateTime.now();
    }

    public String getSellerId() { return sellerId; }
    public void setSellerId(String sellerId) { 
        this.sellerId = sellerId;
        this.updatedAt = LocalDateTime.now();
    }

    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Business Logic Methods
    public double calculateShippingWeight() {
        // Add packaging weight (10% of product weight, minimum 0.1kg)
        return Math.max(weight * 1.1, weight + 0.1);
    }

    public double calculateVolumetricWeight() {
        if (dimensions == null) {
            return weight;
        }
        // Standard volumetric weight calculation: (L × W × H) / 5000
        double volumetricWeight = dimensions.getVolume() / 5000.0;
        return Math.max(weight, volumetricWeight);
    }

    public boolean isFragile() {
        return category != null && (
            category.toLowerCase().contains("electronics") ||
            category.toLowerCase().contains("glass") ||
            category.toLowerCase().contains("ceramic")
        );
    }

    public boolean requiresSpecialHandling() {
        return isFragile() || weight > 20.0 || 
               (dimensions != null && dimensions.getVolume() > 100000); // 100L
    }

    @Override
    public String toString() {
        return String.format("%s (%s) - %.1fkg - $%.2f", name, category, weight, value);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Product product = (Product) o;
        return id != null && id.equals(product.id);
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }

    // Inner Classes
    public static class Dimensions {
        private double length; // in cm
        private double width;  // in cm
        private double height; // in cm

        public Dimensions() {}

        public Dimensions(double length, double width, double height) {
            this.length = length;
            this.width = width;
            this.height = height;
        }

        // Getters and Setters
        public double getLength() { return length; }
        public void setLength(double length) { this.length = Math.max(0, length); }

        public double getWidth() { return width; }
        public void setWidth(double width) { this.width = Math.max(0, width); }

        public double getHeight() { return height; }
        public void setHeight(double height) { this.height = Math.max(0, height); }

        // Business Methods
        public double getVolume() {
            return length * width * height; // in cubic cm
        }

        public double getVolumeInLiters() {
            return getVolume() / 1000.0; // convert to liters
        }

        public boolean isOversized() {
            return length > 150 || width > 150 || height > 150 || // any dimension > 150cm
                   getVolume() > 200000; // volume > 200L
        }

        public String getDimensionCategory() {
            double volume = getVolume();
            if (volume < 1000) return "SMALL";      // < 1L
            if (volume < 10000) return "MEDIUM";    // < 10L
            if (volume < 100000) return "LARGE";    // < 100L
            return "EXTRA_LARGE";                   // >= 100L
        }

        @Override
        public String toString() {
            return String.format("%.1f × %.1f × %.1f cm (%.2fL)", 
                length, width, height, getVolumeInLiters());
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;
            Dimensions that = (Dimensions) o;
            return Double.compare(that.length, length) == 0 &&
                   Double.compare(that.width, width) == 0 &&
                   Double.compare(that.height, height) == 0;
        }

        @Override
        public int hashCode() {
            int result = Double.hashCode(length);
            result = 31 * result + Double.hashCode(width);
            result = 31 * result + Double.hashCode(height);
            return result;
        }
    }

    // Enums
    public enum ProductStatus {
        AVAILABLE("Available for shipping"),
        OUT_OF_STOCK("Out of stock"),
        DISCONTINUED("Product discontinued"),
        PENDING_APPROVAL("Pending seller approval"),
        RESTRICTED("Shipping restricted");

        private final String description;

        ProductStatus(String description) {
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

    // Static Factory Methods
    public static Product createElectronicsProduct(String name, double weight, double value) {
        Product product = new Product(name, "Electronics", weight, value);
        product.setDimensions(new Dimensions(20, 15, 8)); // Default electronics dimensions
        return product;
    }

    public static Product createClothingProduct(String name, double weight, double value) {
        Product product = new Product(name, "Clothing", weight, value);
        product.setDimensions(new Dimensions(30, 25, 5)); // Default clothing dimensions
        return product;
    }

    public static Product createBookProduct(String name, double weight, double value) {
        Product product = new Product(name, "Books", weight, value);
        product.setDimensions(new Dimensions(25, 20, 3)); // Default book dimensions
        return product;
    }

    // Validation Methods
    public boolean isValid() {
        return name != null && !name.trim().isEmpty() &&
               category != null && !category.trim().isEmpty() &&
               weight > 0 &&
               value > 0;
    }

    public String getValidationMessage() {
        if (name == null || name.trim().isEmpty()) {
            return "Product name is required";
        }
        if (category == null || category.trim().isEmpty()) {
            return "Product category is required";
        }
        if (weight <= 0) {
            return "Product weight must be greater than 0";
        }
        if (value <= 0) {
            return "Product value must be greater than 0";
        }
        if (dimensions != null && dimensions.getVolume() <= 0) {
            return "Product dimensions must be valid";
        }
        return "Valid";
    }
}
