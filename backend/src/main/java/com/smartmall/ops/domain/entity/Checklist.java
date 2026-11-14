package com.smartmall.ops.domain.entity;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "CHECKLIST")
public class Checklist extends BaseEntity {

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    /** Itens sempre acompanham o checklist; SUBSELECT evita N+1 na listagem paginada. */
    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Fetch(FetchMode.SUBSELECT)
    @OrderBy("ordem ASC")
    private List<ChecklistItem> itens = new ArrayList<>();

    public Checklist(String nome, List<ChecklistItem> itens) {
        this.nome = nome;
        substituirItens(itens);
    }

    /** Substitui os itens mantendo a coleção gerenciada pelo Hibernate (orphanRemoval). */
    public void substituirItens(List<ChecklistItem> novos) {
        itens.clear();
        if (novos == null) return;
        for (ChecklistItem item : novos) {
            item.setChecklist(this);
            itens.add(item);
        }
    }
}
