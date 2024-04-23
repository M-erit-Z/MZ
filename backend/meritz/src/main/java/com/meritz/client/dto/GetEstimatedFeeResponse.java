package com.meritz.client.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GetEstimatedFeeResponse {
    private Integer currentFee;
    private Integer increaseFee;
    private Integer accidentAmount;
}
