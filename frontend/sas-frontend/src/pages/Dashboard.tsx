import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Tv, AlertTriangle, Users } from 'lucide-react';
import Header from '../components/Header'; 
import styles from './Dashboard.module.css'; 

export default function Dashboard() {
  const navigate = useNavigate();

  const modulosAdmin = [
    { title: 'Salas', icon: <Home size={48} strokeWidth={1.5} />, path: '/dashboard/gerenciar-salas' },
    { title: 'Agendamentos', icon: <Calendar size={48} strokeWidth={1.5} />, path: '/dashboard/agendamentos' },
    { title: 'Recursos', icon: <Tv size={48} strokeWidth={1.5} />, path: '/dashboard/recursos' },
    { title: 'Exceções', icon: <AlertTriangle size={48} strokeWidth={1.5} />, path: '/dashboard/excecoes' },
    { title: 'Usuários', icon: <Users size={48} strokeWidth={1.5} />, path: '/dashboard/usuarios' },
  ];

  return (
    <div className={styles.container}>
      <Header/>

      <main className={styles.main}>
        <h1 className={styles.titulo}>Painel Administrativo</h1>

        <div className={styles.grid}>
          {modulosAdmin.map((modulo, index) => (
            <div
              key={index}
              onClick={() => navigate(modulo.path)}
              className={styles.card}>
              <div className={styles.cardHeader}>{modulo.title}</div>
              <div className={styles.cardIcon}>{modulo.icon}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}