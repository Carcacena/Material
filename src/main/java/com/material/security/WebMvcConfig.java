package com.material.security;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders(
                        "Authorization",
                        "Content-Type",
                        "Accept",
                        "X-Requested-With",
                        "Cache-Control"
                )
                .allowCredentials(false)
                .maxAge(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/")
                .setViewName("forward:/login.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String base =
                System.getenv("RAILWAY_VOLUME_MOUNT_PATH") != null
                        ? System.getenv("RAILWAY_VOLUME_MOUNT_PATH")
                        : "target/classes/static";

        registry.addResourceHandler("/imagem_introducao/**")
                .addResourceLocations(
                        "file:" + base + "/imagem_introducao/"
                );
    }
}