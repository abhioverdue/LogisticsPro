package com.logistics.model;

import java.time.LocalDateTime;

public class TrackingEvent {
    private String status;
    private String description;
    private String location;
    private LocalDateTime timestamp;
    private String updatedBy;

    public TrackingEvent() {
        this.timestamp = LocalDateTime.now();
    }

    public TrackingEvent(String status, String description, String location) {
        this();
        this.status = status;
        this.description = description;
        this.location = location;
    }

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getUpdatedBy() { return updatedBy; }
    public void setUpdatedBy(String updatedBy) { this.updatedBy = updatedBy; }
}
