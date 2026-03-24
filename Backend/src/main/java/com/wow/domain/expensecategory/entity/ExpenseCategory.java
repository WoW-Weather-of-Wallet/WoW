package com.wow.domain.expensecategory.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "expense_category")
public class ExpenseCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id", nullable = false)
    // [주의] 다른 엔티티는 Long을 사용하지만 이 필드는 Integer — DB 컬럼 타입이 INT(4바이트)로 정의되어 있어
    //   Long으로 변경하려면 DB 마이그레이션이 필요하므로 현재 타입 유지
    private Integer id;

    @Column(name = "category_name", length = 10)
    private String categoryName;

    @Column(name = "category_icon", length = 10)
    private String categoryIcon;
}
