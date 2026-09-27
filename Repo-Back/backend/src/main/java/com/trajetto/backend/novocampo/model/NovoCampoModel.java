package com.trajetto.backend.novocampo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
// TROCAR (opcional): só se trocou o nome da tabela no SQL. Os dois precisam ser iguais.
@Table(name = "companhia")
public class NovoCampoModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;
}
