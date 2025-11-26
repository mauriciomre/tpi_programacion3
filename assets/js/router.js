export class Router {
    constructor(appContainer) {
        this.app = appContainer;
        this.routes = {};
        this.onPageLoaded = null; // NUEVO CALLBACK
    }

    addRoute(name, path) {
        this.routes[name] = path;
    }

    async loadPage(path) {
        try {
            const res = await fetch(path);
            if (!res.ok) {
                throw new Error(`Error al cargar la ruta: ${path}`);
            }
            const html = await res.text();
            this.app.innerHTML = html;

            // 🚀 Llamar callback cuando la vista terminó de cargarse
            if (typeof this.onPageLoaded === "function") {
                setTimeout(() => {
                    this.onPageLoaded(path);
                }, 0);
            }
        } catch (error) {
            console.error("Error en loadPage:", error);
            this.app.innerHTML = `<h1>Error de Carga</h1><p>${error.message}</p>`;
        }
    }

    async handleRouteChange() {
        const hash = location.hash.slice(2);
        const route = this.routes[hash] || this.routes["inicio"];

        // Verifica que la ruta exista antes de intentar cargarla
        if (route) {
            await this.loadPage(route);
        } else {
            console.error(`Ruta no definida para hash: ${hash}`);
            // Redirigir a una ruta conocida si la actual no existe
            await this.loadPage(this.routes["inicio"] || this.routes["login"]);
        }

    }

    init() {
        window.addEventListener("hashchange", () => this.handleRouteChange());
        this.handleRouteChange();
    }
}
