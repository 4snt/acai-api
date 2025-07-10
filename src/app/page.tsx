'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import styled from 'styled-components';
import 'swagger-ui-react/swagger-ui.css';

const Container = styled.main`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #3b0a45;
`;

const SwaggerWrapper = styled.div`
  min-height: 600px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
`;

const SqlBlock = styled.pre`
  background: #eee;
  padding: 1rem;
  font-size: 0.9rem;
  white-space: pre-wrap;
  border-radius: 8px;
  margin-top: 2rem;
  overflow-x: auto;
`;

const Button = styled.button`
  background-color: #3b0a45;
  color: white;
  font-weight: 700;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  margin-bottom: 2rem;

  &:hover:not(:disabled) {
    background-color: #5a0d65;
  }

  &:disabled {
    background-color: #7a537d;
    cursor: not-allowed;
  }
`;

const SqlScript = `CREATE TABLE Cliente (
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
`;

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function SwaggerPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreateTables() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/create-tables', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Tabelas criadas com sucesso!');
      } else {
        setMessage(data.error || 'Erro ao criar tabelas');
      }
    } catch {
      setMessage('Erro ao criar tabelas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <Title>Documentação Swagger</Title>
      <SwaggerWrapper>
        <SwaggerUI url="/swagger.json" />
      </SwaggerWrapper>

      <Button onClick={handleCreateTables} disabled={loading}>
        {loading ? 'Criando tabelas...' : 'Criar Tabelas no Banco'}
      </Button>

      {message && <p>{message}</p>}

      <Title>Script SQL para criação das tabelas</Title>
      <SqlBlock>{SqlScript}</SqlBlock>

      <Title>Visualização do Diagrama</Title>
      <p>
        Use o Adminer (<a href="http://localhost:8080" target="_blank" rel="noopener noreferrer">http://localhost:8080</a>) para explorar as tabelas e relacionamentos.<br />
        Para diagramas ER completos, utilize ferramentas como MySQL Workbench ou DBeaver que conectam ao seu banco e geram os diagramas automaticamente.
      </p>
    </Container>
  );
}
