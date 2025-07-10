'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.main`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #3b0a45;
`;

const Form = styled.form`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;

  input, select, button {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  input, select {
    flex: 1;
    min-width: 150px;
  }

  button {
    background-color: #3b0a45;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background-color: #5a0d65;
    }
  }
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
  }
`;

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'principal',
    preco_custo: '',
    preco_venda: '',
  });

  useEffect(() => {
    fetch('/api/produtos')
      .then(res => res.json())
      .then(data => setProdutos(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: form.nome,
        tipo: form.tipo,
        preco_custo: parseFloat(form.preco_custo),
        preco_venda: parseFloat(form.preco_venda),
      }),
    });

    setForm({ nome: '', tipo: 'principal', preco_custo: '', preco_venda: '' });

    const updated = await fetch('/api/produtos').then(res => res.json());
    setProdutos(updated);
  }

  return (
    <Container>
      <Title>Gerenciar Produtos</Title>
      <Form onSubmit={handleSubmit}>
        <select
          value={form.tipo}
          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
        >
          <option value="principal">Produto Principal</option>
          <option value="secundario">Produto Secundário</option>
        </select>

        <input
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preço Custo"
          value={form.preco_custo}
          onChange={e => setForm(f => ({ ...f, preco_custo: e.target.value }))}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Preço Venda"
          value={form.preco_venda}
          onChange={e => setForm(f => ({ ...f, preco_venda: e.target.value }))}
          required
        />

        <button type="submit">Criar Produto</button>
      </Form>

      <h2>Lista de Produtos</h2>
      <ProductList>
        {produtos.map((p: any) => (
          <li key={p.cod_produto}>
            {p.nome} ({p.tipo}) - R$ {formatPrice(p.preco_venda)}
          </li>
        ))}
      </ProductList>
    </Container>
  );
}

function formatPrice(value: any) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}
