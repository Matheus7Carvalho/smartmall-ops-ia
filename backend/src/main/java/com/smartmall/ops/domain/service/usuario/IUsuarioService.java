package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.service.IBaseService;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface IUsuarioService extends IBaseService<Usuario> {
    Optional<Usuario> buscarPorEmail(String email);

    /** Funcionários ativos, por nome. Candidatos a membros de equipe. */
    List<Usuario> funcionariosAtivos();

    Page<Usuario> filtrar(String nome, String email, Perfil perfil, Boolean ativo, Pageable pageable);

    Usuario atualizar(Usuario dados, String id, String autorId);

    void excluir(String id, String autorId);
}
