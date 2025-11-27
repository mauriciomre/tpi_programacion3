import { reservationService, roomService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
import { formatearFecha } from "../utils/date-init.js";

async function cancelarReserva(reservationId) {
    const resultado = await Swal.fire({
        title: "¿Estás seguro?",
        text: "¡No podrás revertir esta cancelación! El estado cambiará a CANCELADO.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: '#DC3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No, mantener"
    });
    if (!resultado.isConfirmed) {
        return;
    }

    try {
        await reservationService.update(reservationId, { estado: 'Cancelada' });
        Swal.fire({
            icon: "success",
            title: "CANCELADA",
            text: "Reserva cancelada correctamente.",
            confirmButtonText: "Aceptar",
        });

        // Recargar la vista 
        await renderMiReservaView();

    } catch (error) {
        console.error('Error al cancelar la reserva:', error);
        Swal.fire({
            icon: "error",
            title: "Cancelación fallida",
            text: "Hubo un error al intentar cancelar la reserva. Por favor, inténtalo de nuevo.",
            confirmButtonText: "Aceptar",
        });
    }
}

// Event listener para cancelar
async function manejoBotonCancel(e) {
    const cancelBtn = e.target.closest('.btnCancelar');
    if (!cancelBtn) return;

    const reservationId = cancelBtn.dataset.id;
    await cancelarReserva(reservationId);
}

// Logout
function manejoBotonLogout() {
    localStorage.removeItem('usuarioActual');
    window.location.href = '#/login';
}

//Manejo de eventos
function setupEventListeners() {
    const tbody = document.querySelector("#tbodyMisReservas");
    const logoutBtn = document.querySelector("#logoutBtn");

    // Remover listeners anteriores
    tbody.removeEventListener('click', manejoBotonCancel);
    if (logoutBtn) {
        logoutBtn.removeEventListener('click', manejoBotonLogout);
    }
    // Configurar el listener de Cancelación
    tbody.addEventListener('click', manejoBotonCancel);

    // Configurar el listener de Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', manejoBotonLogout);
    }
}

function waitForElement(selector) {
    return new Promise(resolve => {
        // 1. Intentar encontrarlo de inmediato
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }

        // 2. Si no existe, configurar el observador
        const observer = new MutationObserver((mutationsList, observer) => {
            const foundElement = document.querySelector(selector);
            if (foundElement) {
                // Si el elemento aparece, detener la observación y resolver
                observer.disconnect();
                resolve(foundElement);
            }
        });

        // Observar el cuerpo del documento para cualquier cambio en los hijos
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

export function renderMiReservaView() {
    console.log('Renderizando Reservas');


    (async () => {

        const tbody = await waitForElement("#tbodyMisReservas");
        const usuarioActual = getActualUser();
        if (!usuarioActual) {
            Swal.fire({
                icon: "warning",
                title: "INICIA SESIÓN",
                text: "No hay usuario logueado.",
                confirmButtonText: "Aceptar",
            });
            window.location.href = '#/login';
            return;
        }

        // Mostrar mensaje de carga
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">Cargando tus reservas...</td></tr>';

        try {
            // Obtener reservas
            const allReservations = await reservationService.getAll();
            const miReserva = allReservations.filter(reservation => String(reservation.userId) === String(usuarioActual.id));

            console.log('Total reservas del usuario:', miReserva.length);

            // Obtener todas las habitaciones
            const allRooms = await roomService.getAll();

            // Limpiar tbody antes de insertar resultados
            tbody.innerHTML = '';

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
                setupEventListeners();
                return;
            }

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

        setupEventListeners();
    })();
}

