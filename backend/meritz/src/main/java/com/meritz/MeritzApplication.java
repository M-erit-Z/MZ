package com.meritz;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MeritzApplication {

    public static void main(String[] args) {
        SpringApplication.run(MeritzApplication.class, args);
    }

}
