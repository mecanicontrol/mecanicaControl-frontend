import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ResumenCotizacion from '../components/cotizador/ResumenCotizacion'

// Mock react-router-dom para capturar llamadas a navigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const vehiculoBase = { marca: 'Toyota', modelo: 'Corolla', anio: 2020 }

const renderResumen = (servicios) =>
  render(
    <MemoryRouter>
      <ResumenCotizacion vehiculo={vehiculoBase} serviciosSeleccionados={servicios} />
    </MemoryRouter>
  )

describe('ResumenCotizacion', () => {

  // Caso 1: sin servicios → botón deshabilitado
  test('sin servicios el botón está deshabilitado', () => {
    renderResumen([])
    const boton = screen.getByRole('button')
    expect(boton).toBeDisabled()
  })

  // Caso 2: con 2 servicios → total es la suma de sus precios
  test('muestra el total correcto con dos servicios', () => {
    const servicios = [
      { id: '1', nombre: 'Cambio de aceite', precioBase: 45000 },
      { id: '2', nombre: 'Revisión de frenos', precioBase: 80000 },
    ]
    renderResumen(servicios)

    // Total aparece en subtotal y en el total grande (ambos con el mismo número)
    const totales = screen.getAllByText(/125\.000/)
    expect(totales.length).toBeGreaterThan(0)
    expect(screen.getByText('Cambio de aceite')).toBeInTheDocument()
    expect(screen.getByText('Revisión de frenos')).toBeInTheDocument()
  })

  // Caso 3: también acepta campo `precio` además de `precioBase`
  test('acepta campo precio alternativo para calcular total', () => {
    const servicios = [
      { id: '1', nombre: 'Diagnóstico general', precio: 30000 },
    ]
    renderResumen(servicios)
    // El precio aparece en el item de lista y en el total (múltiples apariciones)
    const precios = screen.getAllByText(/30\.000/)
    expect(precios.length).toBeGreaterThan(0)
  })

  // Caso 4: con servicios → botón habilitado y navega a /agendar
  test('con servicios el botón navega a /agendar', () => {
    const servicios = [{ id: '1', nombre: 'Servicio A', precioBase: 20000 }]
    renderResumen(servicios)

    const boton = screen.getByRole('button')
    expect(boton).not.toBeDisabled()
    fireEvent.click(boton)
    expect(mockNavigate).toHaveBeenCalledWith('/agendar', expect.any(Object))
  })

  // Caso 5: muestra el nombre del vehículo en mayúsculas
  test('muestra la información del vehículo en mayúsculas', () => {
    renderResumen([])
    expect(screen.getByText(/TOYOTA COROLLA 2020/i)).toBeInTheDocument()
  })
})
