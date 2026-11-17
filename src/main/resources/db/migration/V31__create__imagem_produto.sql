CREATE TABLE imagem_produto (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    produto_id BIGINT NOT NULL UNIQUE,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_url VARCHAR(500) NOT NULL,
    data_cadastro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_imagem_produto 
        FOREIGN KEY (produto_id) 
        REFERENCES produto(id) 
        ON DELETE CASCADE
);