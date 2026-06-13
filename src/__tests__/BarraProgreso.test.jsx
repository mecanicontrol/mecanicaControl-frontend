import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import BarraProgreso from '../components/agendamiento/BarraProgreso'

describe('BarraProgreso', () => {

  // Caso 1: paso=1 → solo el paso 1 tiene bg-orange-500, resto bg-gray-200
  test('paso=1: solo el primer indicador tiene estilo activo', () => {
    const { container } = render(<BarraProgreso paso={1} />)

    // Los tres labels deben estar en pantalla
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.getByText('Confirmar')).toBeInTheDocument()
    expect(screen.getByText('Pago')).toBeInTheDocument()

    // El número 1 debe estar en un div naranja
    const circulos = container.querySelectorAll('.w-10.h-10')
    expect(circulos[0].className).toContain('bg-orange-500')
    expect(circulos[1].className).toContain('bg-gray-200')
    expect(circulos[2].className).toContain('bg-gray-200')
  })

  // Caso 2: paso=2 → pasos 1 y 2 activos, paso 3 inactivo
  test('paso=2: pasos 1 y 2 tienen estilo activo, paso 3 no', () => {
    const { container } = render(<BarraProgreso paso={2} />)

    const circulos = container.querySelectorAll('.w-10.h-10')
    expect(circulos[0].className).toContain('bg-orange-500')
    expect(circulos[1].className).toContain('bg-orange-500')
    expect(circulos[2].className).toContain('bg-gray-200')
  })

  // Caso 3: paso=3 → todos activos
  test('paso=3: los tres pasos tienen estilo activo', () => {
    const { container } = render(<BarraProgreso paso={3} />)

    const circulos = container.querySelectorAll('.w-10.h-10')
    expect(circulos[0].className).toContain('bg-orange-500')
    expect(circulos[1].className).toContain('bg-orange-500')
    expect(circulos[2].className).toContain('bg-orange-500')
  })

  // Caso 4: valor por defecto paso=1
  test('sin prop paso se muestra paso 1 por defecto', () => {
    const { container } = render(<BarraProgreso />)
    const circulos = container.querySelectorAll('.w-10.h-10')
    expect(circulos[0].className).toContain('bg-orange-500')
    expect(circulos[1].className).toContain('bg-gray-200')
  })

  // Caso extra: los números 1, 2 y 3 están visibles en pantalla
  test('muestra los números 1, 2 y 3 en los indicadores', () => {
    render(<BarraProgreso paso={1} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})
