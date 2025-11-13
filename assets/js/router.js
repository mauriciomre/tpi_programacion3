export class Router {
    constructor(appContainer) {
        this.app = appContainer;
        this.routes = {};
    }

    addRoute(name, path) {
        this.routes[name] = path;
    }

    async loadPage(path) {
        const res = await fetch(path);
        const html = await res.text();
        this.app.innerHTML = html;
    }

    async handleRouteChange() {
        const hash = location.hash.slice(2); // "#/login" → "login"
        const route = this.routes[hash] || this.routes["habitaciones"];
        await this.loadPage(route);
    }

    init() {
        window.addEventListener("hashchange", () => this.handleRouteChange());
        this.handleRouteChange(); // carga inicial
    }
}
