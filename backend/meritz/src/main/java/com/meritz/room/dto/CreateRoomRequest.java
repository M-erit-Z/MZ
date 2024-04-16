package com.meritz.room.dto;

import lombok.Data;

@Data
public class CreateRoomRequest {
    private String clientName;
    private String clientPhone;
    private String location;
}
