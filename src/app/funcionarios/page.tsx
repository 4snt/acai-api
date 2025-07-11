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

const Filters = styled.div`
  margin-bottom: 2rem;
  input {
    padding: 0.5rem;
    width: 100%;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;

  li {
    background: #f8f9fa;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 0.75rem 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }

  input[type='text'] {
    flex: 1;
    padding: 0.5rem;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  .id {
    font-weight: bold;
    min-width: 40px;
    color: #666;
  }

  .btn {
    padding: 0.4rem 0.8rem;
    border-radius: 5px;
    font-weight: bold;
    font-size: 0.9rem;
    border: none;
    cursor: pointer;
  }

  .save {
    background-color: #2e3a59;
    color: white;

    &:hover {
      background-color: #3d4e77;
    }
  }

  .delete {
    background-color: #cc3344;
    color: white;

    &:hover {
      background-color: #a32832;
    }
  }
`;

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [editMap, setEditMap] = useState<{ [key: number]: string }>({});
  const [nome, setNome] = useState('');
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSql, setLastSql] = useState('');

  useEffect(() => {
    fetchFuncionarios();
  }, [filtro]);

  async function fetchFuncionarios() {
    const res = await fetch(`/api/funcionarios?nome=${encodeURIComponent(filtro)}`);
    const json = await res.json();

    const data = json.data || json;
    setFuncionarios(data);
    setLastSql(json.sql || '-- SELECT executado, mas sem SQL retornado.');

    const map: { [key: number]: string } = {};
    data.forEach((f: any) => {
      map[f.cod_funcionario] = f.nome;
    });
    setEditMap(map);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;

    setLoading(true);
    const res = await fetch('/api/funcionarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome }),
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    setNome('');
    await fetchFuncionarios();
    setLoading(false);
  }

  async function handleUpdate(id: number) {
    const novoNome = editMap[id];
    if (!novoNome.trim()) return;

    setLoading(true);
    const res = await fetch(`/api/funcionarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome: novoNome }),
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    await fetchFuncionarios();
    setLoading(false);
  }

  async function handleDelete(id: number) {
    const confirmar = confirm('Deseja excluir este funcionário?');
    if (!confirmar) return;

    setLoading(true);
    const res = await fetch(`/api/funcionarios/${id}`, { method: 'DELETE' });

    const data = await res.json();
    setLastSql(data.sql || '-- Sem SQL retornado');
    await fetchFuncionarios();
    setLoading(false);
  }

  return (
    <Wrapper>
      <Sidebar>
        <h3>Comando SQL</h3>
        <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
      </Sidebar>

      <MainContent>
        <Title>Gerenciar Funcionários</Title>

        <Form onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Nome do Funcionário"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Criar'}
          </button>
        </Form>

        <Filters>
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
          />
        </Filters>

        <h2>Funcionários Cadastrados</h2>
        <List>
          {funcionarios.map((f) => (
            <li key={f.cod_funcionario}>
              <div className="id">#{f.cod_funcionario}</div>
              <input
                type="text"
                value={editMap[f.cod_funcionario] || ''}
                onChange={(e) =>
                  setEditMap((prev) => ({
                    ...prev,
                    [f.cod_funcionario]: e.target.value,
                  }))
                }
              />
              <button
                className="btn save"
                onClick={() => handleUpdate(f.cod_funcionario)}
                disabled={loading}
              >
                Salvar
              </button>
              {/* <button
                className="btn delete"
                onClick={() => handleDelete(f.cod_funcionario)}
                disabled={loading}
              >
                Excluir
              </button> */}
            </li>
          ))}
        </List>
      </MainContent>
    </Wrapper>
  );
}
