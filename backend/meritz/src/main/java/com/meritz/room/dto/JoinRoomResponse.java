package com.meritz.room.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class JoinRoomResponse {
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private LocalDateTime createTime;
    private String location;
    private String chatRecord;
}
