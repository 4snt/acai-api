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

const StockList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 5px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  input[type='number'] {
    width: 80px;
    padding: 0.4rem;
  }

  button {
    padding: 0.4rem 0.75rem;
  }
`;

const SqlBlock = styled.pre`
  background: #eee;
  padding: 1rem;
  font-size: 0.9rem;
  white-space: pre-wrap;
  border-radius: 5px;
  margin-top: 1rem;
`;

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [form, setForm] = useState({ cod_produto: '', tipo: 'estoque', quantidade: '' });
  const [loading, setLoading] = useState(false);
  const [lastSql, setLastSql] = useState('');

  useEffect(() => {
    fetchEstoque();
    fetchProdutos();
  }, []);

  async function fetchEstoque() {
    const res = await fetch('/api/estoque');
    const data = await res.json();
    setEstoque(data);
  }

  async function fetchProdutos() {
    const res = await fetch('/api/produtos');
    const data = await res.json();
    setProdutos(data);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.cod_produto || !form.tipo || !form.quantidade) return;

    setLoading(true);

    const res = await fetch('/api/estoque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod_produto: Number(form.cod_produto),
        tipo: form.tipo,
        quantidade: Number(form.quantidade),
      }),
    });

    try {
      const data = await res.json();
      setLastSql(data.sql || '-- Operação realizada, mas sem SQL retornado.');
    } catch (e) {
      setLastSql('-- Erro: resposta inválida do servidor');
    }

    setForm({ cod_produto: '', tipo: 'estoque', quantidade: '' });

    await fetchEstoque();
    setLoading(false);
  }

  async function handleUpdate(cod_estoque: number, novaQuantidade: number) {
    const item = estoque.find(e => e.cod_estoque === cod_estoque);
    if (!item) return;

    const diff = novaQuantidade - item.quantidade;
    if (diff === 0) return;

    setLoading(true);

    const res = await fetch('/api/estoque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod_produto: item.cod_produto,
        tipo: item.tipo_estoque,
        quantidade: diff,
      }),
    });

    try {
      const data = await res.json();
      setLastSql(data.sql || '-- Atualização feita, mas sem SQL retornado.');
    } catch (e) {
      setLastSql('-- Erro: resposta inválida do servidor');
    }

    await fetchEstoque();
    setLoading(false);
  }

  return (
    <Container>
      <Title>Gerenciar Estoque</Title>

      <Form onSubmit={handleCreate}>
        <select
          value={form.cod_produto}
          onChange={e => setForm(f => ({ ...f, cod_produto: e.target.value }))}
          required
        >
          <option value="">Selecione o Produto</option>
          {produtos.map(p => (
            <option key={p.cod_produto} value={p.cod_produto}>
              {p.nome} ({p.tipo})
            </option>
          ))}
        </select>

        <select
          value={form.tipo}
          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
          required
        >
          <option value="estoque">Estoque</option>
          <option value="freezer">Freezer</option>
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Quantidade"
          value={form.quantidade}
          onChange={e => setForm(f => ({ ...f, quantidade: e.target.value }))}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Adicionar ou Atualizar'}
        </button>
      </Form>

      <h2>Estoque Atual</h2>
      <StockList>
        {estoque.map(item => (
          <li key={item.cod_estoque}>
            <div style={{ flex: 1 }}>
              {item.nome} ({item.tipo}) - {item.tipo_estoque}
            </div>
            <input
              type="number"
              step="0.01"
              value={item.quantidade}
              onChange={e => {
                const novaQtd = Number(e.target.value);
                setEstoque(curr =>
                  curr.map(i =>
                    i.cod_estoque === item.cod_estoque ? { ...i, quantidade: novaQtd } : i
                  )
                );
              }}
            />
            <button onClick={() => handleUpdate(item.cod_estoque, item.quantidade)}>
              Salvar
            </button>
          </li>
        ))}
      </StockList>

      <h3>Comando SQL executado</h3>
      <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
    </Container>
  );
}
