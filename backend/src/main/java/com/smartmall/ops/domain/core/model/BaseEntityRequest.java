package com.smartmall.ops.domain.core.model;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaseEntityRequest {
    @Size(max = 36, message = "Identificador inválido.")
    private String id;

    public static BaseEntityRequest of(String id) {
        return new BaseEntityRequest(id);
    }
}
