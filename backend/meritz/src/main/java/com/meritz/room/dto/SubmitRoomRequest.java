package com.meritz.room.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class SubmitRoomRequest {
    private Long roomId;
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private LocalDateTime occurTime;
    private String location;
    private String content;
    private String chatting;
}
