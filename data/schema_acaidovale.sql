SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS Venda_ProdutoSecundario;
DROP TABLE IF EXISTS Venda_ProdutoPrincipal;
DROP TABLE IF EXISTS Venda;
DROP TABLE IF EXISTS Funcionario;
DROP TABLE IF EXISTS Cliente;
DROP TABLE IF EXISTS EstoqueProdutoSecundario;
DROP TABLE IF EXISTS EstoqueProdutoPrincipal;
DROP TABLE IF EXISTS ProdutoSecundario;
DROP TABLE IF EXISTS ProdutoPrincipal;
DROP TABLE IF EXISTS Freezer_Produto;
DROP TABLE IF EXISTS Freezer;

SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE Cliente (
    cod_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE Funcionario (
    cod_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE Produto (
    cod_produto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('principal', 'secundario') NOT NULL,
    preco_custo DECIMAL(10,2),
    preco_venda DECIMAL(10,2)
);

CREATE TABLE Estoque (
    cod_estoque INT PRIMARY KEY AUTO_INCREMENT,
    cod_produto INT NOT NULL,
    tipo ENUM('estoque', 'freezer') NOT NULL,
    quantidade DECIMAL(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (cod_produto) REFERENCES Produto(cod_produto)
);

CREATE TABLE Venda (
    cod_venda INT PRIMARY KEY AUTO_INCREMENT,
    data DATE NOT NULL,
    hora TIME NOT NULL,
    valor_total DECIMAL(10,2),
    cod_cliente INT NOT NULL,
    cod_funcionario INT NOT NULL,
    FOREIGN KEY (cod_cliente) REFERENCES Cliente(cod_cliente),
    FOREIGN KEY (cod_funcionario) REFERENCES Funcionario(cod_funcionario)
);

CREATE TABLE Venda_Produto (
    cod_venda INT,
    cod_produto INT,
    quantidade DECIMAL(10,2),
    preco_vendido DECIMAL(10,2),
    PRIMARY KEY (cod_venda, cod_produto),
    FOREIGN KEY (cod_venda) REFERENCES Venda(cod_venda),
    FOREIGN KEY (cod_produto) REFERENCES Produto(cod_produto)
);
