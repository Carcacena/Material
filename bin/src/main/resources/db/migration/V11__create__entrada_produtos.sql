-- 2. Cria a tabela de junção ligada à Entrada e ao Produto
CREATE TABLE entrada_produtos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entrada_id BIGINT NOT NULL,
    produto_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    preco_custo DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_entrada_produtos_entrada FOREIGN KEY (entrada_id) REFERENCES entrada(id),
    CONSTRAINT fk_entrada_produtos_produto FOREIGN KEY (produto_id) REFERENCES produto(id)
);