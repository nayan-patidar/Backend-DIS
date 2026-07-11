package com.collegeportal.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient; // <-- ADD THIS IMPORT

@SpringBootApplication
@EnableDiscoveryClient // <-- ADD THIS ANNOTATION
public class ApiGatewayApplication {

	public static void main(String[] args) {

		SpringApplication.run(ApiGatewayApplication.class, args);
		System.out.println("api gateway is runnig");
	}



}