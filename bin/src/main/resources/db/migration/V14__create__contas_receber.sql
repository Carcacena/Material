CREATE TABLE contas_receber (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Identificação da venda
    numero_pedido VARCHAR(20) NOT NULL,
    cliente_id BIGINT NOT NULL,
    numero_nota_fiscal INT NOT NULL,
    serie VARCHAR(10) NOT NULL,

    -- Parcelamento
    numero_parcela INT NOT NULL DEFAULT 1,
    total_parcelas INT NOT NULL DEFAULT 1,

    -- Financeiro
    valor_parcela DECIMAL(15,2) NOT NULL,
    valor_pago DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    inpc_anual_aplicado DECIMAL(5,2) NOT NULL DEFAULT 0.00,

    -- Datas (Ajustadas para o padrão robusto do MySQL 8)
    data_vencimento DATE NOT NULL,
    data_pagamento TIMESTAMP NULL DEFAULT NULL,
    data_lancamento TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Forma de pagamento
    forma_pagamento VARCHAR(30) NOT NULL,

    -- Cartão
    cartao_bandeira VARCHAR(20) NULL,
    cartao_final VARCHAR(4) NULL,
    cartao_autorizacao VARCHAR(50) NULL,
    cartao_nsu VARCHAR(50) NULL,

    -- PIX
    chave_pix VARCHAR(100) NULL,

    -- Histórico
    status INT NOT NULL DEFAULT 1, 
    -- 1 = ATIVO
    -- 2 = DEVOLVIDO

    data_devolucao TIMESTAMP NULL DEFAULT NULL,
    motivo_devolucao VARCHAR(255) NULL,

    -- Restrições de Chave e Unicidade
    CONSTRAINT fk_contas_receber_cliente
        FOREIGN KEY (cliente_id)
        REFERENCES cliente(id),

    CONSTRAINT uk_contas_receber_titulo
        UNIQUE (
            numero_nota_fiscal,
            serie,
            cliente_id,
            numero_parcela
        ),

    -- Validações (Campos não podem ser negativos)
    CONSTRAINT chk_cr_numero_parcela
        CHECK (numero_parcela >= 1),

    CONSTRAINT chk_cr_total_parcelas
        CHECK (total_parcelas >= 1),

    CONSTRAINT chk_cr_valor_parcela
        CHECK (valor_parcela >= 0),

    CONSTRAINT chk_cr_valor_pago
        CHECK (valor_pago >= 0)

   
     
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;




