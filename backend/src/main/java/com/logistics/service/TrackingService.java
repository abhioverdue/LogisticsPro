package com.logistics.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logistics.model.Order;
import com.logistics.model.TrackingEvent;
import com.logistics.repository.OrderRepository;

@Service
public class TrackingService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Adds a tracking event to an order.
     *
     * @param orderId     The order ID
     * @param status      Status of the order
     * @param description Description of the event
     * @param location    Location of the event
     * @param updatedBy   Who updated the event
     */
    public void addTrackingEvent(String orderId, String status, String description, String location, String updatedBy) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();

            TrackingEvent event = new TrackingEvent(status, description, location);
            event.setUpdatedBy(updatedBy);
            event.setTimestamp(LocalDateTime.now());

            // Add latest event at the beginning
            order.getTimeline().add(0, event);
            order.setUpdatedAt(LocalDateTime.now());

            orderRepository.save(order);
        }
    }

    /**
     * Retrieve an order by its tracking number.
     *
     * @param trackingNumber The tracking number
     * @return Optional<Order>
     */
    public Optional<Order> getOrderByTrackingNumber(String trackingNumber) {
        return orderRepository.findByShippingTrackingNumber(trackingNumber);
    }

    /**
     * Updates the location of a package.
     *
     * @param orderId      The order ID
     * @param latitude     Latitude (not stored currently)
     * @param longitude    Longitude (not stored currently)
     * @param locationName Location name
     */
    public void updateLocation(String orderId, double latitude, double longitude, String locationName) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();

            TrackingEvent locationEvent = new TrackingEvent(
                "LOCATION_UPDATE",
                "Package location updated",
                locationName
            );

            order.getTimeline().add(0, locationEvent);
            order.setUpdatedAt(LocalDateTime.now());

            orderRepository.save(order);
        }
    }
}

