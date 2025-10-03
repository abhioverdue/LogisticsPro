package com.logistics.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.logistics.dto.MessageResponse;
import com.logistics.dto.OrderRequest;
import com.logistics.dto.StatusUpdateRequest;
import com.logistics.model.Order;
import com.logistics.model.OrderStatus;
import com.logistics.security.UserPrincipal;
import com.logistics.service.OrderService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Create a new order (SELLER only)
    @PostMapping
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<?> createOrder(@Valid @RequestBody OrderRequest orderRequest,
                                         Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            Order order = orderService.createOrder(orderRequest, userPrincipal.getId());
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Get orders for the current authenticated user
    @GetMapping
    public ResponseEntity<List<Order>> getUserOrders(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        String role = userPrincipal.getAuthorities().iterator().next().getAuthority();

        List<Order> orders = orderService.getOrdersByUserId(userPrincipal.getId(), role);
        return ResponseEntity.ok(orders);
    }

    // Get a specific order by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrder(@PathVariable String id) {
        try {
            // Authorization can be added here if needed
            Order order = orderService.getOrderById(id);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Update order status (COURIER or SELLER only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COURIER') or hasRole('SELLER')")
    public ResponseEntity<?> updateOrderStatus(@PathVariable String id,
                                               @Valid @RequestBody StatusUpdateRequest request,
                                               Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            Order updatedOrder = orderService.updateOrderStatus(
                    id,
                    OrderStatus.valueOf(request.getStatus()),
                    request.getLocation(),
                    request.getDescription(),
                    userPrincipal.getName()
            );

            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    // Flag an order for issues (BUYER only)
    @PostMapping("/{id}/flag")
    @PreAuthorize("hasRole('BUYER')")
    public ResponseEntity<?> flagOrder(@PathVariable String id,
                                       @RequestParam String reason,
                                       Authentication authentication) {
        try {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();

            Order flaggedOrder = orderService.flagOrder(id, reason, userPrincipal.getName());
            return ResponseEntity.ok(flaggedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
