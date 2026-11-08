-- 1. Cria o cabeçalho ligado ao Fornecedor
-- =========================================================================
-- 🛠️ 1. CRIAÇÃO DA TABELA DE ENTRADA (CABEÇALHO ATUALIZADO)
-- =========================================================================
CREATE TABLE entrada (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_nota VARCHAR(20) NOT NULL,
    serie VARCHAR(5),
    chave_acesso VARCHAR(44) NOT NULL,
    data_recebimento DATE NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    status INT NOT NULL DEFAULT 1, -- 🌟 1 = Entrou no Estoque / 2 = Devolvido
    CONSTRAINT fk_entrada_fornecedor FOREIGN KEY (fornecedor_id) REFERENCES fornecedor(id)
)