'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  display: flex;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
`;

const Sidebar = styled.aside`
  width: 300px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 1rem;
  position: sticky;
  top: 2rem;
  height: fit-content;
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

const Container = styled.main`
  flex: 1;
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

const FiltrosWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  input, select {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    flex: 1;
    min-width: 150px;
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

    .edit-btn {
    background-color: #ffde59;
    color: #3b0a45;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  .delete-btn {
    background-color: #ff6b6b;
    color: white;
    border: none;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
  }

  .edit-btn:hover {
    background-color: #f0c130;
  }

  .delete-btn:hover {
    background-color: #e64444;
  }
`;

export default function ProdutosPage() {
  const [filtros, setFiltros] = useState({ nome: '', tipo: '' });
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'principal',
    preco_custo: '',
    preco_venda: '',
    cod_produto: '',
  });
  const [lastSql, setLastSql] = useState('');

  async function fetchProdutos() {
    const query = new URLSearchParams();
    if (filtros.nome) query.append('nome', filtros.nome);
    if (filtros.tipo) query.append('tipo', filtros.tipo);

    const res = await fetch(`/api/produtos?${query.toString()}`);
    const data = await res.json();
    if (data.sql) setLastSql(data.sql);
    setProdutos(data.produtos || data);
  }

  useEffect(() => {
    fetchProdutos();
  }, [filtros]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const method = form.cod_produto ? 'PUT' : 'POST';
    const endpoint = '/api/produtos';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        preco_custo: parseFloat(form.preco_custo),
        preco_venda: parseFloat(form.preco_venda),
      }),
    });

    const data = await res.json();
    if (data.sql) setLastSql(data.sql);

    setForm({ nome: '', tipo: 'principal', preco_custo: '', preco_venda: '', cod_produto: '' });
    setTimeout(fetchProdutos, 5000);
  }

  async function handleDelete(cod_produto: number) {
    const res = await fetch('/api/produtos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cod_produto }),
    });

    let data = {};
    try {
      data = await res.json();
    } catch (e) {
      console.error('Erro ao ler JSON da resposta', e);
      setLastSql('-- Erro: resposta da API vazia ou inválida.');
      return;
    }

    if ('sql' in data) setLastSql((data as any).sql);
    fetchProdutos();
  }

  return (
    <PageWrapper>
      <Sidebar>
        <h3>Comando SQL</h3>
        <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
      </Sidebar>

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

          <button type="submit">{!form.cod_produto ? 'Criar Produto' : 'Atualizar Produto'}</button>
        </Form>

        <h2>Lista de Produtos</h2>
        <FiltrosWrapper>
          <input
            placeholder="Filtrar por nome"
            value={filtros.nome}
            onChange={e => setFiltros(f => ({ ...f, nome: e.target.value }))}
          />
          <select
            value={filtros.tipo}
            onChange={e => setFiltros(f => ({ ...f, tipo: e.target.value }))}
          >
            <option value="">Todos</option>
            <option value="principal">Principal</option>
            <option value="secundario">Secundário</option>
          </select>
        </FiltrosWrapper>

        <ProductList>
          {produtos.map((p: any) => (
            <li key={p.cod_produto}>
              {p.nome} ({p.tipo}) - R$ {formatPrice(p.preco_venda)}

              <span style={{ float: 'right', display: 'flex', gap: '0.5rem' }}>
                <button
                  className="edit-btn"
                  onClick={() => setForm({
                    nome: p.nome,
                    tipo: p.tipo,
                    preco_custo: String(p.preco_custo),
                    preco_venda: String(p.preco_venda),
                    cod_produto: p.cod_produto,
                  })}
                >
                  ✏️ Editar
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(p.cod_produto)}
                >
                  🗑️ Excluir
                </button>
              </span>
            </li>
          ))}
        </ProductList>
      </Container>
    </PageWrapper>
  );
}

function formatPrice(value: any) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}
