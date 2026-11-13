CREATE TABLE carrinho_movimento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    carrinho_id BIGINT NOT NULL, -- 🔄 Ajustado para bater com a FK abaixo (Seu REDEFINES do COBOL)
    status INT NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL,
    data_movimento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Vínculo correto apontando a coluna declarada para a tabela mestre carrinho
    CONSTRAINT fk_carrinho_movimento_carrinho
        FOREIGN KEY (carrinho_id)
        REFERENCES carrinho(id)
);