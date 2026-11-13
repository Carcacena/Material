package com.material;
import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

import jakarta.annotation.PostConstruct;
@SpringBootApplication 
@ComponentScan(basePackages = "com.material") // garante que tudo em br.com.jose


public class MaterialConstrucaoApplication {
	 @PostConstruct
	    public void init() {
	        // Força a aplicação Java inteira a rodar no horário de Brasília, ignorando o fuso da nuvem
	        TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
	    }
	public static void main(String[] args) {
		SpringApplication.run(MaterialConstrucaoApplication.class, args);
		  SpringApplication app;
		// Força o Spring Boot 5 a rodar estritamente na 8080, ignorando o Railway magic
       
	}
		
	
	
	

}
