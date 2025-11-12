import { Router } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const router = new Router(app);

    router.addRoute("login", "pages/login.html");
    router.addRoute("reservas", "pages/reservas.html");
    router.addRoute("dashboard", "pages/dashboard.html");

    router.init();
});
