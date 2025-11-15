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
        const res = await fetch(path);
        const html = await res.text();
        this.app.innerHTML = html;

        // 🚀 Llamar callback cuando la vista terminó de cargarse
        if (typeof this.onPageLoaded === "function") {
            this.onPageLoaded(path);
        }
    }

    async handleRouteChange() {
        const hash = location.hash.slice(2);
        const route = this.routes[hash] || this.routes["habitaciones"];
        await this.loadPage(route);
    }

    init() {
        window.addEventListener("hashchange", () => this.handleRouteChange());
        this.handleRouteChange();
    }
}
