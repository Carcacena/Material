CREATE TABLE produto_farmacia (
    produto_id BIGINT PRIMARY KEY,
    registro_ms VARCHAR(20) NOT NULL,
    principio_ativo VARCHAR(150) NOT NULL,
    tipo_tarja ENUM('MIP', 'VERMELHA', 'RETENCAO', 'PRETA') NOT NULL,
    lote VARCHAR(50) NOT NULL,
    pmc DECIMAL(10, 2),
    CONSTRAINT fk_farmacia_produto FOREIGN KEY (produto_id) REFERENCES produto(id) ON DELETE CASCADE
);