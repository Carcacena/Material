CREATE TABLE imagem_introducao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(150),
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho VARCHAR(500) NOT NULL,
    data_cadastro DATETIME NOT NULL
);