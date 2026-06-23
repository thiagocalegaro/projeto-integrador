import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    try {
      const resposta = await api.post('/auth/login', { email, senha });
      const token = resposta.data.access_token;
      localStorage.setItem('sas_token', token);
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      if (payload.tipo === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard/usuario'); 
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao realizar login.';
      setErro(Array.isArray(msg) ? msg[0] : msg);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Header mostrarLogout={false}/>
      
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <div className={styles.accentBar}></div>
          <h1 className={styles.title}>Login</h1>
        </div>

        <div className={styles.card}>
          {erro && <div className={styles.error}>{erro}</div>}

          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label className={styles.label}>E-mail Institucional</label>
              <input 
                type="email" 
                className={styles.input}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Senha</label>
              <input 
                type="password" 
                className={styles.input}
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className={styles.button}>Entrar</button>
          </form>

          <p className={styles.footerText}>
            Não tem uma conta? <button onClick={() => navigate('/cadastro')} className={styles.link}>Cadastre-se</button>
          </p>
        </div>
      </div>
    </div>
  );
}