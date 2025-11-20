import { Router } from "./router.js";
import { initDatePickers } from "./utils/date-init.js";
import { reservationController } from "./controllers/reservationController.js";
import { renderizarLoginView, renderizarRegisterView } from "./views/loginView.js";
import { dashboardController } from "./controllers/dashboardController.js";
import { renderMiReservaView } from "./views/miReservaView.js";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const router = new Router(app);

    router.addRoute("", "pages/inicio.html");
    router.addRoute("inicio", "pages/inicio.html");
    router.addRoute("login", "pages/login.html");
    router.addRoute("reservas", "pages/reservations.html");
    router.addRoute("dashboard", "pages/dashboard.html");
    router.addRoute("registro", "pages/register.html");
    router.addRoute("habitaciones", "pages/rooms.html");
    router.addRoute("mis-reservas", "pages/miReserva.html");

    // 👇 Se ejecuta DESPUÉS de cada carga de vista
    router.onPageLoaded = (path) => {
        // Ejecutar solo en la página de reservas
        if (path.includes("reservations.html")) {
            initDatePickers();
        }

        switch (path) {
            case "pages/login.html":
                renderizarLoginView();
                break;
            case "pages/register.html":
                renderizarRegisterView();
                break;
            case "pages/reservations.html":
                reservationController();
                break;
            case "pages/dashboard.html":
                dashboardController();
                break;
            case "pages/miReserva.html":
                renderMiReservaView();
                break;

            // CASE PARA CADA CONTROLLER
        }
    };

    router.init();
});
