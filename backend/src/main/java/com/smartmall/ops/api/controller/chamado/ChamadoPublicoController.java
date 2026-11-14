package com.smartmall.ops.api.controller.chamado;

import com.smartmall.ops.domain.model.chamado.ChamadoPublicoRequest;
import com.smartmall.ops.domain.model.chamado.ChamadoPublicoResponse;
import com.smartmall.ops.domain.model.chamado.LocalQrResponse;
import com.smartmall.ops.domain.service.chamado.ChamadoService;
import jakarta.validation.Valid;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/publico")
public class ChamadoPublicoController {
    private final ChamadoService service;

    public ChamadoPublicoController(ChamadoService service) { this.service = service; }

    @GetMapping("/local/{codigo}")
    public LocalQrResponse local(@PathVariable String codigo) { return service.local(codigo); }

    @PostMapping(value = "/chamado", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ChamadoPublicoResponse registrar(@Valid @RequestPart("dados") ChamadoPublicoRequest dados,
                                             @RequestPart(value = "midia", required = false) MultipartFile midia) throws IOException {
        return service.registrar(dados, midia == null ? null : midia.getOriginalFilename(),
                midia == null ? null : midia.getBytes());
    }
}
