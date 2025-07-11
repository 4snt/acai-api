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
  margin-bottom: 1.5rem;
  color: #2e3a59;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;

  select, input, button {
    padding: 0.6rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  select, input {
    flex: 1;
    min-width: 150px;
  }

  button {
    background-color: #2e3a59;
    color: white;
    font-weight: bold;
    border: none;
    cursor: pointer;

    &:hover {
      background-color: #3e4c6c;
    }
  }
`;

const ProductList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 1rem 0;

  li {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
    background: #f8f9fa;
    padding: 0.75rem 1rem;
    border-radius: 5px;
    border: 1px solid #ddd;
  }
`;

export default function VendasPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [funcionarios, setFuncionarios] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [venda, setVenda] = useState({
    cod_cliente: '',
    cod_funcionario: '',
    produtoSelecionado: '',
    quantidade: '',
    preco: '',
  });
  const [itens, setItens] = useState<any[]>([]);
  const [lastSql, setLastSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [relatorio, setRelatorio] = useState<any>(null);

  useEffect(() => {
    fetch('/api/clientes')
      .then(r => r.json())
      .then(data => setClientes(Array.isArray(data) ? data : data.data ?? []));

    fetch('/api/funcionarios')
      .then(r => r.json())
      .then(data => setFuncionarios(Array.isArray(data) ? data : data.data ?? []));

    fetch('/api/produtos')
      .then(r => r.json())
      .then(data => setProdutos(Array.isArray(data) ? data : data.produtos ?? []));

    fetch('/api/relatorio-vendas')
      .then(r => r.json())
      .then(setRelatorio);
  }, []);

  function adicionarProduto() {
    const { produtoSelecionado, quantidade, preco } = venda;
    if (!produtoSelecionado || !quantidade || !preco) return;

    const prod = produtos.find(p => p.cod_produto == produtoSelecionado);
    if (!prod) return;

    setItens(prev => [
      ...prev,
      {
        cod_produto: prod.cod_produto,
        nome: prod.nome,
        quantidade: parseFloat(quantidade),
        preco_vendido: parseFloat(preco),
      },
    ]);

    setVenda(v => ({
      ...v,
      produtoSelecionado: '',
      quantidade: '',
      preco: '',
    }));
  }

  async function finalizarVenda() {
    const { cod_cliente, cod_funcionario } = venda;
    if (!cod_cliente || !cod_funcionario || itens.length === 0) return;

    setLoading(true);
    const res = await fetch('/api/vendas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cod_cliente: Number(cod_cliente),
        cod_funcionario: Number(cod_funcionario),
        produtos: itens,
      }),
    });

    const data = await res.json();
    setLastSql(data.sql || '-- Venda registrada mas sem SQL retornado');
    setItens([]);
    setVenda({ cod_cliente: '', cod_funcionario: '', produtoSelecionado: '', quantidade: '', preco: '' });
    setLoading(false);
  }

  const valorTotal = itens.reduce((acc, i) => acc + i.quantidade * i.preco_vendido, 0);

  return (
    <Wrapper>
      <Sidebar>
        <h3>Comando SQL</h3>
        <SqlBlock>{lastSql || 'Nenhum comando executado ainda.'}</SqlBlock>
      </Sidebar>

      <MainContent>
        <Title>Registrar Venda</Title>

        <Section>
          <FormRow>
            <select
              value={venda.cod_cliente}
              onChange={e => setVenda(v => ({ ...v, cod_cliente: e.target.value }))}
              required
            >
              <option value="">Selecione o Cliente</option>
              {clientes?.map(c => (
                <option key={c.cod_cliente} value={c.cod_cliente}>
                  #{c.cod_cliente} - {c.nome}
                </option>
              ))}
            </select>

            <select
              value={venda.cod_funcionario}
              onChange={e => setVenda(v => ({ ...v, cod_funcionario: e.target.value }))}
              required
            >
              <option value="">Selecione o Funcionário</option>
              {funcionarios?.map(f => (
                <option key={f.cod_funcionario} value={f.cod_funcionario}>
                  #{f.cod_funcionario} - {f.nome}
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow>
            <select
              value={venda.produtoSelecionado}
              onChange={e => setVenda(v => ({ ...v, produtoSelecionado: e.target.value }))}
            >
              <option value="">Selecione o Produto</option>
              {produtos.map(p => (
                <option key={p.cod_produto} value={p.cod_produto}>
                  #{p.cod_produto} - {p.nome}
                </option>
              ))}
            </select>

            <input
              type="number"
              step="0.01"
              placeholder="Quantidade"
              value={venda.quantidade}
              onChange={e => setVenda(v => ({ ...v, quantidade: e.target.value }))}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Preço vendido"
              value={venda.preco}
              onChange={e => setVenda(v => ({ ...v, preco: e.target.value }))}
            />

            <button type="button" onClick={adicionarProduto}>Adicionar Produto</button>
          </FormRow>
        </Section>

        {itens.length > 0 && (
          <>
            <h3>Produtos da Venda</h3>
            <ProductList>
              {itens.map((item, index) => (
                <li key={index}>
                  {item.nome} — {item.quantidade} × R${item.preco_vendido.toFixed(2)}
                </li>
              ))}
            </ProductList>

            <p><strong>Total:</strong> R$ {valorTotal.toFixed(2)}</p>

            <button onClick={finalizarVenda} disabled={loading}>
              {loading ? 'Salvando...' : 'Finalizar Venda'}
            </button>
          </>
        )}

        <h3>Relatório de Vendas</h3>
        <Section>
          {relatorio ? (
            <>
              <p><strong>Total de vendas:</strong> {relatorio.total_vendas}</p>
              <p><strong>Valor total vendido:</strong> R$ {Number(relatorio.valor_total_vendido).toFixed(2)}</p>
              <p><strong>Valor médio por venda:</strong> R$ {Number(relatorio.media_valor_venda).toFixed(2)}</p>
              <p><strong>Produto mais vendido:</strong> {relatorio.produto_mais_vendido?.nome} ({relatorio.produto_mais_vendido?.total_vendida} un)</p>
              <p><strong>Produto com maior receita:</strong> {relatorio.produto_maior_receita?.nome} (R$ {Number(relatorio.produto_maior_receita?.receita_total).toFixed(2)})</p>
            </>
          ) : (
            <p>Carregando relatório...</p>
          )}
        </Section>
      </MainContent>
    </Wrapper>
  );
}
