CREATE TABLE contas_pagar (

    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    numero_entrada VARCHAR(20) NOT NULL,

    fornecedor_id BIGINT NOT NULL,

    numero_nota_fiscal INT NOT NULL,

    serie VARCHAR(10) NOT NULL,

    numero_parcela INT NOT NULL DEFAULT 1,

    total_parcelas INT NOT NULL DEFAULT 1,

    valor_parcela DECIMAL(15,2) NOT NULL,

    valor_pago DECIMAL(15,2)
        NOT NULL DEFAULT 0.00,

    inpc_anual_aplicado DECIMAL(5,2)
        NOT NULL DEFAULT 0.00,

    data_vencimento DATE NOT NULL,

    data_pagamento TIMESTAMP
        NULL DEFAULT NULL,

    data_lancamento TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    forma_pagamento VARCHAR(30) NOT NULL,

    status INT NOT NULL DEFAULT 1,

    data_cancelamento TIMESTAMP
        NULL DEFAULT NULL,

    motivo_cancelamento VARCHAR(255)
        NULL,

    CONSTRAINT fk_contas_pagar_fornecedor
        FOREIGN KEY (fornecedor_id)
        REFERENCES fornecedor(id),

    CONSTRAINT uk_contas_pagar_titulo
        UNIQUE (
            numero_nota_fiscal,
            serie,
            fornecedor_id,
            numero_parcela
        ),

    CONSTRAINT chk_cp_numero_parcela
        CHECK (numero_parcela >= 1),

    CONSTRAINT chk_cp_total_parcelas
        CHECK (total_parcelas >= 1),

    CONSTRAINT chk_cp_valor_parcela
        CHECK (valor_parcela >= 0),

    CONSTRAINT chk_cp_valor_pago
        CHECK (valor_pago >= 0)

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_0900_ai_ci;