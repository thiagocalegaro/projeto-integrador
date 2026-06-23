import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, CalendarCheck } from 'lucide-react'; // Importado o ícone correto para agendamentos
import styles from './Header.module.css';

interface HeaderProps {
  mostrarLogout?: boolean; 
}

export default function Header({ mostrarLogout = true }: HeaderProps) {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('sas_token');

    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );

        const usuarioDecodificado = JSON.parse(jsonPayload);

        // Ajuste caso sua Role venha como Role.Admin ou string 'admin'
        if (usuarioDecodificado.tipo === 'admin' || usuarioDecodificado.tipo === 'ADMIN') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao decodificar o token no Header:', error);
      }
    }
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/login');
  }

  return (
    <header className={styles.header}>
      {/* 🏢 Logo Inteligente: Admin vai para /dashboard, Usuário Comum vai para /dashboard/usuario */}
      {isAdmin ? (
        <Link to="/dashboard" className={styles.logoLink}>
          <div className={styles.logo}>
            POLITÉCNICO | <span className={styles.subLogo}>AGENDAMENTO DE SALAS</span>
          </div>
        </Link>
      ) : (
        <Link to="/dashboard/usuario" className={styles.logoLink}>
          <div className={styles.logo}>
            POLITÉCNICO | <span className={styles.subLogo}>AGENDAMENTO DE SALAS</span>
          </div>
        </Link>
      )}

      {mostrarLogout && (
        <div className={styles.userMenu}>
          {/* 🚀 Botão Estratégico: Só renderiza se for Usuário Comum (!isAdmin) */}
          {!isAdmin && (
            <Link to="/meus-agendamentos" className={styles.agendamentosLink}>
              <CalendarCheck size={18} />
              <span>Meus Agendamentos</span>
            </Link>
          )}

          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}