package com.meritz.room.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TerminateRoomResponse {
    private String msg;
    private Long clientId;
}
