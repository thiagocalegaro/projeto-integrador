import React, { useState, useEffect } from 'react';
import { Calendar, Users, X } from 'lucide-react';
import Header from '../components/Header';
import styles from './DashboardUsuario.module.css';
import { api } from '../services/api';
import { Layers } from 'lucide-react';

interface Sala {
  id_sala: number;
  codigo: string;
  bloco: string;
  capacidade: number;
  tipo: string;
  disponivel_manha: boolean;
  disponivel_tarde: boolean;
  disponivel_noite: boolean;
  ativa: boolean;
  salaRecursos?: SalaRecurso[];
}

interface Recurso {
  id_recurso: number;
  nome: string;
}

interface SalaRecurso {
  id: number;
  quantidade: number;
  recurso: Recurso;
}

const hojeStr = new Date().toISOString().split('T')[0];

export default function DashboardUsuario() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [salaSelecionada, setSalaSelecionada] = useState<Sala | null>(null);
  const [data, setData] = useState('');
  const [motivo, setMotivo] = useState('');
  const [turnoManha, setTurnoManha] = useState(false);
  const [turnoTarde, setTurnoTarde] = useState(false);
  const [turnoNoite, setTurnoNoite] = useState(false);

  useEffect(() => {
    document.title = "Politécnico | Agendamento de Salas";
    carregarSalasAtivas();
  }, []);

  async function carregarSalasAtivas() {
    try {
      const response = await api.get('/salas');
      const ativas = response.data.filter((s: Sala) => s.ativa === true);
      setSalas(ativas);
    } catch (err) {
      console.error('Erro ao carregar salas:', err);
    }
  }

  function handleAbrirModal(sala: Sala) {
    setSalaSelecionada(sala);
    setData('');
    setMotivo('');
    setTurnoManha(false);
    setTurnoTarde(false);
    setTurnoNoite(false);
    setIsModalAberto(true);
  }

  async function handleConfirmarAgendamento(e: React.FormEvent) {
    e.preventDefault();

    if (!salaSelecionada) return;

    const payload = {
      id_sala: salaSelecionada.id_sala,
      data,
      motivo,
      turno_manha: turnoManha,
      turno_tarde: turnoTarde,
      turno_noite: turnoNoite,
    };

    try {
      await api.post('/agendamentos', payload);
      alert('Agendamento realizado com sucesso!');
      setIsModalAberto(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao realizar agendamento.');
    }
  }

  return (
    <div className={styles.container}>
      <Header mostrarLogout={true} />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Salas Disponíveis</h1>
        <p className={styles.subtitulo}>Escolha uma sala abaixo para realizar o seu agendamento por turnos.</p>

        <div className={styles.gridSalas}>
          {salas.length === 0 ? (
            <p style={{ color: '#666' }}>Nenhuma sala disponível para agendamento no momento.</p>
          ) : (
            salas.map(sala => (
              <div key={sala.id_sala} className={styles.salaCard}>
                <div className={styles.salaHeader}>
                  <span className={styles.blocoTag}>Bloco {sala.bloco}</span>
                  <h3>Sala {sala.codigo}</h3>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#777', textTransform: 'uppercase' }}>
                    {sala.tipo}
                  </p>
                </div>

                <div className={styles.salaInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} /> <span>Capacidade: <strong>{sala.capacidade}</strong> pessoas</span>
                  </div>
                  <div style={{ margin: '15px 0' }}>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#555' }}>Recursos Disponíveis:</h5>
                    {sala.salaRecursos && sala.salaRecursos.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {sala.salaRecursos.map(sr => (
                          <div key={sr.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#666' }}>
                            <Layers size={12} color="#777" />
                            <span>{sr.recurso.nome} ({sr.quantidade}x)</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>Sem recursos alocados.</span>
                    )}
                  </div>
                  <div className={styles.turnosDisponiveis}>
                    <span className={`${styles.turnoBadge} ${sala.disponivel_manha ? styles.turnoBadgeAtivo : ''}`}>Manhã</span>
                    <span className={`${styles.turnoBadge} ${sala.disponivel_tarde ? styles.turnoBadgeAtivo : ''}`}>Tarde</span>
                    <span className={`${styles.turnoBadge} ${sala.disponivel_noite ? styles.turnoBadgeAtivo : ''}`}>Noite</span>
                  </div>
                </div>

                <button onClick={() => handleAbrirModal(sala)} className={styles.agendarBtn}>
                  Agendar Sala
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      {isModalAberto && salaSelecionada && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setIsModalAberto(false)} className={styles.closeModal}>
              <X size={24} />
            </button>

            <h2 className={styles.modalTitle}>Reservar Sala {salaSelecionada.codigo}</h2>

            <form onSubmit={handleConfirmarAgendamento}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Data do Agendamento:</label>
                <input 
                  type="date" 
                  className={styles.modalInput} 
                  value={data}
                  onChange={e => setData(e.target.value)}
                  required 
                  min={hojeStr}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Selecione os Turnos Desejados:</label>
                <div className={styles.checkboxGroup}>
                  
                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={turnoManha}
                      onChange={e => setTurnoManha(e.target.checked)}
                      disabled={!salaSelecionada.disponivel_manha}
                    />
                    <span>Manhã</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={turnoTarde}
                      onChange={e => setTurnoTarde(e.target.checked)}
                      disabled={!salaSelecionada.disponivel_tarde}
                    />
                    <span>Tarde</span>
                  </label>

                  <label className={styles.checkboxLabel}>
                    <input 
                      type="checkbox" 
                      checked={turnoNoite}
                      onChange={e => setTurnoNoite(e.target.checked)}
                      disabled={!salaSelecionada.disponivel_noite}
                    />
                    <span>Noite</span>
                  </label>

                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Motivo / Disciplina:</label>
                <input 
                  type="text" 
                  className={styles.modalInput}
                  placeholder="Ex: Aula de Banco de Dados I, Reunião de PI..."
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  required 
                />
              </div>

              <button type="submit" className={styles.saveButton}>Confirmar Reserva</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}