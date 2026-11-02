CREATE TABLE entrada_impostos (

    id INT AUTO_INCREMENT PRIMARY KEY,

    entrada_id BIGINT NOT NULL UNIQUE,

    -- Mesmo cadastro de fornecedor/parceiro pode atuar como transportadora
    transportadora_id BIGINT NULL,

    -- Modalidade do frete:
    -- FOB       = comprador assume o frete
    -- CIF       = fornecedor assume o frete
    -- SEM_FRETE = retirada / sem transporte cobrado
    tipo_frete VARCHAR(20) NULL,

    base_calculo_icms DECIMAL(12,2),

    valor_icms DECIMAL(12,2),

    base_calculo_icms_st DECIMAL(12,2),

    valor_icms_st DECIMAL(12,2),

    valor_total_produtos DECIMAL(12,2),

    valor_frete DECIMAL(12,2),

    valor_seguro DECIMAL(12,2),

    valor_desconto DECIMAL(12,2),

    outras_despesas_acessorias DECIMAL(12,2),

    valor_ipi DECIMAL(12,2),

    valor_total_nota DECIMAL(12,2),


    -- Uma entrada possui um único bloco de impostos
    CONSTRAINT fk_entrada_impostos_entrada
        FOREIGN KEY (entrada_id)
        REFERENCES entrada(id),


    -- Transportadora utiliza a própria tabela fornecedor
    CONSTRAINT fk_entrada_impostos_transportadora
        FOREIGN KEY (transportadora_id)
        REFERENCES fornecedor(id)

);