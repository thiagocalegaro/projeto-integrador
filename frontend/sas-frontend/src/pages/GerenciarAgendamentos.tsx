import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit3, X, Calendar, User } from 'lucide-react';
import Header from '../components/Header';
import styles from './GerenciarAgendamentos.module.css';
import { api } from '../services/api';

interface Sala {
  id_sala: number;
  codigo: string;
  bloco: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Agendamento {
  id_agendamento: number;
  data: string;
  motivo: string;
  turno_manha: boolean;
  turno_tarde: boolean;
  turno_noite: boolean;
  sala: Sala;
  usuario?: Usuario;
}

export default function GerenciarAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // 🚀 Estado para guardar os usuários
  const [busca, setBusca] = useState('');
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [modo, setModo] = useState<'criar' | 'editar'>('criar');
  const [idAgendamentoSelecionado, setIdAgendamentoSelecionado] = useState<number | null>(null);

  // 📝 Estados do Formulário
  const [idSala, setIdSala] = useState<number | ''>('');
  const [idUsuario, setIdUsuario] = useState<number | ''>(''); // 🚀 Campo para vincular o usuário
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');
  const [turnoManha, setTurnoManha] = useState(false);
  const [turnoTarde, setTurnoTarde] = useState(false);
  const [turnoNoite, setTurnoNoite] = useState(false);

  const hojeStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    carregarAgendamentos();
    carregarSalas();
    carregarUsuarios(); // 🚀 Carrega os usuários na inicialização
  }, []);

  async function carregarAgendamentos() {
    try {
      const response = await api.get('/agendamentos');
      setAgendamentos(response.data);
    } catch (err) {
      console.error('Erro ao buscar todos os agendamentos:', err);
    }
  }

  async function carregarSalas() {
    try {
      const response = await api.get('/salas');
      setSalas(response.data.filter((s: Sala) => s.id_sala));
    } catch (err) {
      console.error('Erro ao buscar salas:', err);
    }
  }

  async function carregarUsuarios() {
    try {
      const response = await api.get('/usuarios'); // 🚀 Endpoint GET /usuarios do seu backend
      setUsuarios(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  }

  function handleAbrirCriar() {
    setModo('criar');
    setIdAgendamentoSelecionado(null);
    setIdSala('');
    setIdUsuario('');
    setData('');
    setMotivo('');
    setTurnoManha(false);
    setTurnoTarde(false);
    setTurnoNoite(false);
    setIsModalAberto(true);
  }

  function handleAbrirEditar(agendamento: Agendamento) {
    setModo('editar');
    setIdAgendamentoSelecionado(agendamento.id_agendamento);
    setIdSala(agendamento.sala?.id_sala || '');
    setIdUsuario(agendamento.usuario?.id || ''); // Vincula o id do usuário atual do agendamento
    setData(agendamento.data);
    setMotivo(agendamento.motivo);
    setTurnoManha(agendamento.turno_manha);
    setTurnoTarde(agendamento.turno_tarde);
    setTurnoNoite(agendamento.turno_noite);
    setIsModalAberto(true);
  }

  async function handleSalvarAgendamento(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      id_sala: Number(idSala),
      id_usuario: idUsuario ? Number(idUsuario) : undefined, // 🚀 Repassa o ID do usuário selecionado para o backend
      data,
      motivo,
      turno_manha: turnoManha,
      turno_tarde: turnoTarde,
      turno_noite: turnoNoite,
    };

    try {
      if (modo === 'criar') {
        await api.post('/agendamentos', payload);
        alert('Agendamento criado com sucesso!');
      } else if (modo === 'editar' && idAgendamentoSelecionado) {
        await api.patch(`/agendamentos/${idAgendamentoSelecionado}`, payload);
        alert('Agendamento atualizado com sucesso!');
      }
      setIsModalAberto(false);
      carregarAgendamentos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao processar agendamento.');
    }
  }

  async function handleDeletar(id: number) {
    if (window.confirm('Tem certeza que deseja remover este agendamento definitivamente?')) {
      try {
        await api.delete(`/agendamentos/${id}`);
        carregarAgendamentos();
      } catch (err) {
        alert('Erro ao remover agendamento.');
      }
    }
  }

  const agendamentosFiltradas = agendamentos.filter(ag =>
    ag.motivo?.toLowerCase().includes(busca.toLowerCase()) ||
    ag.sala?.codigo?.toLowerCase().includes(busca.toLowerCase()) ||
    ag.sala?.bloco?.toLowerCase().includes(busca.toLowerCase()) ||
    ag.usuario?.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Gerenciar Agendamentos</h1>
        <p style={{ color: '#64748b', margin: '0' }}>Controle global de todas as alocações da instituição.</p>

        <div className={styles.actionRow}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar por sala, bloco, motivo ou usuário..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <Search className={styles.searchIcon} size={18} />
          </div>

          <button onClick={handleAbrirCriar} className={styles.addButton}>
            Novo Agendamento <Plus size={18} />
          </button>
        </div>

        <div className={styles.listContainer}>
          {agendamentosFiltradas.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
              Nenhum agendamento encontrado.
            </p>
          ) : (
            agendamentosFiltradas.map(ag => {
              const dataFormatada = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR');

              return (
                <div key={ag.id_agendamento} className={styles.agendamentoCard}>
                  <div className={styles.cardInfo}>
                    <h3>Sala {ag.sala?.codigo} — Bloco {ag.sala?.bloco}</h3>
                    <p style={{ color: '#1e293b', fontWeight: 500 }}><strong>Motivo:</strong> {ag.motivo}</p>
                    
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {dataFormatada}
                      </span>
                      {ag.usuario && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> {ag.usuario.nome}
                        </span>
                      )}
                    </div>

                    <div className={styles.turnosWrapper}>
                      {ag.turno_manha && <span className={styles.turnoBadge}>Manhã</span>}
                      {ag.turno_tarde && <span className={styles.turnoBadge}>Tarde</span>}
                      {ag.turno_noite && <span className={styles.turnoBadge}>Noite</span>}
                    </div>
                  </div>

                  <div className={styles.actionIcons}>
                    {/* 🚀 CORRIGIDO: Agora as classes dinâmicas aplicam o Hover perfeitamente */}
                    <button onClick={() => handleAbrirEditar(ag)} className={`${styles.iconBtn} ${styles.iconBtnEditar}`} title="Editar">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDeletar(ag.id_agendamento)} className={`${styles.iconBtn} ${styles.iconBtnDeletar}`} title="Remover">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* 📥 MODAL DE CRIAÇÃO / EDIÇÃO */}
      {isModalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setIsModalAberto(false)} className={styles.closeModal}>
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>
              {modo === 'criar' ? 'Criar Novo Agendamento' : 'Editar Agendamento'}
            </h2>

            <form onSubmit={handleSalvarAgendamento}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Selecione a Sala:</label>
                <select className={styles.modalInput} value={idSala} onChange={e => setIdSala(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">Selecione...</option>
                  {salas.map(s => (
                    <option key={s.id_sala} value={s.id_sala}>Sala {s.codigo} — Bloco {s.bloco}</option>
                  ))}
                </select>
              </div>

              {/* 🚀 NOVO CAMPO: Listagem Dinâmica de todos os Usuários do sistema */}
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Responsável / Usuário:</label>
                <select className={styles.modalInput} value={idUsuario} onChange={e => setIdUsuario(e.target.value ? Number(e.target.value) : '')} required>
                  <option value="">Selecione o usuário...</option>
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.nome} ({u.email})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Data da Reserva:</label>
                <input type="date" className={styles.modalInput} value={data} min={hojeStr} onChange={e => setData(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Turnos Alocados:</label>
                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={turnoManha} onChange={e => setTurnoManha(e.target.checked)} />
                    <span>Manhã</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={turnoTarde} onChange={e => setTurnoTarde(e.target.checked)} />
                    <span>Tarde</span>
                  </label>
                  <label className={styles.checkboxLabel}>
                    <input type="checkbox" checked={turnoNoite} onChange={e => setTurnoNoite(e.target.checked)} />
                    <span>Noite</span>
                  </label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Motivo / Disciplina:</label>
                <input type="text" className={styles.modalInput} placeholder="Ex: Aula de Banco de Dados" value={motivo} onChange={e => setMotivo(e.target.value)} required />
              </div>

              <button type="submit" className={styles.saveButton}>
                {modo === 'criar' ? 'Criar Agendamento' : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}