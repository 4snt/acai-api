'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Sidebar = styled.aside`
  width: 300px;
  flex-shrink: 0;
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 1rem;
  border-radius: 6px;
  height: fit-content;
  position: sticky;
  top: 2rem;

  h3 {
    margin-bottom: 0.75rem;
    font-size: 1.1rem;
    color: #2e3a59;
  }
`;

const SqlBlock = styled.pre`
  background: #f1f1f1;
  padding: 1rem;
  font-size: 0.9rem;
  white-space: pre-wrap;
  border-radius: 5px;
  max-height: 400px;
  overflow-y: auto;
`;

const MainContent = styled.main`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2e3a59;
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

const Filters = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  input, select {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    flex: 1;
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
    justify-content: space-between;
  }

  .info {
    flex: 1;
  }

  .actions {
    display: flex;
    gap: 0.5rem;

    button {
      width: 2rem;
      height: 2rem;
      font-size: 1.2rem;
      padding: 0;
      border-radius: 6px;
      background: #ddd;
      border: none;
      cursor: pointer;

      &:hover {
        background: #bbb;
      }
    }
  }
`;

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [form, setForm] = useState({ cod_produto: '', tipo: 'estoque', quantidade: '' });
  const [filtros, setFiltros] = useState({ nome: '', tipo: '' });
  const [lastSql, setLastSql] = useState('');
  const [preserveSql, setPreserveSql] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProdutos();
  }, []);

  useEffect(() => {
    fetchEstoque();
  }, [filtros]);

  async function fetchEstoque() {
    const query = new URLSearchParams();
    if (filtros.nome) query.append('nome', filtros.nome);
    if (filtros.tipo) query.append('tipo', filtros.tipo);

    const res = await fetch(`/api/estoque?${query.toString()}`);
    const data = await res.json();

    if (!preserveSql && data.sql) setLastSql(data.sql);
    setPreserveSql(false);
    setEstoque(data.produtos || data);
  }

  async function fetchProdutos() {
    const res = await fetch('/api/produtos');
    const data = await res.json();
    setProdutos(Array.isArray(data) ? data : data.produtos ?? []);
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
      setLastSql(data.sql || '-- Sem SQL retornado.');
      setPreserveSql(true);
    } catch {
      setLastSql('-- Erro no servidor');
    }

    setForm({ cod_produto: '', tipo: 'estoque', quantidade: '' });
    await fetchEstoque();
    setLoading(false);
  }

  async function excluirEstoque(cod_estoque: number) {
    if (!confirm('Tem certeza que deseja excluir este item de estoque?')) return;

    const res = await fetch('/api/estoque', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cod_estoque }),
    });

    try {
      const data = await res.json();
      setLastSql(data.sql || '-- Sem SQL retornado.');
      setPreserveSql(true);
    } catch {
      setLastSql('-- Erro ao excluir');
    }

    await fetchEstoque();
  }

  async function alterarQuantidade(item: any, delta: number) {
    setLoading(true);

    const res = await fetch('/api/estoque', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod_produto: item.cod_produto,
        tipo: item.tipo_estoque,
        quantidade: delta,
      }),
    });

    try {
      const data = await res.json();
      setLastSql(data.sql || '-- Sem SQL retornado.');
      setPreserveSql(true);
    } catch {
      setLastSql('-- Erro ao alterar quantidade');
    }

    await fetchEstoque();
    setLoading(false);
  }

  return (
    <Wrapper>
      <Sidebar>
        <h3>Comando SQL</h3>
        <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
      </Sidebar>

      <MainContent>
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
            {loading ? 'Salvando...' : 'Adicionar'}
          </button>
        </Form>

        <h2>Filtros</h2>
        <Filters>
          <input
            placeholder="Filtrar por nome"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
          />
          <select
            value={filtros.tipo}
            onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
          >
            <option value="">Todos os tipos</option>
            <option value="estoque">Estoque</option>
            <option value="freezer">Freezer</option>
          </select>
        </Filters>

        <h2>Estoque Atual</h2>
        <StockList>
          {estoque.map(item => (
            <li key={item.cod_estoque}>
              <div className="info">
                {item.nome} ({item.tipo}) - {item.tipo_estoque}: {parseFloat(item.quantidade).toFixed(2)}
              </div>
              <div className="actions">
                {/* <button onClick={() => alterarQuantidade(item, -1)} disabled={loading}>➖</button>
                <button onClick={() => alterarQuantidade(item, +1)} disabled={loading}>➕</button> */}
                <button onClick={() => excluirEstoque(item.cod_estoque)} disabled={loading}>🗑️</button>
              </div>
            </li>
          ))}
        </StockList>
      </MainContent>
    </Wrapper>
  );
}
