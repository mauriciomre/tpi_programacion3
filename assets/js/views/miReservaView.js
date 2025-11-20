import { reservationService, roomService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";

export async function renderMiReservaView() {



    console.log('Renderizando Reservas');

    const usuarioActual = getActualUser();
    if (!usuarioActual) {
        alert('Debes iniciar sesion.');
        window.location.href = '#/login';
        return;
    }

    // elementos del DOM
    const tbody = document.querySelector("#tbodyMisReservas");
    const loaderDiv = document.querySelector("#loaderReservas");
    const emptyMessage = document.querySelector("#emptyMessage");
    const logoutBtn = document.querySelector("#logoutBtn");

    if (loaderDiv) loaderDiv.style.display = 'block';
    if (emptyMessage) emptyMessage.style.display = 'none'; 
    tbody.innerHTML = '';

    try {
        const allReservations = await reservationService.getAll();

        const miReserva = allReservations.filter(reservation => reservation.userId === usuarioActual.id); // 
        if (loaderDiv) loaderDiv.style.display = 'block';

        if (miReserva.length === 0) {
            if (emptyMessage) {
                emptyMessage.style.display = 'none';
                emptyMessage.innerHTML = `
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle"></i>
                        No tienes reservas aún. ¡Reservá tu habitación!
                        <br><br>
                        <a href="#/reservations" class="btn btn-primary">
                            Ver Habitaciones Disponibles
                        </a>
                    </div>
                `;
            }
            return;
        }
        await mostrarReservas(miReserva, tbody); // 
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        if (loaderDiv) loaderDiv.style.display = 'none';
        alert('Error al cargar las reservas');
    }

    tbody.addEventListener('click', async (e) => {
        const cancelBtn = e.target.closest('.btnCancelar');
        if (!cancelBtn) return;

        const reservationId = cancelBtn.dataset.id;
        await cancelarReserva(reservationId, tbody);
    });

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('usuarioActual');
            window.location.href = '#/login';
        });
    }
}

// FUNCIÓN: Mostrar reservas en la tabla
async function mostrarReservas(reservations, tbody) {
    console.log('MOSTRAR RESERVAS - Inicio. Total:', reservations.length);
    tbody.innerHTML = '';
    
    // ✅ TRAER TODAS LAS HABITACIONES DE UNA SOLA VEZ
    console.log('Obteniendo todas las habitaciones...');
    const allRooms = await roomService.getAll();
    console.log('Habitaciones obtenidas:', allRooms);
    
    // Para cada reserva
    for (const reservation of reservations) {
        try {
            console.log('Procesando reserva:', reservation.id);
            
            // ✅ BUSCAR la habitación en el array (sin hacer otra petición)
            const room = allRooms.find(r => r.id === reservation.roomId);
            console.log('Room encontrada:', room);
            
            // Determinar el color según el estado
            let estadoBadge = '';
            switch(reservation.estado) {
                case 'pendiente':
                    estadoBadge = '<span class="badge badge-warning">Pendiente</span>';
                    break;
                case 'confirmada':
                case 'confirmado': // ← AGREGÁ ESTO (en tu JSON dice "confirmado")
                    estadoBadge = '<span class="badge badge-success">Confirmada</span>';
                    break;
                case 'cancelada':
                case 'cancelado':
                    estadoBadge = '<span class="badge badge-danger">Cancelada</span>';
                    break;
                case 'completada':
                case 'completado':
                    estadoBadge = '<span class="badge badge-info">Completada</span>';
                    break;
                default:
                    estadoBadge = `<span class="badge badge-secondary">${reservation.estado}</span>`;
            }
            
            // Calcular total de días
            const checkIn = new Date(reservation.checkIn);
            const checkOut = new Date(reservation.checkOut);
            const dias = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
            const total = dias * (room?.precio || 0);
            
            // Botón de cancelar (solo si no está cancelada o completada)
            let btnCancelar = '';
            if (reservation.estado === 'pendiente' || reservation.estado === 'confirmada' || reservation.estado === 'confirmado') {
                btnCancelar = `
                    <button class="btn btn-sm btn-danger btnCancelar" data-id="${reservation.id}">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                `;
            }
            
            // Agregar fila a la tabla
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
                    <td>
                        ${btnCancelar}
                    </td>
                </tr>
            `;
            
        } catch (error) {
            console.error('Error al procesar reserva:', error);
        }
    }
    
    console.log('MOSTRAR RESERVAS - Fin');
}
 
//Cancelar Reserva
async function cancelarReserva(reservationId, tbody) {
    // Confirmar con SweetAlert
    const result = await Swal.fire({
        title: '¿Cancelar reserva?',
        text: "Esta acción no se puede deshacer",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No, mantener'
    });
    
    if (!result.isConfirmed) return;
    
    try {
        // Cambiar estado a "cancelada" usando la función cancel()
        await reservationService.cancel(reservationId);
        
        Swal.fire(
            '¡Cancelada!',
            'Tu reserva ha sido cancelada.',
            'success'
        );
        
        // Recargar la vista
        renderMiReservaView(); // 
        
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        Swal.fire(
            'Error',
            'No se pudo cancelar la reserva',
            'error'
        );
    }
}

//Modificar Fecha
function formatearFecha(fechaString) {
    const fecha = new Date(fechaString);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
}