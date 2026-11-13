CREATE TABLE log_sistema (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    data_hora DATETIME NOT NULL,
    usuario VARCHAR(100),
    acao VARCHAR(100) NOT NULL,
    detalhe VARCHAR(255),
    sucesso BOOLEAN NOT NULL
);