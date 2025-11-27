import { roomService, reservationService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
import { parsearFechaLocalizada, validarRangoFechas, initDatePickers } from "../utils/date-init.js";
import { haySolapamiento, calcularNoches, getHabitacionesDisponibles } from "../utils/disponibilidad.js";
import { generateRoomCardHTML } from "../utils/cardGenerator.js";

export function reservationController() {

    console.log('✅ Controlador de Reservas Inicializado.');

    const buscarHabitacionesBtn = document.querySelector("#buscarHabitaciones");
    const contenedor = document.querySelector("#habitacionesDisponiblesContainer");

    buscarHabitacionesBtn.addEventListener("click", async () => {

        let fechaEntrada = '';
        let fechaSalida = '';

        try {
            const fechaInMoment = $('#reservationdatein').data('datetimepicker').date();
            const fechaOutMoment = $('#reservationdateout').data('datetimepicker').date();

            fechaEntrada = fechaInMoment ? fechaInMoment.format('L') : '';
            fechaSalida = fechaOutMoment ? fechaOutMoment.format('L') : '';
        } catch (e) {
            // Evitar errores si el datetimepicker no está listo
            console.error("Error al obtener la fecha del picker, usando input.value como fallback.", e);
            fechaEntrada = document.querySelector('#reservationdatein input').value;
            fechaSalida = document.querySelector('#reservationdateout input').value;
        }
        console.log(`🔎 Fechas de búsqueda: Entrada: ${fechaEntrada}, Salida: ${fechaSalida}`);

        //Valida rangos
        const validacion = validarRangoFechas(fechaEntrada, fechaSalida);

        if (!validacion.isValid) {
            console.warn(`❌ Validación fallida: ${validacion.errorMsg}`);
            contenedor.innerHTML = `
                <div class="alert alert-danger text-center fw-bold">
                    ${validacion.errorMsg}
                </div>`;
            limpiarYResetearFechas();
            return;
        }

        const checkInISO = validacion.checkInISO;
        const checkOutISO = validacion.checkOutISO;
        console.log(`✅ Rango válido. ISO: ${checkInISO} a ${checkOutISO}`);

        contenedor.innerHTML = "";

        // Filtrar disponibles
        let disponibles = await getHabitacionesDisponibles(checkInISO, checkOutISO);
        console.log('🏠 Habitaciones disponibles encontradas:', disponibles);

        if (disponibles.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-warning text-center fw-bold">
                    ⛔ No hay habitaciones disponibles para esas fechas
                </div>`;
            limpiarYResetearFechas();
            return;
        }

        //Inicio de tabla con estilos
        let tabla = `
        <div class="card card-personalizada card-outline">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-bed"></i>Habitaciones disponibles</h3>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead class="thead cabecera">
                            <tr>
                                <th>ID</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>`;

        // Carga tabla
        disponibles.forEach(hab => {
            tabla += `
                <tr>
                    <td>${hab.id}</td>
                    <td>${hab.tipo}</td>
                    <td><span class="badge bg-success">Disponible</span></td>
                    <td>
                        <button class="btn btn-outline-success btnSeleccionar" data-id="${hab.id}">
                            Seleccionar
                        </button>
                    </td>
                </tr>`;
        });

        //Cierre tabla y contenedor card
        tabla += `
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
        contenedor.innerHTML = tabla;

        // Activar selección
        document.querySelectorAll(".btnSeleccionar").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                const habitacion = disponibles.find(h => h.id == id);
                console.log('👉 Habitación seleccionada para reserva:', habitacion);

                mostrarHabitacionSeleccionada(
                    habitacion,
                    fechaEntrada,
                    fechaSalida,
                    checkInISO,
                    checkOutISO
                );

                //Baja a la card
                const cont = document.querySelector("#habitacionSeleccionadaContainer");
                cont.scrollIntoView({ behavior: 'smooth', block: 'start' });

            });
        });

        function mostrarHabitacionSeleccionada(habitacion, fechaInLocal, fechaOutLocal, fechaInISO, fechaOutISO) {
            const cont = document.querySelector("#habitacionSeleccionadaContainer");

            const noches = calcularNoches(fechaInISO, fechaOutISO);
            const precioTotal = noches * habitacion.precio;

            //Opciones de reserva
            const opcionesReserva = {
                noches: noches,
                precioTotal: precioTotal,
                fechaInLocal: fechaInLocal,
                fechaOutLocal: fechaOutLocal,
            };

            // Pasa habitacion y opcionesReserva al generador de tarjeta
            cont.innerHTML = generateRoomCardHTML(habitacion, opcionesReserva);

            document.querySelector("#btnConfirmarReserva").addEventListener("click", async () => {
                await confirmarReserva(habitacion.id, fechaInISO, fechaOutISO);
            });
        }

        async function confirmarReserva(roomId, checkInISO, checkOutISO) {
            try {
                const user = getActualUser();
                if (!user) {
                    Swal.fire({
                        icon: "warning",
                        title: "INICIA SESIÓN",
                        text: "No hay usuario logueado.",
                        confirmButtonText: "Aceptar",
                    });
                    return;

                }

                const nuevaReserva = {
                    userId: user.id,
                    roomId,
                    checkIn: checkInISO,
                    checkOut: checkOutISO,
                    estado: "confirmado"
                };

                console.log('💾 Creando nueva reserva:', nuevaReserva);

                await reservationService.create(nuevaReserva);

                console.log('🎉 Reserva creada con éxito.');

                Swal.fire({
                    icon: "success",
                    title: "Reservación guardada",
                    text: "La reservación fue registrada correctamente.",
                    confirmButtonText: "Aceptar",
                });


                document.querySelector("#habitacionesDisponiblesContainer").innerHTML = "";
                document.querySelector("#habitacionSeleccionadaContainer").innerHTML = "";

            } catch (error) {
                console.error("🛑 Error al crear reserva:", error);
                Swal.fire({
                    icon: "error",
                    title: "Reserva Fallida",
                    text: "No se pudo confirmar la reserva.",
                    confirmButtonText: "Aceptar",
                });

            }
        }

    });

    //Limpia los valores de los inputs del datetimepicker
    function limpiarYResetearFechas() {
        console.log('🧹 Limpiando y reinicializando pickers.');
        // Borrar fechas cargadas
        try {
            $('#reservationdatein').datetimepicker('destroy');
            $('#reservationdateout').datetimepicker('destroy');
        } catch (e) {
            // Ignoramos el error si el datetimepicker no estaba inicializado
        }

        //Limpiar imputs
        $('#reservationdatein input').val('');
        $('#reservationdateout input').val('');

        // Reinicializa los pickers
        initDatePickers();
    }
}


