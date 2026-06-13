import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TabCrearCuenta from '../components/agendamiento/TabCrearCuenta'

// Mockear el cliente axios para no hacer peticiones reales
vi.mock('../api/axiosInstance', () => ({
  default: {
    post: vi.fn(),
  },
}))

import api from '../api/axiosInstance'

const renderTab = (vehiculo = null) =>
  render(
    <MemoryRouter>
      <TabCrearCuenta onContinuar={vi.fn()} vehiculo={vehiculo} />
    </MemoryRouter>
  )

describe('TabCrearCuenta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Caso 1: formulario vacío → botón de crear cuenta deshabilitado
  test('formulario vacío tiene el botón de registro deshabilitado', () => {
    renderTab()
    // El botón que contiene "Crear cuenta" o similar debe estar disabled
    const boton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(boton).toBeDisabled()
  })

  // Caso 2: passwords que no coinciden → botón deshabilitado
  test('passwords distintas dejan el botón deshabilitado', async () => {
    const user = userEvent.setup()
    renderTab()

    await user.type(screen.getByPlaceholderText(/Ej: José/i), 'Juan')
    await user.type(screen.getByPlaceholderText(/Ej: Galvez/i), 'Pérez')
    await user.type(screen.getByPlaceholderText(/jose@correo/i), 'juan@test.com')
    await user.type(screen.getByPlaceholderText(/\+56/i), '+56912345678')

    const inputs = screen.getAllByDisplayValue('')
    // Ingresar password y repetir distintas
    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'Admin123!')
    await user.type(passwordInputs[1], 'OtraPass!')

    const boton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(boton).toBeDisabled()
  })

  // Caso 3: passwords iguales y todos los campos → botón habilitado
  test('formulario completo con passwords iguales habilita el botón', async () => {
    const user = userEvent.setup()
    renderTab()

    await user.type(screen.getByPlaceholderText(/Ej: José/i), 'Juan')
    await user.type(screen.getByPlaceholderText(/Ej: Galvez/i), 'Pérez')
    await user.type(screen.getByPlaceholderText(/jose@correo/i), 'juan@test.com')
    await user.type(screen.getByPlaceholderText(/\+56/i), '+56912345678')

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'Admin123!')
    await user.type(passwordInputs[1], 'Admin123!')

    const boton = screen.getByRole('button', { name: /crear cuenta/i })
    expect(boton).not.toBeDisabled()
  })

  // Caso 4: submit exitoso → muestra panel de "Revisa tu correo"
  test('submit exitoso muestra confirmación de email enviado', async () => {
    api.post.mockResolvedValue({ data: {} })
    const user = userEvent.setup()
    renderTab()

    await user.type(screen.getByPlaceholderText(/Ej: José/i), 'Juan')
    await user.type(screen.getByPlaceholderText(/Ej: Galvez/i), 'Pérez')
    await user.type(screen.getByPlaceholderText(/jose@correo/i), 'juan@test.com')
    await user.type(screen.getByPlaceholderText(/\+56/i), '+56912345678')

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'Admin123!')
    await user.type(passwordInputs[1], 'Admin123!')

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/casi listo/i)).toBeInTheDocument()
    })

    expect(api.post).toHaveBeenCalledWith(
      '/api/auth/register-con-vehiculo',
      expect.objectContaining({ email: 'juan@test.com' })
    )
  })

  // Caso 5: error del API → muestra mensaje de error
  test('error del API muestra mensaje de error en pantalla', async () => {
    api.post.mockRejectedValue({
      response: { data: { message: 'El email ya está registrado' } },
    })
    const user = userEvent.setup()
    renderTab()

    await user.type(screen.getByPlaceholderText(/Ej: José/i), 'Juan')
    await user.type(screen.getByPlaceholderText(/Ej: Galvez/i), 'Pérez')
    await user.type(screen.getByPlaceholderText(/jose@correo/i), 'juan@test.com')
    await user.type(screen.getByPlaceholderText(/\+56/i), '+56912345678')

    const passwordInputs = document.querySelectorAll('input[type="password"]')
    await user.type(passwordInputs[0], 'Admin123!')
    await user.type(passwordInputs[1], 'Admin123!')

    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => {
      expect(screen.getByText(/El email ya está registrado/i)).toBeInTheDocument()
    })
  })
})
