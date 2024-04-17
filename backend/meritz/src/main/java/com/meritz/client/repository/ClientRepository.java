package com.meritz.client.repository;

import com.meritz.client.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByClientNameAndAndClientPhone(String clientName, String clientPhone);
}
