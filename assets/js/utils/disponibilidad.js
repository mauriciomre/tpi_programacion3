import { reservationService, roomService } from "../services/apiServices.js";

export function seSolapan(resIn, resOut, checkInPropuesto, checkOutPropuesto) {
    const resInDate = new Date(resIn);
    const resOutDate = new Date(resOut);
    const inDate = new Date(checkInPropuesto);
    const outDate = new Date(checkOutPropuesto);

    // Revisa solapamiento
    return !(outDate <= resInDate || inDate >= resOutDate);
}

export function haySolapamiento(roomId, checkInISO, checkOutISO, allReservations) {
    const resOcupada = allReservations.some(res => {
        // Ignorar si no es la habitación que estamos verificando
        if (parseInt(res.roomId) !== parseInt(roomId)) return false;

        // Comprobar si hay solapamiento con la reserva existente
        return seSolapan(res.checkIn, res.checkOut, checkInISO, checkOutISO);
    });

    return resOcupada;
}

export function calcularNoches(checkInISO, checkOutISO) {
    const inDate = new Date(checkInISO);
    const outDate = new Date(checkOutISO);
    // 1000 * 60 * 60 * 24 = milisegundos por día
    return (outDate - inDate) / (1000 * 60 * 60 * 24);
}

export async function getHabitacionesDisponibles(checkInISO, checkOutISO) {
    // Traer solo habitaciones habilitadas
    const habitacionesHabilitadas = await roomService.getAvailable();
    const allReservations = await reservationService.getAll();

    if (checkInISO >= checkOutISO) {
        return [];
    }

    const disponibles = habitacionesHabilitadas.filter(hab =>
        // Solo incluimos la habitación si NO hay solapamiento
        !haySolapamiento(hab.id, checkInISO, checkOutISO, allReservations)
    );

    return disponibles;
}