import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import Header from '../components/Header';
import styles from './GerenciarRecursos.module.css';
import { api } from '../services/api';

interface Recurso {
  id: number; 
  nome: string;
}

export default function GerenciarRecursos() {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [busca, setBusca] = useState('');
  const [isModalAberto, setIsModalAberto] = useState(false);  
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nome, setNome] = useState('');

  useEffect(() => {
    carregarRecursos();
  }, []);

  async function carregarRecursos() {
    try {
      const response = await api.get('/recursos');
      setRecursos(response.data);
    } catch (err) {
      console.error('Erro ao buscar recursos:', err);
    }
  }

  function handleAbrirCriar() {
    setIdEditando(null);
    setNome('');
    setIsModalAberto(true);
  }

  function handleAbrirEditar(recurso: Recurso) {
    setIdEditando(recurso.id);
    setNome(recurso.nome);
    setIsModalAberto(true);
  }

  async function handleDeletar(id: number) {
    if (window.confirm('Deseja realmente remover este recurso? As salas vinculadas a ele perderão este item.')) {
      try {
        await api.delete(`/recursos/${id}`);
        carregarRecursos();
      } catch (err) {
        alert('Erro ao deletar recurso.');
      }
    }
  }

  async function handleSalvarRecurso(e: React.FormEvent) {
    e.preventDefault();
    const payload = { nome };

    try {
      if (idEditando) {
        await api.patch(`/recursos/${idEditando}`, payload); 
      } else {
        await api.post('/recursos', payload);
      }
      setIsModalAberto(false);
      carregarRecursos();
    } catch (err: any) {
      console.log('ERRO AO SALVAR RECURSO:', err.response?.data);
      alert('Erro ao salvar o recurso. Verifique as regras do DTO.');
    }
  }

  const recursosFiltrados = recursos.filter(recurso =>
    recurso.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Gerenciar Recursos</h1>

        <div className={styles.actionRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar recurso por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <Search className={styles.searchIcon} size={18} />
          </div>

          <button onClick={handleAbrirCriar} className={styles.addButton}>
            Adicionar <Plus size={18} />
          </button>
        </div>

        <div className={styles.listContainer}>
          {recursosFiltrados.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              Nenhum recurso cadastrado ou encontrado.
            </p>
          ) : (
            recursosFiltrados.map((recurso) => (
              <div key={recurso.id} className={styles.recursoCard}>
                <span className={styles.recursoNome}>{recurso.nome}</span>
                
                <div className={styles.actionIcons}>
                  <button onClick={() => handleAbrirEditar(recurso)} className={styles.iconBtn}>
                    <Edit className={styles.editIcon} size={18} />
                  </button>
                  <button onClick={() => handleDeletar(recurso.id)} className={styles.iconBtn}>
                    <Trash2 className={styles.deleteIcon} size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setIsModalAberto(false)} className={styles.closeModal}>
              <X size={22} />
            </button>

            <h2 className={styles.modalTitle}>
              {idEditando ? 'Editar Recurso' : 'Novo Recurso'}
            </h2>

            <form onSubmit={handleSalvarRecurso}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Nome do Recurso:</label>
                <input
                  type="text"
                  className={styles.modalInput}
                  placeholder="Ex: Projetor Epson, Ar Condicionado"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.saveButton}>Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}