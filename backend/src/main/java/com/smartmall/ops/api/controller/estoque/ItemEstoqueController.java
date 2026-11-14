package com.smartmall.ops.api.controller.estoque;

import com.smartmall.ops.domain.core.controller.BaseController;
import com.smartmall.ops.domain.entity.ItemEstoque;
import com.smartmall.ops.domain.model.estoque.IItemEstoqueMapper;
import com.smartmall.ops.domain.model.estoque.ItemEstoqueRequest;
import com.smartmall.ops.domain.model.estoque.ItemEstoqueResponse;
import com.smartmall.ops.domain.service.estoque.IItemEstoqueService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Consulta: todos os perfis. Cadastro, edição e exclusão: Administrador e Supervisor (SecurityConfiguration). */
@RestController
@RequestMapping(value = "/api/estoque/item", produces = "application/json")
@Tag(name = "Estoque", description = "Itens do almoxarifado: peças, ferramentas, consumíveis e EPIs.")
public class ItemEstoqueController extends BaseController<ItemEstoque, ItemEstoqueRequest, ItemEstoqueResponse> {

    protected ItemEstoqueController(final IItemEstoqueMapper mapper, final IItemEstoqueService service) {
        super(mapper, service);
    }
}
