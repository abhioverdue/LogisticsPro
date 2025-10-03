package com.logistics.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.logistics.dto.LoginRequest;
import com.logistics.dto.SignupRequest;
import com.logistics.service.AuthService;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return authService.authenticateUser(loginRequest);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return authService.registerUser(signUpRequest);
    }
    
    // Temporary endpoint to generate BCrypt hashes
    @PostMapping("/generate-hash")
    public ResponseEntity<?> generateHash(@RequestBody Map<String, String> request) {
        String plainPassword = request.get("password");
        String hash = passwordEncoder.encode(plainPassword);
        
        Map<String, Object> response = new HashMap<>();
        response.put("plainPassword", plainPassword);
        response.put("bcryptHash", hash);
        response.put("hashLength", hash.length());
        response.put("hashPrefix", hash.substring(0, 7));
        
        return ResponseEntity.ok(response);
    }
}

