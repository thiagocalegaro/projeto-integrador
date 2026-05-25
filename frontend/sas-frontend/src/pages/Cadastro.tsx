// src/pages/Cadastro.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Header from '../components/Header';
import styles from './Login.module.css';

export default function Cadastro() {
  const navigate = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (senha.trim() !== confirmarSenha.trim()) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      await api.post('/usuarios', { 
        nome, 
        email, 
        senha, 
        confirmar_senha: confirmarSenha 
      });
      alert('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Falha ao realizar cadastro.';
      setErro(Array.isArray(msg) ? msg[0] : msg);
    }
  }

  return (
    <div className={styles.wrapper}>
      <Header mostrarLogout={false}/>
      
      <div className={styles.content}>
        <div className={styles.titleContainer}>
          <div className={styles.accentBar}></div>
          <h1 className={styles.title}>Cadastro</h1>
        </div>

        <div className={styles.card} style={{ marginBottom: '40px' }}>
          {erro && <div className={styles.error}>{erro}</div>}

          <form onSubmit={handleCadastro}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome Completo</label>
              <input 
                type="text" 
                className={styles.input}
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                required 
              />
            </div>

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

            <div className={styles.formGroup}>
              <label className={styles.label}>Confirmar Senha</label>
              <input 
                type="password" 
                className={styles.input}
                value={confirmarSenha} 
                onChange={(e) => setConfirmarSenha(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" className={styles.button}>Cadastrar</button>
          </form>

          <p className={styles.footerText}>
            Já tem uma conta? <button onClick={() => navigate('/')} className={styles.link}>Faça Login</button>
          </p>
        </div>
      </div>
    </div>
  );
}