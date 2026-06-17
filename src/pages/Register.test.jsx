import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Register from './Register';

describe('Componente Register - Lógica Condicional', () => {

  it('Muestra campos de Persona por defecto', () => {
    render(
      <BrowserRouter>
        <Register setUser={vi.fn()} />
      </BrowserRouter>
    );

    // Debe existir el campo Nombre, Apellido y RUT normal
    expect(screen.getByLabelText(/Nombre:/i)).toBeDefined();
    expect(screen.getByLabelText(/Apellido:/i)).toBeDefined();
    
    // No debe existir Razón Social
    const razonSocialInput = screen.queryByLabelText(/Razón Social:/i);
    expect(razonSocialInput).toBeNull();
  });

  it('Cambia a campos de Empresa al seleccionar el Radio Button', () => {
    render(
      <BrowserRouter>
        <Register setUser={vi.fn()} />
      </BrowserRouter>
    );

    // Simulamos el clic del usuario en "Empresa"
    const radioEmpresa = screen.getByLabelText(/Empresa/i);
    fireEvent.click(radioEmpresa);

    // Ahora debe existir Razón Social y RUT Empresa
    expect(screen.getByLabelText(/Razón Social:/i)).toBeDefined();
    expect(screen.getByLabelText(/RUT Empresa:/i)).toBeDefined();

    // Ya no debe existir el campo Apellido
    const apellidoInput = screen.queryByLabelText(/Apellido:/i);
    expect(apellidoInput).toBeNull();
  });
});