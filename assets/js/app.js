import { Router } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const router = new Router(app);

    router.addRoute("login", "pages/login.html");
    router.addRoute("reservas", "pages/reservations.html");
    router.addRoute("dashboard", "pages/dashboard.html");
    router.addRoute("registro", "pages/register.html");

    router.init();
});
