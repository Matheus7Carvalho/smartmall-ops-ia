package com.smartmall.ops.domain.model.tarefa;

import com.smartmall.ops.domain.entity.enums.Perfil;

/** Usuário que executa uma ação na tarefa. O domínio não depende da classe de sessão da camada web. */
public record Ator(String id, Perfil perfil) {

    /** Administrador e Supervisor: avaliam, cancelam e veem todas as tarefas. */
    public boolean gestao() {
        return perfil == Perfil.ADMINISTRADOR || perfil == Perfil.SUPERVISOR;
    }
}
