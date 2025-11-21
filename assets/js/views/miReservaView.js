import { reservationService, roomService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
import {formatearFecha} from "../utils/date-init.js";

export async function renderMiReservaView() {
    console.log('Renderizando Reservas');

    const usuarioActual = getActualUser();
    if (!usuarioActual) {
        alert('Debes iniciar sesion.');
        window.location.href = '#/login';
        return;
    }

    const tbody = document.querySelector("#tbodyMisReservas");
    const logoutBtn = document.querySelector("#logoutBtn");

    // Mostrar mensaje de carga
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Cargando tus reservas...</td></tr>';

    try {
        // Obtener reservas
        const allReservations = await reservationService.getAll();
        const miReserva = allReservations.filter(reservation => String(reservation.userId) === String(usuarioActual.id));

        console.log('Total reservas del usuario:', miReserva.length);

        // Si no hay reservas
        if (miReserva.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center">
                        <div class="alert alert-info m-3">
                            <i class="fas fa-info-circle"></i>
                            <h5>No tienes reservas aún</h5>
                            <p>¡Reservá tu habitación!</p>
                            <a href="#/reservas" class="btn btn-primary">
                                Ver Habitaciones Disponibles
                            </a>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        // Obtener todas las habitaciones
        const allRooms = await roomService.getAll();

        // Limpiar tbody
        tbody.innerHTML = '';

        // Mostrar cada reserva
        for (const reservation of miReserva) {
            const room = allRooms.find(r => String(r.id) === String(reservation.roomId));

            // Badge según estado
            let estadoBadge = '';
            const estado = reservation.estado.toLowerCase();
            if (estado === 'pendiente') {
                estadoBadge = '<span class="badge badge-warning">Pendiente</span>';
            } else if (estado === 'confirmada' || estado === 'confirmado') {
                estadoBadge = '<span class="badge badge-success">Confirmada</span>';
            } else if (estado === 'cancelada' || estado === 'cancelado') {
                estadoBadge = '<span class="badge badge-danger">Cancelada</span>';
            } else {
                estadoBadge = `<span class="badge badge-secondary">${reservation.estado}</span>`;
            }

            // Calcular días y total
            const checkIn = new Date(reservation.checkIn);
            const checkOut = new Date(reservation.checkOut);
            const dias = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const total = dias * (room?.precio || 0);

            // Botón cancelar
            let btnCancelar = '';
            if (estado === 'pendiente' || estado === 'confirmada' || estado === 'confirmado') {
                btnCancelar = `
                    <button class="btn btn-sm btn-danger btnCancelar" data-id="${reservation.id}">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                `;
            }

            // Agregar fila
            tbody.innerHTML += `
                <tr>
                    <td>${reservation.id}</td>
                    <td>${room?.tipo || 'N/A'}</td>
                    <td>${formatearFecha(reservation.checkIn)}</td>
                    <td>${formatearFecha(reservation.checkOut)}</td>
                    <td>${dias} día${dias > 1 ? 's' : ''}</td>
                    <td>$${room?.precio || 0}</td>
                    <td><strong>$${total}</strong></td>
                    <td>${estadoBadge}</td>
                    <td>${btnCancelar}</td>
                </tr>
            `;
        }

        console.log('Reservas mostradas correctamente');

    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger">
                    Error al cargar las reservas: ${error.message}
                </td>
            </tr>
        `;
    }

    // Event listener para cancelar
    tbody.addEventListener('click', async (e) => {
        const cancelBtn = e.target.closest('.btnCancelar');
        if (!cancelBtn) return;

        const reservationId = cancelBtn.dataset.id;
        await cancelarReserva(reservationId);
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('usuarioActual');
            window.location.href = '#/login';
        });
    }
}

