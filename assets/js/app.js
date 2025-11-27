import { Router } from "./router.js";
import { initDatePickers } from "./utils/date-init.js";
import { reservationController } from "./controllers/reservationController.js";
import { renderizarLoginView, renderizarRegisterView } from "./views/loginView.js";
import { dashboardController } from "./controllers/dashboardController.js";
import { renderMiReservaView } from "./views/miReservaView.js";
import { getActualUser, isAuthenticated, esAdmin, logout } from "./services/storageService.js";

function updateNavbar() {
    const navContainer = document.getElementById('navbar-links-container');
    if (!navContainer) return;

    const user = getActualUser();
    const loggedIn = isAuthenticated();
    const isAdmin = esAdmin();

    let navHTML = '';

    //Enlaces para TODOS (Inicio y Reservar Online siempre visibles)
    navHTML += `<a class="nav-link text-white rounded active" href="#">Inicio</a>`;
    navHTML += `<a class="nav-link text-white rounded" href="#/reservas">Reservar Online</a>`;

    // Enlaces si NO está logueado
    if (!loggedIn) {
        navHTML += `<a class="nav-link text-white rounded" href="#/login">Iniciar sesión</a>`;
    }

    //Enlaces si SÍ está logueado
    if (loggedIn) {
        // Enlace de Dashboard (SOLO ADMIN)
        if (isAdmin) {
            navHTML += `<a class="nav-link text-white rounded" href="#/dashboard">Control Panel</a>`;
        }

        // Enlace Mis Reservas (TODOS los logueados)
        navHTML += `<a class="nav-link text-white rounded" href="#/mis-reservas">Mis Reservas</a>`;

        const userName = user.nombre || user.email;
        navHTML += `
            <span class="nav-link text-white rounded d-flex align-items-center user-info">
                <i class="fas fa-user-circle mr-2" style="font-size: 1.2rem;"></i>
                <strong>${userName}</strong>
            </span>
        `;

        // Botón de Cerrar Sesión
        navHTML += `<button id="logoutBtn" class="btn btn-secondary ml-md-2">Cerrar Sesión</button>`;
    }

    navContainer.innerHTML = navHTML;

    // 4. Adjuntar el evento de Logout al botón si existe
    if (loggedIn) {
        const logoutButton = document.getElementById('logoutBtn');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout(); // La función logout() de storageService.js ya maneja la redirección
                // No necesitamos llamar a updateNavbar aquí, ya que la redirección a '#/login'
                // forzará al router a ejecutar el handleRouteChange y el onPageLoaded.
            });
        }
    }
    // LLógica para cerrar el menú responsive
    const navbarCollapse = document.getElementById('navbarNavAltMarkup');
    const allNavItems = navContainer.querySelectorAll('a.nav-link, button#logoutBtn');

    allNavItems.forEach(item => {
        item.addEventListener('click', () => {
            // Verifica si el menú está abierto (tiene la clase 'show') y lo cierra
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarCollapse.classList.remove('show');
            }
        });
    });
}

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
        updateNavbar();
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
                const user = getActualUser();
                // Verificamos si existe usuario y si su rol es ADMIN
                if (user && user.role && user.role.toUpperCase() === 'ADMIN') {
                    // Si es administrador, cargamos el controlador del dashboard
                    dashboardController();
                } else {
                    // Si NO es administrador o NO está logueado, lo redirigimos
                    window.location.hash = '#/inicio';
                    Swal.fire({
                        icon: "error",
                        title: "ACCERO RESTRINGIDO",
                        text: "'Acceso denegado. Solo para administradores..",
                        confirmButtonText: "Aceptar",
                    });
                } break;
            case "pages/miReserva.html":
                renderMiReservaView();
                break;

            // CASE PARA CADA CONTROLLER
        }
    };

    router.init();
    updateNavbar();
});
