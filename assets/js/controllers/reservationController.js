import { roomService, reservationService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
import { parsearFechaLocalizada, validarRangoFechas, initDatePickers } from "../utils/date-init.js";
import { haySolapamiento, calcularNoches, getHabitacionesDisponibles } from "../utils/disponibilidad.js";

export function reservationController() {

    const buscarHabitacionesBtn = document.querySelector("#buscarHabitaciones");
    const contenedor = document.querySelector("#habitacionesDisponiblesContainer");

    buscarHabitacionesBtn.addEventListener("click", async () => {

        const fechaEntrada = document.querySelector('#reservationdatein input').value;
        const fechaSalida = document.querySelector('#reservationdateout input').value;

        //Valida rangos
        const validacion = validarRangoFechas(fechaEntrada, fechaSalida);

        if (!validacion.isValid) {
            contenedor.innerHTML = `
                <div class="alert alert-danger text-center fw-bold">
                    ${validacion.errorMsg}
                </div>`;
            limpiarYResetearFechas();
            return;
        }

        const checkInISO = validacion.checkInISO;
        const checkOutISO = validacion.checkOutISO;

        contenedor.innerHTML = "";

        // Filtrar disponibles
        let disponibles = await getHabitacionesDisponibles(checkInISO, checkOutISO);

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
                        <thead class="thead">
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

                mostrarHabitacionSeleccionada(
                    habitacion,
                    fechaEntrada,
                    fechaSalida,
                    checkInISO,
                    checkOutISO
                );
            });
        });

        function mostrarHabitacionSeleccionada(habitacion, fechaInLocal, fechaOutLocal, fechaInISO, fechaOutISO) {
            const cont = document.querySelector("#habitacionSeleccionadaContainer");

            const noches = calcularNoches(fechaInISO, fechaOutISO);
            const precioTotal = noches * habitacion.precio;

            // Carga card
            cont.innerHTML = `
            <div class="card border-success card-personalizada">
                <div class="card-header  text-black">
                    <div card-title>Habitación seleccionada</div>
                    <div class="image-strip">
                        <img src="/img/calma1.jpg" class="img-fluid" alt="calma">
                        <img src="/img/calma2.jpg" class="img-fluid" alt="calma">
                        <img src="/img/calma3.jpg" class="img-fluid" alt="calma">
                        <img src="/img/calma4.jpg" class="img-fluid" alt="calma">
                        <img src="/img/calma5.jpg" class="img-fluid" alt="calma">
                    </div>

                <div class="card-body">
                           
                    <p><strong>Habitación:</strong> ${habitacion.tipo}</p>
                    <p><strong>Precio por noche:</strong> $ ${habitacion.precio}</p>
                    <p><strong>Noches:</strong> ${noches}</p>
                    <p><strong>Total:</strong> $ ${precioTotal}</p>

                    <p><strong>Check In:</strong> ${fechaInLocal}</p>
                    <p><strong>Check Out:</strong> ${fechaOutLocal}</p>

                    <button id="btnConfirmarReserva" class="btn btn-primary mt-3">
                        Confirmar reserva
                    </button>
                    </div>
                </div>`;

            document.querySelector("#btnConfirmarReserva").addEventListener("click", async () => {
                await confirmarReserva(habitacion.id, fechaInISO, fechaOutISO);
            });
        }

        async function confirmarReserva(roomId, checkInISO, checkOutISO) {
            try {
                const user = getActualUser();
                if (!user) {
                    alert("⚠️ No hay usuario logueado.");
                    return;
                }

                const nuevaReserva = {
                    userId: user.id,
                    roomId,
                    checkIn: checkInISO,
                    checkOut: checkOutISO,
                    estado: "confirmado"
                };

                await reservationService.create(nuevaReserva);

                Swal.fire({
                    icon: "success",
                    title: "Reservación guardada",
                    text: "La reservación fue registrada correctamente.",
                    confirmButtonText: "Aceptar",
                });

                document.querySelector("#habitacionesDisponiblesContainer").innerHTML = "";
                document.querySelector("#habitacionSeleccionadaContainer").innerHTML = "";

            } catch (error) {
                console.error("Error al crear reserva:", error);
                alert("No se pudo confirmar la reserva.");
            }
        }

    });

    //Limpia los valores de los inputs del datetimepicker
    function limpiarYResetearFechas() {
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


