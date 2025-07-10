'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.main`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #2e3a59;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;

  input, button {
    padding: 0.75rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  input {
    flex: 1;
  }

  button {
    background-color: #2e3a59;
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;

    &:hover {
      background-color: #445577;
    }
  }
`;

const ClientList = styled.ul`
  list-style: none;
  padding: 0;

  li {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  input[type='text'] {
    flex: 1;
    padding: 0.5rem;
  }

  .id {
    font-weight: bold;
    min-width: 50px;
  }

  .delete {
    background-color: #cc3344;
    color: white;
    border: none;

    &:hover {
      background-color: #a32832;
    }
  }
`;

const SqlBlock = styled.pre`
  background: #f1f1f1;
  padding: 1rem;
  font-size: 0.9rem;
  white-space: pre-wrap;
  border-radius: 5px;
  margin-top: 1rem;
`;

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [editMap, setEditMap] = useState<{ [key: number]: string }>({});
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSql, setLastSql] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  async function fetchClientes() {
    const res = await fetch('/api/clientes');
    const data = await res.json();
    setClientes(data);

    // Inicializa o mapa de edição
    const map: { [key: number]: string } = {};
    data.forEach((c: any) => {
      map[c.cod_cliente] = c.nome;
    });
    setEditMap(map);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    const res = await fetch('/api/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    setNome('');
    await fetchClientes();
    setLoading(false);
  }

  async function handleUpdate(id: number) {
    const novoNome = editMap[id];
    if (!novoNome.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/clientes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome }),
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    await fetchClientes();
    setLoading(false);
  }

  async function handleDelete(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir este cliente?');
    if (!confirmar) return;

    setLoading(true);
    const res = await fetch(`/api/clientes/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    await fetchClientes();
    setLoading(false);
  }

  return (
    <Container>
      <Title>Gerenciar Clientes</Title>

      <Form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Nome do Cliente"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : 'Criar Cliente'}
        </button>
      </Form>

      <h2>Clientes Cadastrados</h2>
      <ClientList>
        {clientes.map((cliente) => (
          <li key={cliente.cod_cliente}>
            <div className="id">#{cliente.cod_cliente}</div>
            <input
              type="text"
              value={editMap[cliente.cod_cliente] || ''}
              onChange={(e) =>
                setEditMap((prev) => ({
                  ...prev,
                  [cliente.cod_cliente]: e.target.value,
                }))
              }
            />
            <button
              onClick={() => handleUpdate(cliente.cod_cliente)}
              disabled={loading}
            >
              Salvar
            </button>
            <button
              onClick={() => handleDelete(cliente.cod_cliente)}
              className="delete"
              disabled={loading}
            >
              Excluir
            </button>
          </li>
        ))}
      </ClientList>

      <h3>Comando SQL executado</h3>
      <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
    </Container>
  );
}
