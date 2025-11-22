import { roomService, reservationService } from "../services/apiServices.js";
import { getActualUser } from "../services/storageService.js";
import { validarFormatoFechaISO, validarFechasConsecutivas, parsearFechaLocalizada } from "../utils/date-init.js";

export function reservationController() {

    const buscarHabitacionesBtn = document.querySelector("#buscarHabitaciones");
    const contenedor = document.querySelector("#habitacionesDisponiblesContainer");

    buscarHabitacionesBtn.addEventListener("click", async () => {
        console.log("BUSCANDO HABITACIONES");

        //Toma fechas ingresadas
        const fechaEntrada = document.querySelector('#reservationdatein input').value;
        const fechaSalida = document.querySelector('#reservationdateout input').value;

        if (!fechaEntrada || !fechaSalida) {
            contenedor.innerHTML = `
        <div class="alert alert-danger text-center fw-bold">
            ⚠️ Debes ingresar ambas fechas para continuar
        </div>
    `;
            return;
        }

        //Trae habitaciones habilitadas y todas las reservas hechas
        let habitacionesHabilitadas = await roomService.getAvailable();
        let allReservations = await reservationService.getAll();
        contenedor.innerHTML = " "

        console.log("Habitaciones habilitadas:", habitacionesHabilitadas);
        console.log("Reservas:", allReservations);

        // Función que detecta si una habitación está ocupada
        function estaOcupada(habitacionId, checkIn, checkOut, reservas) {
            const inDate = new Date(checkIn);
            const outDate = new Date(checkOut);

            return reservas.some((res) => {
                if (parseInt(res.roomId) !== parseInt(habitacionId)) return false;

                const resIn = new Date(res.checkIn);
                const resOut = new Date(res.checkOut);

                // si NO se cumplen las condiciones de "no solapan", entonces SÍ solapan
                const seSolapan = !(outDate <= resIn || inDate >= resOut);

                return seSolapan;
            });
        }

        //Filtrar habitaciones libres en esas fechas
        let disponibles = habitacionesHabilitadas.filter(hab => {
            const ocupada = estaOcupada(hab.id, fechaEntrada, fechaSalida, allReservations);
            return !ocupada;
        });

        console.log("Habitaciones disponibles según fechas:", disponibles);
        if (disponibles.length === 0) {
            contenedor.innerHTML = `
        <div class="alert alert-warning text-center fw-bold">
            ⛔ No hay habitaciones disponibles para esas fechas
        </div>`;
            return;
        }

        let tabla = `<table class="table table-bordered table-striped mt-3">
        <thead class="thead-dark">
            <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acción</th>
            </tr>
        </thead>
        <tbody>`;

        disponibles.forEach(hab => {
            tabla += `
        <tr>
            <td>${hab.id}</td>
            <td>${hab.tipo}</td>
            <td>$ ${hab.precio}</td>
            <td>Disponible</td>
            <td>
                <button class="btn btn-success btnSeleccionar" data-id="${hab.id}">
                    Seleccionar
                </button>
            </td>
        </tr>`;
        });

        tabla += `
        </tbody>
        </table>`;

        contenedor.innerHTML = tabla;
        contenedor.innerHTML = tabla;

        // Activa los botones "Seleccionar"
        document.querySelectorAll(".btnSeleccionar").forEach(btn => {
            btn.addEventListener("click", async () => {
                const id = btn.dataset.id;

                // Busca la habitación
                const habitacion = disponibles.find(h => h.id == id);

                mostrarHabitacionSeleccionada(habitacion, fechaEntrada, fechaSalida);
            });
        });

        function mostrarHabitacionSeleccionada(habitacion, fechaIn, fechaOut) {
            const cont = document.querySelector("#habitacionSeleccionadaContainer");

            cont.innerHTML = `
        <div class="card border-success">
            <div class="card-header bg-success text-white">
                Habitación seleccionada
            </div>

            <div class="card-body">
                <p><strong>ID:</strong> ${habitacion.id}</p>
                <p><strong>Tipo:</strong> ${habitacion.tipo}</p>
                <p><strong>Precio:</strong> $ ${habitacion.precio}</p>
                <p><strong>Check In:</strong> ${fechaIn}</p>
                <p><strong>Check Out:</strong> ${fechaOut}</p>

                <button id="btnConfirmarReserva" class="btn btn-primary mt-3">
                    Confirmar reserva
                </button>
            </div>
        </div>`;

            // Evento del botón confirmar
            document.querySelector("#btnConfirmarReserva").addEventListener("click", async () => {
                await confirmarReserva(habitacion.id, fechaIn, fechaOut);
            });
        }
        // reservationController.js (Tu función dentro del addEventListener del botón Buscar)

        async function confirmarReserva(roomId, checkIn, checkOut, precioTotal) {

            // Parseo y validación de formato
            const checkInISO = parsearFechaLocalizada(checkIn);
            const checkOutISO = parsearFechaLocalizada(checkOut);

            // Si el parseo falla (ej: fecha inválida o formato incorrecto), cancelamos
            if (!checkInISO || !checkOutISO) {
                Swal.fire({
                    icon: "error",
                    title: "Error de Formato",
                    text: "Las fechas no pudieron ser convertidas a formato API. Por favor, revisá que el formato sea correcto.",
                    confirmButtonText: "Aceptar",
                });
                return;
            }


            try {
                const user = getActualUser();
                if (!user) {
                    alert("⚠️ No hay un usuario logueado para hacer la reserva.");
                    return;
                }
                const userId = user.id;

                // Crea el objeto de reserva, USANDO LAS NUEVAS VARIABLES ISO
                const nuevaReserva = {
                    userId: userId,
                    roomId: roomId,
                    checkIn: checkInISO,
                    checkOut: checkOutISO,
                    precioTotal: precioTotal,
                    estado: "confirmado"
                };

                // Crear la reserva en mockAPI
                await reservationService.create(nuevaReserva);

                alert("Reserva confirmada con éxito!");

                // Limpiar pantalla
                document.querySelector("#habitacionesDisponiblesContainer").innerHTML = "";
                document.querySelector("#habitacionSeleccionadaContainer").innerHTML = "";

            } catch (error) {
                console.error("Error al crear reserva:", error);
                alert("No se pudo confirmar la reserva.");
            }
        }
        async function confirmarReserva(roomId, checkIn, checkOut) {
            try {
                const user = getActualUser();
                if (!user) {
                    alert("⚠️ No hay un usuario logueado para hacer la reserva.");
                    return;
                }
                const userId = user.id;

                //Crea el objeto de reserva
                const nuevaReserva = {
                    userId: userId,
                    roomId: roomId,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    estado: "confirmado"
                };

                //Crear la reserva en mockAPI
                await reservationService.create(nuevaReserva);

                alert("Reserva confirmada con éxito!");

                // Limpiar pantalla
                document.querySelector("#habitacionesDisponiblesContainer").innerHTML = "";
                document.querySelector("#habitacionSeleccionadaContainer").innerHTML = "";

            } catch (error) {
                console.error("Error al crear reserva:", error);
                alert("No se pudo confirmar la reserva.");
            }
        }
    });
}



