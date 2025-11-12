export class Reservation {
    constructor(id, userId, roomId, checkIn, checkOut, estado = "pendiente") {
        this.id = id;
        this.userId = userId;
        this.roomId = roomId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.estado = estado;
    }

    confirmar() {
        this.estado = "confirmada";
    }

    cancelar() {
        this.estado = "cancelada";
    }

    toJSON() {
        return { ...this };
    }
}
