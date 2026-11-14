package com.smartmall.ops.domain.core.service;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.core.exception.DomainException;
import jakarta.annotation.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.function.Function;

public interface IBaseService<T extends BaseEntity> {
    T create(T entity) throws DomainException;

    T findById(String id) throws DomainException;

    List<T> findAll(Sort sort) throws DomainException;

    List<T> findAll(@Nullable Specification<T> specification, Sort sort) throws DomainException; //TODO: Implementar lógica e controlador do especification.

    Page<T> findAll(Pageable pageable) throws DomainException;

    T update(T entity, String id) throws DomainException;

    void bind(T entity, T update);

    void delete(String id);

    void validate(T entity) throws DomainException;
}
