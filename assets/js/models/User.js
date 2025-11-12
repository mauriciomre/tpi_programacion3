export class User {
    constructor(id, nombre, email, password, role = "usuario") {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    isAdmin() {
        return this.role === "admin";
    }

    toJSON() {
        return { ...this };
    }
}
