package com.logistics.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Serve frontend files from classpath
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
        
        // Serve frontend files from external directory if needed
        registry.addResourceHandler("/frontend/**")
                .addResourceLocations("file:frontend/");
    }

    @Override
    public void addViewControllers(@NonNull ViewControllerRegistry registry) {
        // Default route to index.html
        registry.addViewController("/").setViewName("forward:/index.html");
    }
}

