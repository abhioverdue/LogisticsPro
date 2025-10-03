package com.logistics.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.logistics.model.User;
import com.logistics.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("DEBUG: Looking for user: " + email); // Debug line
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: User not found: " + email); // Debug line
                    return new UsernameNotFoundException("User Not Found with email: " + email);
                });

        System.out.println("DEBUG: Found user: " + user.getEmail() + ", active: " + user.isActive()); // Debug line
        
        return UserPrincipal.build(user); // Fixed spelling: UserPrincipal (not UserPrincipal)
    }
}

