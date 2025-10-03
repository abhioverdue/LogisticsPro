package com.logistics.controller;

import com.logistics.dto.MessageResponse;
import com.logistics.dto.TrackingResponse;
import com.logistics.model.Order;
import com.logistics.service.TrackingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    @Autowired
    private TrackingService trackingService;

    @GetMapping("/public/{trackingNumber}")
    public ResponseEntity<?> trackOrder(@PathVariable String trackingNumber) {
        try {
            Optional<Order> orderOpt = trackingService.getOrderByTrackingNumber(trackingNumber);
            
            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                TrackingResponse response = new TrackingResponse(order);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}/timeline")
    public ResponseEntity<?> getOrderTimeline(@PathVariable String orderId) {
        // Implementation for getting detailed timeline
        return ResponseEntity.ok().build();
    }
}
