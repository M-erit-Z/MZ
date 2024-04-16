package com.meritz.client.dto;

import lombok.Data;

@Data
public class ClientSignUpRequest {
    private String clientName;
    private String clientPhone;
    private String clientEmail;
}
