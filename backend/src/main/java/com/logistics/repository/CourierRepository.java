package com.logistics.repository;

import com.logistics.model.Courier;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourierRepository extends MongoRepository<Courier, String> {
    List<Courier> findByIsActiveTrue();
    List<Courier> findByServiceTypeAndIsActiveTrue(String serviceType);
}
