import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from './Login';

describe('Componente Login', () => {

  it('Renderiza los campos de email y contraseña correctamente', () => {
    render(
      <BrowserRouter>
        <Login setUser={vi.fn()} />
      </BrowserRouter>
    );

    // Verifica que existan los inputs principales
    const emailInput = screen.getByLabelText(/Usuario \(Correo\):/i);
    const passwordInput = screen.getByLabelText(/Contraseña:/i);
    const botonEntrar = screen.getByRole('button', { name: /Entrar/i });

    expect(emailInput).toBeDefined();
    expect(passwordInput).toBeDefined();
    expect(botonEntrar).toBeDefined();
  });

  it('Permite escribir en los inputs', () => {
    render(
      <BrowserRouter>
        <Login setUser={vi.fn()} />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Usuario \(Correo\):/i);
    fireEvent.change(emailInput, { target: { value: 'admin@donaton.cl' } });
    
    expect(emailInput.value).toBe('admin@donaton.cl');
  });
});