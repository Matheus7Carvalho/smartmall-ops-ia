package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "EQUIPE")
public class Equipe extends BaseEntity {

    @Column(name = "NOME", nullable = false, length = 60)
    private String nome;

    /** Funcionários que podem executar as tarefas atribuídas à equipe. */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "EQUIPE_MEMBRO",
            joinColumns = @JoinColumn(name = "EQUIPE_ID"),
            inverseJoinColumns = @JoinColumn(name = "USUARIO_ID"))
    @OrderBy("nome ASC")
    private List<Usuario> membros = new ArrayList<>();

    public Equipe(String nome, List<Usuario> membros) {
        this.nome = nome;
        this.membros = new ArrayList<>(membros);
    }
}
