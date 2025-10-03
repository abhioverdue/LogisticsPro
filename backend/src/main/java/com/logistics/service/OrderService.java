package com.logistics.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.logistics.dto.OrderRequest;
import com.logistics.model.Order;
import com.logistics.model.OrderStatus;
import com.logistics.model.TrackingEvent;
import com.logistics.repository.OrderRepository;
import com.logistics.repository.UserRepository;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    // Removed unused fields:
    // @Autowired private CourierRepository courierRepository;
    // @Autowired private TrackingService trackingService;

    public Order createOrder(OrderRequest orderRequest, String sellerId) {
        Order order = new Order();
        order.setSellerId(sellerId);

        // Set product
        Order.Product product = new Order.Product();
        product.setName(orderRequest.getProductName());
        product.setCategory(orderRequest.getProductCategory());
        product.setWeight(orderRequest.getWeight());
        product.setValue(orderRequest.getProductValue());
        order.setProduct(product);

        // Set shipping
        Order.Shipping shipping = new Order.Shipping();
        shipping.setFrom(orderRequest.getFromAddress());
        shipping.setTo(orderRequest.getToAddress());
        shipping.setCourierService(orderRequest.getCourierService());
        shipping.setTrackingNumber("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        shipping.setEstimatedDelivery(LocalDateTime.now().plusDays(3));
        order.setShipping(shipping);

        // Set pricing
        Order.Pricing pricing = new Order.Pricing();
        pricing.setProductValue(orderRequest.getProductValue());
        pricing.setShippingCost(calculateShippingCost(orderRequest.getWeight())); // removed unused courierService
        pricing.setTotal(pricing.getProductValue() + pricing.getShippingCost());
        order.setPricing(pricing);

        // Set buyer
        userRepository.findByEmail(orderRequest.getBuyerEmail())
                .ifPresent(buyer -> order.setBuyerId(buyer.getId()));

        // Initial tracking event
        TrackingEvent initialEvent = new TrackingEvent("PENDING", "Order created and pending confirmation", "Seller Location");
        order.getTimeline().add(initialEvent);

        Order savedOrder = orderRepository.save(order);

        // Send confirmation email
        userRepository.findByEmail(orderRequest.getBuyerEmail())
                .ifPresent(buyer -> emailService.sendOrderConfirmationEmail(buyer.getEmail(), savedOrder));

        return savedOrder;
    }

    public Order updateOrderStatus(String orderId, OrderStatus newStatus, String location, String description, String updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        TrackingEvent event = new TrackingEvent(newStatus.toString(), description, location);
        event.setUpdatedBy(updatedBy);
        order.getTimeline().add(event);

        Order updatedOrder = orderRepository.save(order);

        userRepository.findById(order.getBuyerId())
                .ifPresent(buyer -> emailService.sendStatusUpdateEmail(buyer.getEmail(), updatedOrder, newStatus.toString()));

        return updatedOrder;
    }

    public List<Order> getOrdersByUserId(String userId, String role) {
        return switch (role.toUpperCase()) {
            case "ROLE_SELLER" -> orderRepository.findBySellerIdOrderByCreatedAtDesc(userId);
            case "ROLE_BUYER" -> orderRepository.findByBuyerIdOrderByCreatedAtDesc(userId);
            case "ROLE_COURIER" -> orderRepository.findByCourierId(userId);
            default -> List.of();
        };
    }

    public Order getOrderById(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    public Optional<Order> getOrderByTrackingNumber(String trackingNumber) {
        return orderRepository.findByShippingTrackingNumber(trackingNumber);
    }

    public Order flagOrder(String orderId, String reason, String flaggedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.FLAGGED);
        order.setUpdatedAt(LocalDateTime.now());

        TrackingEvent flagEvent = new TrackingEvent("FLAGGED", "Order flagged: " + reason, "Customer Service");
        flagEvent.setUpdatedBy(flaggedBy);
        order.getTimeline().add(flagEvent);

        return orderRepository.save(order);
    }

    private double calculateShippingCost(double weight) {
        // Simple fixed pricing, can be enhanced with courierService logic later
        double baseRate = 10.0;
        double perKgRate = 5.0;
        return baseRate + (weight * perKgRate);
    }
}
