package com.logistics.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.logistics.dto.JwtResponse;
import com.logistics.dto.LoginRequest;
import com.logistics.dto.MessageResponse;
import com.logistics.dto.SignupRequest;
import com.logistics.model.ERole;
import com.logistics.model.Role;
import com.logistics.model.User;
import com.logistics.repository.RoleRepository;
import com.logistics.repository.UserRepository;
import com.logistics.security.JwtUtils;
import com.logistics.security.UserPrincipal;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public ResponseEntity<?> authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    public ResponseEntity<?> registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user account
        User user = new User(signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null) {
            Role userRole = roleRepository.findByName(ERole.ROLE_BUYER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "seller":
                        Role sellerRole = roleRepository.findByName(ERole.ROLE_SELLER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(sellerRole);
                        break;
                    case "courier":
                        Role courierRole = roleRepository.findByName(ERole.ROLE_COURIER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(courierRole);
                        break;
                    default:
                        Role buyerRole = roleRepository.findByName(ERole.ROLE_BUYER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(buyerRole);
                }
            });
        }

        user.setRoles(roles);
        
        // Set profile information
        User.Profile profile = new User.Profile();
        profile.setName(signUpRequest.getName());
        profile.setPhone(signUpRequest.getPhone());
        profile.setCompany(signUpRequest.getCompany());
        user.setProfile(profile);
        
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
