import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Calendario from '../components/agendamiento/Calendario'

describe('Calendario', () => {
  let onSeleccionarMock

  beforeEach(() => {
    onSeleccionarMock = vi.fn()
  })

  // Caso 1: días pasados tienen atributo disabled
  test('días anteriores a hoy están deshabilitados', () => {
    render(<Calendario fechaSeleccionada={null} onSeleccionar={onSeleccionarMock} />)

    const botones = screen.getAllByRole('button', { hidden: false })
      .filter(b => b.disabled && b.textContent.match(/^\d+$/))

    // Al menos los días pasados del mes actual deben estar deshabilitados
    // (si hoy es después del día 1)
    const hoy = new Date()
    if (hoy.getDate() > 1) {
      expect(botones.length).toBeGreaterThan(0)
    }
  })

  // Caso 2: click en día futuro llama onSeleccionar con la fecha
  test('click en día futuro llama onSeleccionar con la fecha correcta', () => {
    render(<Calendario fechaSeleccionada={null} onSeleccionar={onSeleccionarMock} />)

    // Avanzar al mes siguiente para asegurar días futuros
    const btnSiguiente = screen.getByText('›')
    fireEvent.click(btnSiguiente)

    // Clicar el primer día disponible del siguiente mes
    const botonesHabilitados = screen.getAllByRole('button')
      .filter(b => !b.disabled && b.textContent.match(/^[1-9]\d?$/))

    if (botonesHabilitados.length > 0) {
      fireEvent.click(botonesHabilitados[0])
      expect(onSeleccionarMock).toHaveBeenCalledTimes(1)
      expect(onSeleccionarMock).toHaveBeenCalledWith(expect.any(Date))
    }
  })

  // Caso 3: click en día deshabilitado NO llama onSeleccionar
  test('click en día pasado no llama onSeleccionar', () => {
    render(<Calendario fechaSeleccionada={null} onSeleccionar={onSeleccionarMock} />)

    const botonesPasados = screen.getAllByRole('button')
      .filter(b => b.disabled && b.textContent.match(/^\d+$/))

    if (botonesPasados.length > 0) {
      fireEvent.click(botonesPasados[0])
      expect(onSeleccionarMock).not.toHaveBeenCalled()
    }
  })

  // Caso 4: navegación de meses funciona correctamente
  test('botón › avanza al mes siguiente', () => {
    render(<Calendario fechaSeleccionada={null} onSeleccionar={onSeleccionarMock} />)

    const hoy = new Date()
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
    const mesActual = meses[hoy.getMonth()]
    expect(screen.getByText(new RegExp(mesActual))).toBeInTheDocument()

    fireEvent.click(screen.getByText('›'))

    const mesSiguiente = meses[(hoy.getMonth() + 1) % 12]
    expect(screen.getByText(new RegExp(mesSiguiente))).toBeInTheDocument()
  })

  // Caso 5: día seleccionado muestra clase de seleccionado
  test('día seleccionado tiene estilo bg-orange-500', () => {
    const manana = new Date()
    manana.setDate(manana.getDate() + 1)

    const { container } = render(
      <Calendario fechaSeleccionada={manana} onSeleccionar={onSeleccionarMock} />
    )

    const botonSeleccionado = container.querySelector('.bg-orange-500.text-white')
    expect(botonSeleccionado).toBeInTheDocument()
  })
})
