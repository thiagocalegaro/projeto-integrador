import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Trash } from 'lucide-react';
import Header from '../components/Header';
import styles from './GerenciarSalas.module.css';
import { api } from '../services/api';

interface Recurso {
  id: number;
  nome: string;
}

interface SalaRecurso {
  recurso: Recurso;
  quantidade: number;
}

interface RecursoSelecionadoForm {
  recursoId: number;
  quantidade: number;
}

interface GerenciarSala {
  id_sala: number;
  codigo: string;
  bloco: string;
  tipo: string;
  capacidade: number;
  disponivel_manha: boolean;
  disponivel_tarde: boolean;
  disponivel_noite: boolean;
  ativa: boolean;
  salaRecursos?: SalaRecurso[]; 
}

export default function GerenciarSalas() {
  const [salas, setSalas] = useState<GerenciarSala[]>([]);
  const [recursosDisponiveis, setRecursosDisponiveis] = useState<Recurso[]>([]);
  const [busca, setBusca] = useState('');
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [codigo, setCodigo] = useState('');
  const [bloco, setBloco] = useState('');
  const [tipo, setTipo] = useState('Sala de aula');
  const [capacidade, setCapacidade] = useState(20);
  const [disponivelManha, setDisponivelManha] = useState(false);
  const [disponivelTarde, setDisponivelTarde] = useState(false);
  const [disponivelNoite, setDisponivelNoite] = useState(false);
  const [isAtiva, setIsAtiva] = useState(true);

  const [recursosSelecionados, setRecursosSelecionados] = useState<RecursoSelecionadoForm[]>([]);

  useEffect(() => {
    carregarSalas();
    carregarRecursos(); 
  }, []);

  async function carregarSalas() {
    try {
      const response = await api.get('/salas');
      setSalas(response.data);
    } catch (err) {
      console.error('Erro ao buscar salas', err);
    }
  }

  async function carregarRecursos() {
    try {
      const response = await api.get('/recursos');
      setRecursosDisponiveis(response.data);
    } catch (err) {
      console.error('Erro ao buscar recursos disponíveis', err);
    }
  }

  function handleAbrirCriar() {
    setIdEditando(null);
    setCodigo('');
    setBloco('');
    setTipo('Sala de aula');
    setCapacidade(20);
    setDisponivelManha(false);
    setDisponivelTarde(false);
    setDisponivelNoite(false);
    setIsAtiva(true);
    setRecursosSelecionados([]); 
    setIsModalAberto(true);
  }

  function handleAbrirEditar(sala: GerenciarSala) {
    setIdEditando(sala.id_sala);
    setCodigo(sala.codigo);
    setBloco(sala.bloco);
    setTipo(sala.tipo);
    setCapacidade(sala.capacidade);
    setDisponivelManha(!!sala.disponivel_manha);
    setDisponivelTarde(!!sala.disponivel_tarde);
    setDisponivelNoite(!!sala.disponivel_noite);
    setIsAtiva(!!sala.ativa);

    if (sala.salaRecursos && sala.salaRecursos.length > 0) {
      const mapeadosParaForm = sala.salaRecursos.map(sr => ({
        recursoId: sr.recurso.id,
        quantidade: sr.quantidade
      }));
      setRecursosSelecionados(mapeadosParaForm);
    } else {
      setRecursosSelecionados([]);
    }

    setIsModalAberto(true);
  }

  function handleAdicionarLinhaRecurso() {
    const primeiroIdDisponivel = recursosDisponiveis[0]?.id || 0;
    setRecursosSelecionados([...recursosSelecionados, { recursoId: primeiroIdDisponivel, quantidade: 1 }]);
  }

  function handleRemoverLinhaRecurso(indexParaRemover: number) {
    setRecursosSelecionados(recursosSelecionados.filter((_, index) => index !== indexParaRemover));
  }

  function handleAlterarLinhaRecurso(index: number, campo: 'recursoId' | 'quantidade', valor: number) {
    const listaNova = [...recursosSelecionados];
    listaNova[index] = {
      ...listaNova[index],
      [campo]: valor
    };
    setRecursosSelecionados(listaNova);
  }

  async function handleDeletar(id: number) {
    if (window.confirm('Tem certeza que deseja remover esta sala?')) {
      try {
        await api.delete(`/salas/${id}`);
        carregarSalas();
      } catch (err: unknown) {
        console.log('ERRO DETALHADO AO DELETAR SALA:', (err as any).response?.data);
        alert('Erro ao deletar sala.');
      }
    }
  }

  async function handleSalvarSala(e: React.FormEvent) {
    e.preventDefault();
    const dadosSala = {
      codigo: codigo,
      bloco: bloco,
      tipo: tipo,
      capacidade: capacidade,
      disponivel_manha: disponivelManha,
      disponivel_tarde: disponivelTarde,
      disponivel_noite: disponivelNoite,
      ativa: isAtiva,
      recursos: recursosSelecionados.map(({ recursoId, quantidade }) => ({ id: recursoId, quantidade }))
    };
    
    try {
      if (idEditando) {
        await api.patch(`/salas/${idEditando}`, dadosSala);
      } else {
        await api.post('/salas', dadosSala);
      }
      setIsModalAberto(false);
      carregarSalas();
    } catch (err: unknown) {
      console.log('ERRO DETALHADO AO SALVAR SALA:', (err as any).response?.data);
      alert('Erro ao salvar os dados da sala.');
    }
  }

  const salasFiltradas = salas.filter(sala =>
    sala.codigo.toLowerCase().includes(busca.toLowerCase()) ||
    sala.bloco.toLowerCase().includes(busca.toLowerCase()) ||
    sala.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Gerenciar Salas</h1>

        <div className={styles.actionRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar sala por código/bloco/tipo..."
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
          {salasFiltradas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
              Nenhuma sala cadastrada ou encontrada.
            </p>
          ) : (
            salasFiltradas.map((sala: any) => {
              const codigoSala = sala.codigo || '';
              const blocoSala = sala.bloco || '';
              const tipoSala = sala.tipo || 'Sala de aula';
              const capacidadeSala = sala.capacidade || 0;
              
              const turnosAtivos = [
                sala.disponivel_manha ? 'Manhã' : '',
                sala.disponivel_tarde ? 'Tarde' : '',
                sala.disponivel_noite ? 'Noite' : ''
              ].filter(Boolean).join(', ') || 'Nenhum';

              const statusAtiva = (sala.ativa === true || sala.ativa === 't') ? 'Sim' : 'Não';
              
              return (
                <div key={sala.id_sala} className={styles.salaCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>
                      Sala {codigoSala} - {tipoSala}
                    </div>
                    <div className={styles.actionIcons}>
                      <button onClick={() => handleAbrirEditar(sala)} className={styles.iconBtn}>
                        <Edit className={styles.editIcon} size={20} />
                      </button>
                      <button onClick={() => handleDeletar(sala.id_sala)} className={styles.iconBtn}>
                        <Trash2 className={styles.deleteIcon} size={20} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div>
                      <p className={styles.infoLine}><strong>Capacidade:</strong> {capacidadeSala}</p>
                      <p className={styles.infoLine}><strong>Bloco:</strong> {blocoSala}</p>
                      <p className={styles.infoLine}><strong>Turnos:</strong> {turnosAtivos}</p>
                    </div>
                    <div>
                      <p className={styles.infoLine}><strong>Ativa:</strong> {statusAtiva}</p>
                      
                      <p className={styles.infoLine}>
                        <strong>Recursos:</strong>{' '}
                        {sala.salaRecursos && sala.salaRecursos.length > 0 ? (
                          <span className={styles.recursosListBadges}>
                            {sala.salaRecursos.map((sr: any, index: number) => (
                              <span key={index} className={styles.recursoBadge}>
                                {sr.recurso?.nome} ({sr.quantidade}x)
                              </span>
                            ))}
                          </span>
                        ) : (
                          'Nenhum cadastrado'
                        )}
                      </p>
                    </div>
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

            <h2 className={styles.modalTitle}>{idEditando ? 'Editar Sala' : 'Criar Sala'}</h2>

            <form onSubmit={handleSalvarSala}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Código:</label>
                <input type="text" className={styles.modalInput} value={codigo} onChange={e => setCodigo(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Bloco:</label>
                <input type="text" className={styles.modalInput} value={bloco} onChange={e => setBloco(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Tipo:</label>
                <select className={styles.modalInput} value={tipo} onChange={e => setTipo(e.target.value)}>
                  <option value="Sala de aula">Sala de aula</option>
                  <option value="Laboratório">Laboratório</option>
                  <option value="Social">Social</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Capacidade:</label>
                <input type="number" className={styles.modalInput} value={capacidade} onChange={e => setCapacidade(Number(e.target.value))} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Turnos de funcionamento:</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={disponivelManha}
                      onChange={e => setDisponivelManha(e.target.checked)}
                    />
                    Manhã
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={disponivelTarde}
                      onChange={e => setDisponivelTarde(e.target.checked)}
                    />
                    Tarde
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={disponivelNoite}
                      onChange={e => setDisponivelNoite(e.target.checked)}
                    />
                    Noite
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Ativa:</label>
                <select
                  className={styles.modalInput}
                  value={isAtiva ? "Sim" : "Não"}
                  onChange={e => setIsAtiva(e.target.value === "Sim")}
                >
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div className={styles.recursosFormSection}>
                <div className={styles.recursosFormHeader}>
                  <label className={styles.modalLabel}>Recursos da sala:</label>
                  <button id='teste' type="button" onClick={handleAdicionarLinhaRecurso} className={styles.btnAdicionarRecurso}>
                    + Adicionar
                  </button>
                </div>

                {recursosSelecionados.map((item, index) => (
                  <div key={index} className={styles.recursoRow}>
                    <select
                      className={styles.modalInput}
                      style={{ flex: 2 }}
                      value={item.recursoId}
                      onChange={e => handleAlterarLinhaRecurso(index, 'recursoId', Number(e.target.value))}
                    >
                      {recursosDisponiveis.map(rec => (
                        <option key={rec.id} value={rec.id}>{rec.nome}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className={styles.modalInput}
                      style={{ flex: 1, minWidth: '60px' }}
                      min="1"
                      placeholder="Qtd"
                      value={item.quantidade}
                      onChange={e => handleAlterarLinhaRecurso(index, 'quantidade', Number(e.target.value))}
                      required
                    />

                    <button type="button" onClick={() => handleRemoverLinhaRecurso(index)} className={styles.btnRemoverLinha}>
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button type="submit" className={styles.saveButton}>Salvar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}