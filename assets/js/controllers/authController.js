// src/controllers/authController.js
import { getUserByEmail } from "../models/userModel.js";
import { User } from "../models/User.js";

export async function handleLogin(email, password) {
    const data = await getUserByEmail(email);
    if (!data || data.password !== password) {
        alert("Usuario o contraseña incorrectos");
        return;
    }

    const user = new User(data); // creás la instancia de la clase
    localStorage.setItem("user", JSON.stringify(user));
    alert(`Bienvenido ${user.nombre}`);
}
