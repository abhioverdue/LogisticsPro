package com.logistics.service;

import com.logistics.model.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Async
    public void sendOrderConfirmationEmail(String toEmail, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Order Confirmation - " + order.getOrderNumber());
        
        String text = String.format(
            "Dear Customer,\n\n" +
            "Your order has been confirmed!\n\n" +
            "Order Number: %s\n" +
            "Product: %s\n" +
            "Tracking Number: %s\n" +
            "Estimated Delivery: %s\n" +
            "Total Amount: $%.2f\n\n" +
            "You can track your order using the tracking number above.\n\n" +
            "Thank you for choosing our logistics service!\n\n" +
            "Best regards,\n" +
            "Logistics Management Team",
            order.getOrderNumber(),
            order.getProduct().getName(),
            order.getShipping().getTrackingNumber(),
            order.getShipping().getEstimatedDelivery(),
            order.getPricing().getTotal()
        );
        
        message.setText(text);
        mailSender.send(message);
    }

    @Async
    public void sendStatusUpdateEmail(String toEmail, Order order, String newStatus) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("Order Status Update - " + order.getOrderNumber());
        
        String text = String.format(
            "Dear Customer,\n\n" +
            "Your order status has been updated!\n\n" +
            "Order Number: %s\n" +
            "New Status: %s\n" +
            "Tracking Number: %s\n\n" +
            "You can track your order for real-time updates.\n\n" +
            "Best regards,\n" +
            "Logistics Management Team",
            order.getOrderNumber(),
            newStatus,
            order.getShipping().getTrackingNumber()
        );
        
        message.setText(text);
        mailSender.send(message);
    }
}
