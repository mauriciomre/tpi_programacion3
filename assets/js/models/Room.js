export class Room {
    constructor(id, tipo, precio, disponible = true) {
        this.id = id;
        this.tipo = tipo;
        this.precio = precio;
        this.disponible = disponible;
    }

    toJSON() {
        return { ...this };
    }
}
