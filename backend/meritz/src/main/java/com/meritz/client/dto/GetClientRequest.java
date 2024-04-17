package com.meritz.client.dto;

import lombok.Data;

@Data
public class GetClientRequest {
    private String clientName;
    private String clientPhone;
}
