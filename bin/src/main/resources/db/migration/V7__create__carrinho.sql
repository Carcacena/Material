CREATE TABLE carrinho ( 
    id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    numero_pedido VARCHAR(20) NOT NULL, -- O coração do controle de cupons isolados! 
    cliente_id BIGINT NOT NULL, 
    produto_id BIGINT NOT NULL, 
    quantidade DECIMAL(10,3) NOT NULL, 
    preco_praticado DECIMAL(10,2) NOT NULL, 
    status INT NOT NULL DEFAULT 0,      -- 0 = Standby/Em montagem, 1 = Faturado/Ativo, 2 = Devolvido
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    
    -- 🌟 AS DUAS JOIAS DA COROA: Sequenciadores integrados direto no mestre da venda!
    numero_nota_fiscal INT NULL,        -- Armazena o número oficial (Ex: 1973)
    serie VARCHAR(10) NULL,             -- Armazena a série oficial (Ex: UN)

    CONSTRAINT fk_carrinho_cliente FOREIGN KEY (cliente_id) REFERENCES cliente(id), 
    CONSTRAINT fk_carrinho_produto FOREIGN KEY (produto_id) REFERENCES produto(id) 
);