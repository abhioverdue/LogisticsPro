package com.logistics.security;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.logistics.model.User;

public class UserPrincipal implements UserDetails {
    private String id;
    private String email;
    private String name;

    @JsonIgnore
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(String id, String email, String name, String password,
                        Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.authorities = authorities;
    }

    public static UserPrincipal build(User user) {
    List<GrantedAuthority> authorities;
    
    if (user.getRoles() != null && !user.getRoles().isEmpty()) {
        authorities = user.getRoles().stream()
            .map(role -> {
                // Handle different role formats
                String roleName;
                try {
                    // Try to get ERole enum name
                    roleName = role.getName().name();
                } catch (Exception e) {
                    // Fallback: use toString or default
                    roleName = role.getName().toString();
                }
                return new SimpleGrantedAuthority(roleName);
            })
            .collect(Collectors.toList());
    } else {
        // Default role if no roles found
        authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
    }

    return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getProfile() != null ? user.getProfile().getName() : user.getEmail(),
            user.getPassword(),
            authorities);
}

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserPrincipal user = (UserPrincipal) o;
        return Objects.equals(id, user.id);
    }
}
