import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RutaProtegida from '../components/shared/RutaProtegida'

// Mockear useAuth para controlar el estado de autenticación en cada test
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'

const renderProtegida = (rolesPermitidos, mockUsuario, mockAuthListo) => {
  useAuth.mockReturnValue({ usuario: mockUsuario, authListo: mockAuthListo })
  return render(
    <MemoryRouter>
      <RutaProtegida rolesPermitidos={rolesPermitidos}>
        <div>Contenido protegido</div>
      </RutaProtegida>
    </MemoryRouter>
  )
}

describe('RutaProtegida', () => {
  beforeEach(() => vi.clearAllMocks())

  // Caso 1: sin usuario → no muestra contenido (redirige a /login)
  test('sin usuario redirige a /login y no muestra children', () => {
    renderProtegida(['ADMIN'], null, true)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  // Caso 2: rol correcto → renderiza children
  test('usuario con rol correcto ve el contenido protegido', () => {
    renderProtegida(['ADMIN'], { rol: 'ADMIN', nombre: 'Admin Test' }, true)
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  // Caso 3: rol incorrecto → no muestra contenido (redirige a /)
  test('usuario con rol incorrecto no ve el contenido protegido', () => {
    renderProtegida(['ADMIN'], { rol: 'CLIENTE', nombre: 'Cliente Test' }, true)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  // Caso 4: authListo=false → no redirige prematuramente (devuelve null)
  test('con authListo=false no renderiza nada (espera carga)', () => {
    renderProtegida(['ADMIN'], null, false)
    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument()
  })

  // Caso extra: cliente puede acceder a rutas de cliente
  test('cliente accede a ruta permitida para CLIENTE', () => {
    renderProtegida(['CLIENTE', 'ADMIN'], { rol: 'CLIENTE', nombre: 'Jose' }, true)
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })
})
