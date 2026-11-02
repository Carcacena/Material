CREATE INDEX idx_cp_status
ON contas_pagar(status);

CREATE INDEX idx_cp_fornecedor
ON contas_pagar(fornecedor_id);

CREATE INDEX idx_cp_vencimento
ON contas_pagar(data_vencimento);