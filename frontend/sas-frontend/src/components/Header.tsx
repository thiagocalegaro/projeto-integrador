import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
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

        if (usuarioDecodificado.tipo === 'admin') {
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
      {isAdmin ? (
        <Link to="/dashboard" className={styles.logoLink}>
          <div className={styles.logo}>
            POLITÉCNICO | <span className={styles.subLogo}>AGENDAMENTO DE SALAS</span>
          </div>
        </Link>
      ) : (
        <a href="#" className={styles.logoLink} onClick={(e) => e.preventDefault()}>
          <div className={styles.logo}>
            POLITÉCNICO | <span className={styles.subLogo}>AGENDAMENTO DE SALAS</span>
          </div>
        </a>
      )}

          {mostrarLogout && (
        <div className={styles.userMenu}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}