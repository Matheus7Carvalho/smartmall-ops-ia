package com.smartmall.ops.domain.service.estoque;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.ItemEstoque;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemEstoqueService extends BaseService<ItemEstoque> implements IItemEstoqueService {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    protected ItemEstoqueService(final ItemEstoqueRepository repository, final MovimentacaoEstoqueRepository movimentacaoRepository) {
        super(repository);
        this.movimentacaoRepository = movimentacaoRepository;
    }

    @Override
    @Transactional
    public ItemEstoque create(ItemEstoque item) throws DomainException {
        normalizar(item);
        item.setSaldo(0);
        return super.create(item);
    }

    @Override
    @Transactional
    public ItemEstoque update(ItemEstoque item, String id) throws DomainException {
        normalizar(item);
        return super.update(item, id);
    }

    /** O saldo nunca vem do cadastro: só as movimentações o alteram. */
    @Override
    public void bind(ItemEstoque existente, ItemEstoque alteracao) {
        BeanUtils.copyProperties(alteracao, existente, "id", "dataCriacao", "dataAtualizacao", "saldo");
    }

    @Override
    public void validate(ItemEstoque item) throws DomainException {
        if (getRepository().existeCodigo(item.getCodigo(), item.getId())) {
            throw new DomainException("Já existe um item com o código %s.", item.getCodigo());
        }
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (movimentacaoRepository.existsByItemId(id)) {
            throw new DomainException("Item com movimentações não pode ser excluído.");
        }
        super.delete(id);
    }

    private static void normalizar(ItemEstoque item) {
        if (item.getCodigo() != null) item.setCodigo(item.getCodigo().trim().toUpperCase());
        if (item.getNome() != null) item.setNome(item.getNome().trim());
        item.setDescricao(vazioParaNulo(item.getDescricao()));
        item.setLocalizacao(vazioParaNulo(item.getLocalizacao()));
    }

    private static String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }

    @Override
    public ItemEstoqueRepository getRepository() {
        return (ItemEstoqueRepository) super.getRepository();
    }
}
