import { roomService, reservationService } from "../services/apiServices.js";

export function reservationController() {
    const fechaEntradaInput = document.querySelector("#fechaEntrada");
    const fechaSalidaInput = document.querySelector("#fechaSalida");

    const buscarHabitacionesBtn = document.querySelector("#buscarHabitaciones");

    buscarHabitacionesBtn.addEventListener("click", async () => {
        console.log("BUSCANDO HABITACIONES");

        let allRooms = await roomService.getAll();

        console.log(allRooms);


        let allReservations = await reservationService.getAll();

        console.log(allReservations);
    });
}
