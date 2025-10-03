package com.logistics.controller;

import com.logistics.model.Courier;
import com.logistics.repository.CourierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/couriers")
public class CourierController {

    @Autowired
    private CourierRepository courierRepository;

    @GetMapping
    public ResponseEntity<List<Courier>> getAllCouriers() {
        List<Courier> couriers = courierRepository.findByIsActiveTrue();
        return ResponseEntity.ok(couriers);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourier(@PathVariable String id) {
        return courierRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/quote")
    public ResponseEntity<?> getShippingQuote(@RequestBody QuoteRequest quoteRequest) {
        // Implementation for shipping quote calculation
        return ResponseEntity.ok().build();
    }

    public static class QuoteRequest {
        private String fromCity;
        private String toCity;
        private double weight;
        private String serviceType;

        // Getters and setters
        public String getFromCity() { return fromCity; }
        public void setFromCity(String fromCity) { this.fromCity = fromCity; }

        public String getToCity() { return toCity; }
        public void setToCity(String toCity) { this.toCity = toCity; }

        public double getWeight() { return weight; }
        public void setWeight(double weight) { this.weight = weight; }

        public String getServiceType() { return serviceType; }
        public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    }
}
