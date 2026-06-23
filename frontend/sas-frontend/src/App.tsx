import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import GerenciarSalas from './pages/GerenciarSalas';
import GerenciarRecursos from './pages/GerenciarRecursos';
import GerenciarUsuarios from './pages/GerenciarUsuarios';
import GerenciarExcecoes from './pages/GerenciarExcecoes';
import DashboardUsuario from './pages/DashboardUsuario';
import MeusAgendamentos from './pages/MeusAgendamentos';
import GerenciarAgendamentos from './pages/GerenciarAgendamentos';

const RotaProtegida = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('sas_token');
  return token ? children : <Navigate to="/" />;
};
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <Login />} 
        />
        <Route 
          path="/cadastro" 
          element={
            <Cadastro />} 
          />
        <Route
          path="/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />
        <Route
          path="/dashboard/gerenciar-salas"
          element={
            <RotaProtegida>
              <GerenciarSalas />
            </RotaProtegida>
          }
        />
        <Route 
          path="/dashboard/recursos" 
          element={
            <RotaProtegida>
              <GerenciarRecursos />
            </RotaProtegida>
          }
        />
        <Route 
          path="/dashboard/excecoes" 
          element={
            <RotaProtegida>
              <GerenciarExcecoes />
            </RotaProtegida>
          }
        />
        <Route 
          path="/dashboard/usuarios" 
          element={
            <RotaProtegida>
              <GerenciarUsuarios />
            </RotaProtegida>
          }
        />
        <Route 
          path="/dashboard/usuario" 
          element={
            <RotaProtegida>
              <DashboardUsuario />
            </RotaProtegida>
          }
        />
        <Route 
          path="/meus-agendamentos" 
          element={
            <RotaProtegida>
              <MeusAgendamentos />
            </RotaProtegida>
          } 
        />
        <Route
          path="/dashboard/agendamentos"
          element={
            <RotaProtegida>
              <GerenciarAgendamentos />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}