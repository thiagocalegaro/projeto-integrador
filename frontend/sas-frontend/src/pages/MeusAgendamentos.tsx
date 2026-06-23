import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import Header from '../components/Header';
import styles from './MeusAgendamentos.module.css';
import { api } from '../services/api';

interface Sala {
  codigo: string;
  bloco: string;
}

interface Agendamento {
  id_agendamento: number;
  data: string;
  motivo: string;
  turno_manha: boolean;
  turno_tarde: boolean;
  turno_noite: boolean;
  sala: Sala;
}

export default function MeusAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Politécnico | Meus Agendamentos";
    carregarMeusAgendamentos();
  }, []);

  async function carregarMeusAgendamentos() {
    try {
      const response = await api.get('/agendamentos');
      setAgendamentos(response.data);
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelar(id: number) {
    const confirmar = window.confirm("Tem certeza que deseja cancelar esta reserva?");
    if (!confirmar) return;

    try {
      await api.delete(`/agendamentos/${id}`);
      alert("Agendamento cancelado com sucesso!");
      setAgendamentos(prev => prev.filter(a => a.id_agendamento !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || "Erro ao cancelar o agendamento.");
    }
  }

  function podeCancelar(dataReservaStr: string): boolean {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dataReserva = new Date(dataReservaStr + 'T00:00:00');
    dataReserva.setHours(0, 0, 0, 0);

    return dataReserva.getTime() >= hoje.getTime();
  }

  return (
    <div className={styles.container}>
      <Header mostrarLogout={true} />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Meus Agendamentos</h1>
        <p className={styles.subtitulo}>Acompanhe e gerencie seu histórico de reservas.</p>

        {loading ? (
          <p style={{ color: '#64748b' }}>Carregando seus agendamentos...</p>
        ) : agendamentos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <AlertCircle size={48} style={{ marginBottom: '12px', color: '#cbd5e1' }} />
            <p style={{ fontSize: '16px' }}>Você não possui nenhum agendamento realizado.</p>
          </div>
        ) : (
          <div className={styles.cardsContainer}>
            {agendamentos.map(agendamento => {
              const ativo = podeCancelar(agendamento.data);
              
              return (
                <div 
                  key={agendamento.id_agendamento} 
                  className={`${styles.cardAgendamento} ${!ativo ? styles.cardPassado : ''}`}
                >
                  <div className={styles.infoPrincipal}>
                    <div className={styles.metaRow}>
                      <div className={styles.metaItem}>
                        <MapPin size={14} color="#64748b" />
                        <span>Bloco {agendamento.sala?.bloco}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Calendar size={14} color="#64748b" />
                        <span>{new Date(agendamento.data + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <h3 className={styles.salaNome}>Sala {agendamento.sala?.codigo}</h3>
                    <p className={styles.motivoText}><strong>Motivo:</strong> {agendamento.motivo}</p>
                    <div className={styles.turnosWrapper}>
                      <span className={`${styles.turnoBadge} ${agendamento.turno_manha ? styles.turnoBadgeAtivo : ''}`}>Manhã</span>
                      <span className={`${styles.turnoBadge} ${agendamento.turno_tarde ? styles.turnoBadgeAtivo : ''}`}>Tarde</span>
                      <span className={`${styles.turnoBadge} ${agendamento.turno_noite ? styles.turnoBadgeAtivo : ''}`}>Noite</span>
                    </div>
                  </div>
                  <div className={styles.btnAcaoWrapper}>
                    <button
                      onClick={() => handleCancelar(agendamento.id_agendamento)}
                      className={styles.cancelarBtn}
                      disabled={!ativo}
                      title={!ativo ? "Não é possível cancelar agendamentos passados" : "Cancelar Agendamento"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}