CREATE TABLE entrada_movimento (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    entrada_id BIGINT NOT NULL,

    status INT NOT NULL,

    tipo_movimento VARCHAR(20) NOT NULL,

    data_movimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_entrada_movimento_entrada
        FOREIGN KEY (entrada_id)
        REFERENCES entrada(id)
);