package com.smartmall.ops.api.controller.teste;

import com.smartmall.ops.domain.service.teste.LimpezaE2EService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Apoio aos testes E2E: só existe no perfil dev e só para Administrador (SecurityConfiguration).
 * Em outros perfis a rota não existe (404) e os testes recorrem a encerrar a manutenção programada.
 */
@Profile("dev")
@RestController
@RequestMapping("/api/teste")
@Tag(name = "Testes (dev)", description = "Limpeza dos dados criados pelos testes E2E. Só no perfil dev.")
public class LimpezaE2EController {

    private final LimpezaE2EService service;

    public LimpezaE2EController(LimpezaE2EService service) {
        this.service = service;
    }

    @DeleteMapping("/e2e")
    @Operation(description = "Apaga manutenções programadas e chamados com a marca do teste (ex.: E2E-AB12CD34) e suas dependências.")
    public ResponseEntity<Void> excluirMarcados(@RequestParam String marca) {
        service.excluirMarcados(marca);
        return ResponseEntity.noContent().build();
    }
}
