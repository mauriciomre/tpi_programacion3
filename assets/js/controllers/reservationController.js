import { roomService, reservationService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
// Asumiendo que SweetAlert (Swal) está disponible globalmente o importado en tu HTML

export function reservationController() {
    const usuarioActual = getActualUser(); // Obtenemos el usuario logueado

    // 1. SELECTORES DE ELEMENTOS HTML
    // NOTA: Usamos 'input' dentro de los IDs del datepicker para obtener el valor de la fecha.
    const fechaEntradaInput = document.querySelector("#reservationdatein input"); 
    const fechaSalidaInput = document.querySelector("#reservationdateout input"); 
    const buscarHabitacionesBtn = document.querySelector("#buscarHabitaciones");
    const habitacionesContainer = document.querySelector("#habitacionesDisponiblesContainer"); 


    // ----------------------------------------------------------------------
    // 2. LÓGICA DE BÚSQUEDA Y FILTRADO DE HABITACIONES
    // ----------------------------------------------------------------------

    buscarHabitacionesBtn.addEventListener("click", async () => {
        
        if (!usuarioActual) {
            Swal.fire('Acceso denegado', 'Debes iniciar sesión para realizar una reserva.', 'error');
            window.location.href = '#/login';
            return;
        }

        // El .value ya tendrá el formato 'YYYY-MM-DD' si el datepicker funciona bien.
        const checkIn = fechaEntradaInput.value;
        const checkOut = fechaSalidaInput.value;
        habitacionesContainer.innerHTML = ''; // Limpiar resultados anteriores

        if (!checkIn || !checkOut || checkIn >= checkOut) {
            Swal.fire('Error de fechas', 'Selecciona una fecha de Check-In válida y una fecha de Check-Out posterior.', 'warning');
            return;
        }
        
        // Función auxiliar para verificar si dos periodos de tiempo se solapan
        function seSolapan(aInicio, aFin, bInicio, bFin) {
            // El solapamiento existe si A no termina antes de que B empiece Y B no termina antes de que A empiece.
            return !(aFin <= bInicio || aInicio >= bFin);
        }

        try {
            const allRooms = await roomService.getAll();
            const allReservations = await reservationService.getAll();

            const disponibles = allRooms.filter((hab) => {
                // 1. Descartar habitaciones no marcadas como disponibles
                if (hab.disponible !== true) { 
                    return false;
                }

                // 2. Revisar si esta habitación tiene una reserva que se solape
                const reservada = allReservations.some((res) => {
                    // Si la reserva no es para esta habitación, ignorar
                    if (parseInt(res.roomId) != parseInt(hab.id)) return false; 
                    
                    const resIn = new Date(res.checkIn);
                    const resOut = new Date(res.checkOut);
                    const inDate = new Date(checkIn);
                    const outDate = new Date(checkOut);
                    
                    // Verificar solapamiento
                    return seSolapan(inDate, outDate, resIn, resOut);
                });

                return !reservada; // Si NO está reservada, es disponible
            });
            
            mostrarHabitacionesDisponibles(disponibles, checkIn, checkOut);

        } catch (error) {
            Swal.fire('Error', 'No se pudieron cargar las habitaciones.', 'error');
            console.error(error);
        }
    });


    // ----------------------------------------------------------------------
    // 3. RENDERIZADO DE RESULTADOS Y EVENTO DE SELECCIÓN
    // ----------------------------------------------------------------------

    function mostrarHabitacionesDisponibles(habitaciones, checkIn, checkOut) {
        if (habitaciones.length === 0) {
            habitacionesContainer.innerHTML = '<div class="alert alert-info">No encontramos habitaciones disponibles para esas fechas.</div>';
            return;
        }

        habitacionesContainer.innerHTML = `<h4 class="mt-4">Resultados disponibles (${habitaciones.length}):</h4>`;
        
        habitaciones.forEach((hab) => {
            // Calcular días y total
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const dias = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
            const costoTotal = dias * hab.precio;

            habitacionesContainer.innerHTML += `
                <div class="card mb-3">
                    <div class="card-body">
                        <h5 class="card-title">${hab.tipo} (ID: ${hab.id})</h5>
                        <p class="card-text">Precio por noche: <strong>$${hab.precio}</strong></p>
                        <p class="card-text">Total por ${dias} noches: <strong>$${costoTotal}</strong></p>
                        
                        <button class="btn btn-primary btnSeleccionarHabitacion" 
                                data-room-id="${hab.id}">
                            Seleccionar y Reservar
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Agregar listener para el botón "Seleccionar y Reservar"
        document.querySelectorAll(".btnSeleccionarHabitacion").forEach(button => {
            button.addEventListener("click", (e) => {
                const roomId = e.target.dataset.roomId;
                
                prepararYConfirmarReserva(roomId, checkIn, checkOut); 
            });
        });
    }

    // ----------------------------------------------------------------------
    // 4. LÓGICA DE CREACIÓN DE RESERVA
    // ----------------------------------------------------------------------

    async function prepararYConfirmarReserva(roomId, checkIn, checkOut) {
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const dias = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        
        const room = await roomService.getById(roomId);
        const costoTotal = dias * room.precio;

        Swal.fire({
            title: `Confirmar Reserva: ${room.tipo}`,
            html: `
                <p>Usuario: <strong>${usuarioActual.nombre}</strong></p>
                <p>Fechas: <strong>${checkIn}</strong> al <strong>${checkOut}</strong></p>
                <p>Días: <strong>${dias}</strong></p>
                <p>Costo Total Estimado: <strong>$${costoTotal}</strong></p>
                <p class="text-warning">Su reserva se creará en estado **PENDIENTE**.</p>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Confirmar Reserva',
            cancelButtonText: 'Cancelar',
        }).then(async (result) => {
            if (result.isConfirmed) {
                await crearReserva(roomId, checkIn, checkOut);
            }
        });
    }

    async function crearReserva(roomId, checkIn, checkOut) {
        try {
            const nuevaReserva = {
                // CLAVE: El userId SIEMPRE viene de la sesión
                userId: parseInt(usuarioActual.id), 
                roomId: parseInt(roomId),
                checkIn: checkIn,
                checkOut: checkOut,
                estado: "pendiente",
            };
            
            await reservationService.create(nuevaReserva);

            Swal.fire({
                icon: "success",
                title: "¡Reserva Creada!",
                text: "Tu reserva está pendiente de confirmación. ¡Redirigiendo a Mis Reservas!",
                confirmButtonText: "Aceptar",
            }).then(() => {
                // Redirigir a "Mis Reservas" para que el usuario pueda verla
                window.location.href = "#/misreservas";
            });

        } catch (error) {
            Swal.fire("Error", "No se pudo completar la reserva. Intenta de nuevo.", "error");
            console.error("Error al crear reserva:", error);
        }
    }
}