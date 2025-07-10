-- ======================
-- INSERTS
-- ======================

INSERT INTO Cliente (nome)
VALUES ('João da Silva');

INSERT INTO Funcionario (nome)
VALUES ('Maria Souza');

INSERT INTO Produto (nome, tipo, preco_custo, preco_venda)
VALUES ('Açaí 1L', 'principal', 10.00, 15.00);

INSERT INTO Estoque (cod_produto, tipo, quantidade)
VALUES (1, 'estoque', 100.00);

INSERT INTO Venda (data, hora, valor_total, cod_cliente, cod_funcionario)
VALUES ('2025-07-10', '15:30:00', 30.00, 1, 1);

INSERT INTO Venda_Produto (cod_venda, cod_produto, quantidade, preco_vendido)
VALUES (1, 1, 2.00, 15.00);

-- ======================
-- SELECTS
-- ======================

SELECT * FROM Cliente;

SELECT * FROM Funcionario;

SELECT * FROM Produto;

SELECT * FROM Estoque;

SELECT * FROM Venda;

SELECT * FROM Venda_Produto;
