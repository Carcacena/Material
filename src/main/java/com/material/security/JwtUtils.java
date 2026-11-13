package com.material.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    @PostConstruct
    public void debug() {
        System.out.println("SECRET=" + jwtSecret);
        System.out.println("EXP=" + jwtExpirationMs);
    }
}