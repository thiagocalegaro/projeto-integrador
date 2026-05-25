import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, User } from 'lucide-react';
import Header from '../components/Header';
import styles from './GerenciarUsuarios.module.css';
import { api } from '../services/api';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'admin' | 'user';
}

export default function GerenciarUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [busca, setBusca] = useState('');
  const [isModalAberto, setIsModalAberto] = useState(false);

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [tipo, setTipo] = useState<'admin' | 'user'>('user');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function carregarUsuarios() {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(response.data);
    } catch (err) {
      console.error('Erro ao buscar usuários', err);
    }
  }

  function handleAbrirCriar() {
    setIdEditando(null);
    setNome('');
    setEmail('');
    setSenha('');
    setTipo('user');
    setIsModalAberto(true);
  }

  function handleAbrirEditar(u: Usuario) {
    setIdEditando(u.id);
    setNome(u.nome);
    setEmail(u.email);
    setSenha(''); 
    setConfirmarSenha('');
    setTipo(u.tipo);
    setIsModalAberto(true);
  }

  async function handleSalvar(e: React.FormEvent) {
  e.preventDefault();

  if (senha !== confirmarSenha) {
    alert('As senhas não coincidem!');
    return;
  }

  const payload: any = {
    nome,
    email,
    tipo,
    senha,
    confirmar_senha: confirmarSenha 
  };

  try {
    if (idEditando) {
      await api.patch(`/usuarios/${idEditando}`, payload);
    } else {
      await api.post('/usuarios', payload);
    }
    setIsModalAberto(false);
    carregarUsuarios();
  } catch (err: any) {
    console.log('ERRO DETALHADO:', err.response?.data);
    alert(err.response?.data?.message || 'Erro ao salvar usuário');
  }
}

  async function handleDeletar(id: number) {
    if (window.confirm('Excluir este usuário permanentemente?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        carregarUsuarios();
      } catch (err) {
        alert('Erro ao deletar usuário.');
      }
    }
  }

  const usuariosFiltrados = usuarios.filter(u => 
    u.nome.toLowerCase().includes(busca.toLowerCase()) || 
    u.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.titulo}>Gerenciar Usuários</h1>

        <div className={styles.actionRow}>
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Buscar por nome ou e-mail..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <Search className={styles.searchIcon} size={18} />
          </div>

          <button onClick={handleAbrirCriar} className={styles.addButton}>
            Novo Usuário <Plus size={18} />
          </button>
        </div>

        <div className={styles.listContainer}>
          {usuariosFiltrados.map(user => (
            <div key={user.id} className={styles.userCard}>
              <div className={styles.userInfo}>
                <h3>{user.nome}</h3>
                <p>{user.email}</p>
                <span className={`${styles.userBadge} ${user.tipo === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>
                  {user.tipo === 'admin' ? 'Administrador' : 'Comum'}
                </span>
              </div>

              <div className={styles.actionIcons}>
                <button onClick={() => handleAbrirEditar(user)} className={styles.iconBtn}>
                  <Edit className={styles.editIcon} size={20} />
                </button>
                <button onClick={() => handleDeletar(user.id)} className={styles.iconBtn}>
                  <Trash2 className={styles.deleteIcon} size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {isModalAberto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setIsModalAberto(false)} className={styles.closeModal}>
              <X size={24} />
            </button>
            <h2 className={styles.modalTitle}>{idEditando ? 'Editar Usuário' : 'Criar Usuário'}</h2>
            
            <form onSubmit={handleSalvar}>
              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Nome:</label>
                <input type="text" className={styles.modalInput} value={nome} onChange={e => setNome(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>E-mail:</label>
                <input type="email" className={styles.modalInput} value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Senha {idEditando && '(deixe em branco para manter)'}:</label>
                <input type="password" className={styles.modalInput} value={senha} onChange={e => setSenha(e.target.value)} required={!idEditando} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Confirmar Senha:</label>
                <input type="password" className={styles.modalInput} value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required={!idEditando} />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.modalLabel}>Tipo de Acesso:</label>
                <select className={styles.modalInput} value={tipo} onChange={e => setTipo(e.target.value as any)}>
                  <option value="user">Usuário Comum</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button type="submit" className={styles.saveButton}>Salvar Usuário</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}