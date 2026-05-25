import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X } from 'lucide-react';
import Header from '../components/Header';
import styles from './GerenciarExcecoes.module.css';
import { api } from '../services/api';

interface Sala {
  id_sala: number;
  codigo: string;
  bloco: string;
}

interface Excecao {
  id: number;
  inicio: string;
  fim: string;
  motivo: string;
  tipo: string;
  sala?: Sala;
}

export default function GerenciarExcecoes() {
  const [excecoes, setExcecoes] = useState<Excecao[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [busca, setBusca] = useState('');
  const [isModalAberto, setIsModalAberto] = useState(false);

  const [escopo, setEscopo] = useState('SALA_UNICA');
  const [idSala, setIdSala] = useState<number | ''>('');
  const [bloco, setBloco] = useState('');
  const [motivo, setMotivo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  useEffect(() => {
    carregarExcecoes();
    carregarSalas();
  }, []);

  async function carregarExcecoes() {
    try {
      const response = await api.get('/excecoes');
      setExcecoes(response.data);
    } catch (err) {
      console.error('Erro ao buscar exceções:', err);
    }
  }

  async function carregarSalas() {
    try {
      const response = await api.get('/salas');
      setSalas(response.data);
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    }
  }

  function handleAbrirCriar() {
    setEscopo('SALA_UNICA');
    setIdSala('');
    setBloco('');
    setMotivo('');
    setInicio('');
    setFim('');
    setIsModalAberto(true);
  }

  async function handleSalvarExcecao(e: React.FormEvent) {
    e.preventDefault();

    const payload: any = {
      escopo,
      tipo: 'bloqueio', 
      motivo,
      inicio: new Date(inicio).toISOString(),
      fim: new Date(fim).toISOString(),
    };

    if (escopo === 'SALA_UNICA') payload.id_sala = Number(idSala);
    if (escopo === 'BLOCO') payload.bloco = bloco;

    try {
      await api.post('/excecoes', payload);
      setIsModalAberto(false);
      carregarExcecoes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao criar exceção.');
    }
  }

  async function handleDeletar(id: number) {
    if (window.confirm('Tem certeza que deseja remover esta exceção?')) {
      try {
        await api.delete(`/excecoes/${id}`);
        carregarExcecoes();
      } catch (err) {
        alert('Erro ao remover exceção.');
      }
    }
  }

  const blocosDisponiveis = Array.from(new Set(salas.map(s => s.bloco))).filter(Boolean);

  const excecoesFiltradas = excecoes.filter(exc =>
    exc.motivo.toLowerCase().includes(busca.toLowerCase()) ||
    exc.sala?.codigo.toLowerCase().includes(busca.toLowerCase()) ||
    exc.sala?.bloco.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Exceções e Bloqueios</h1>

        <div className={styles.actionRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por motivo, sala ou bloco..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <Search className={styles.searchIcon} size={18} />
          </div>

          <button onClick={handleAbrirCriar} className={styles.addButton}>
            Nova Exceção <Plus size={18} />
          </button>
        </div>

        <div className={styles.listContainer}>
          {excecoesFiltradas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              Nenhuma exceção ativa ou encontrada.
            </p>
          ) : (
            excecoesFiltradas.map(exc => {
              const dataInicio = new Date(exc.inicio).toLocaleString('pt-BR');
              const dataFim = new Date(exc.fim).toLocaleString('pt-BR');

              return (
                <div key={exc.id} className={styles.excecaoCard}>
                  <div className={styles.cardInfo}>
                    <h3>{exc.motivo}</h3>
                    <p><strong>{exc.sala ? `Sala ${exc.sala.codigo} (Bloco ${exc.sala.bloco})` : 'Global (Todas as salas)'}</strong></p>
                    <p><strong>Início:</strong> {dataInicio}</p>
                    <p><strong>Fim:</strong> {dataFim}</p>
                  </div>

                  <div className={styles.actionIcons}>
                    <button onClick={() => handleDeletar(exc.id)} className={styles.iconBtn}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {isModalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setIsModalAberto(false)} className={styles.closeModal}>
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>Adicionar Exceção</h2>

            <form onSubmit={handleSalvarExcecao}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Abrangência:</label>
                <select className={styles.modalInput} value={escopo} onChange={e => setEscopo(e.target.value)}>
                  <option value="SALA_UNICA">Sala Específica</option>
                  <option value="BLOCO">Bloco Específico</option>
                  <option value="TODAS">Geral (Todas as salas)</option>
                </select>
              </div>

              {escopo === 'SALA_UNICA' && (
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>Selecione a Sala:</label>
                  <select className={styles.modalInput} value={idSala} onChange={e => setIdSala(e.target.value ? Number(e.target.value) : '')} required>
                    <option value="">Selecione...</option>
                    {salas.map(s => (
                      <option key={s.id_sala} value={s.id_sala}>Sala {s.codigo} - Bloco {s.bloco}</option>
                    ))}
                  </select>
                </div>
              )}

              {escopo === 'BLOCO' && (
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>Selecione o Bloco:</label>
                  <select className={styles.modalInput} value={bloco} onChange={e => setBloco(e.target.value)} required>
                    <option value="">Selecione...</option>
                    {blocosDisponiveis.map((b, idx) => (
                      <option key={idx} value={`Bloco ${b}`}>Bloco {b}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Motivo / Descrição do Bloqueio:</label>
                <input 
                  type="text" 
                  className={styles.modalInput} 
                  placeholder="Ex: Manutenção, Feriado, Evento" 
                  value={motivo} 
                  onChange={e => setMotivo(e.target.value)} 
                  required 
                />
              </div>

              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>Data/Hora Início:</label>
                  <input type="datetime-local" className={styles.modalInput} value={inicio} onChange={e => setInicio(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.modalLabel}>Data/Hora Fim:</label>
                  <input type="datetime-local" className={styles.modalInput} value={fim} onChange={e => setFim(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className={styles.saveButton}>Aplicar Bloqueio</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}