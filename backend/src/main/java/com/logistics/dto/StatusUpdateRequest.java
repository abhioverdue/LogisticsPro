package com.logistics.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateRequest {
    @NotBlank
    private String status;
    
    private String location;
    
    @NotBlank
    private String description;

    // Getters and Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
