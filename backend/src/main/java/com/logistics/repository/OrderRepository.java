package com.logistics.repository;

import com.logistics.model.Order;
import com.logistics.model.OrderStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByShippingTrackingNumber(String trackingNumber);
    List<Order> findBySellerId(String sellerId);
    List<Order> findByBuyerId(String buyerId);
    List<Order> findByCourierId(String courierId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId);
    List<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId);
}
