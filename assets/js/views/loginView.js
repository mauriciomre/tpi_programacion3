import { handleLogin, handleRegister } from "../controllers/authController.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    await handleLogin(email, password);
});

document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = e.target.nombre.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        await handleRegister(nombre, email, password);
    });
