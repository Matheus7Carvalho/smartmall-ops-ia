package com.smartmall.ops.api.controller.chamado;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.model.chamado.AprovarChamadoRequest;
import com.smartmall.ops.domain.model.chamado.ArquivarChamadoRequest;
import com.smartmall.ops.domain.model.chamado.ChamadoResponse;
import com.smartmall.ops.domain.service.chamado.ChamadoService;
import jakarta.validation.Valid;
import java.nio.charset.StandardCharsets;
import org.springframework.data.domain.Page;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chamado")
public class ChamadoController {
    private final ChamadoService service;

    public ChamadoController(ChamadoService service) { this.service = service; }

    @GetMapping
    public Page<ChamadoResponse> listar(@RequestParam(required = false) StatusChamado status,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return service.listar(status, page, size);
    }

    @GetMapping("/{id}")
    public ChamadoResponse detalhe(@PathVariable String id) { return service.detalhe(id); }

    @GetMapping("/{id}/midia")
    public ResponseEntity<byte[]> midia(@PathVariable String id) {
        var midia = service.midia(id);
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(midia.tipo()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(midia.nome(), StandardCharsets.UTF_8).build().toString())
                .cacheControl(CacheControl.noStore()).header("X-Content-Type-Options", "nosniff")
                .body(midia.conteudo());
    }

    @PostMapping("/{id}/aprovar")
    public ChamadoResponse aprovar(@PathVariable String id, @Valid @RequestBody AprovarChamadoRequest request,
                                   @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.aprovar(id, request, usuario.getId());
    }

    @PostMapping("/{id}/arquivar")
    public ChamadoResponse arquivar(@PathVariable String id, @Valid @RequestBody ArquivarChamadoRequest request,
                                    @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.arquivar(id, request, usuario.getId());
    }
}
