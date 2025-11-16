import { Router } from "./router.js";
import { initDatePickers } from "./utils/date-init.js";
import { reservationController } from "./controllers/reservationController.js";

document.addEventListener("DOMContentLoaded", () => {
    const app = document.getElementById("app");
    const router = new Router(app);

    router.addRoute("login", "pages/login.html");
    router.addRoute("reservas", "pages/reservations.html");
    router.addRoute("dashboard", "pages/dashboard.html");
    router.addRoute("registro", "pages/register.html");
    router.addRoute("habitaciones", "pages/rooms.html");

    // 👇 Se ejecuta DESPUÉS de cada carga de vista
    router.onPageLoaded = (path) => {
        // Ejecutar solo en la página de reservas
        if (path.includes("reservations.html")) {
            initDatePickers();
        }

        switch (path) {
            case "pages/reservations.html":
                reservationController();
                break;

            // CASE PARA CADA CONTROLLER
        }
    };

    router.init();
});
