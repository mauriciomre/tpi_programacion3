//MODIFICAR EL MOCKAPI EL TIPO DE DATO DE ROLE (tiene de dar STRING: USUARIO o ADMIN)

//Usuario en el navegador
const STORAGE_KEY = 'usuarioActual';

//recibir objeto user, convertirlo a texto y guardar con la clave STORAGE_KEY
export function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

}

//Trae user logueado desde localStorage
export function getActualUser() {
    const userJson = localStorage.getItem(STORAGE_KEY);
    if (userJson === null) {
        console.log('No hay un usuario logueado')
        return null;
    } else {
        return JSON.parse(userJson)
    }
}

//verificar sesion, devuelve true o false
export function isAuthenticated() {
    return getActualUser() !== null;
}

//verificar ADMIN, devuelve true o false
export function esAdmin() {
    const user = getActualUser();
    if (user === null) {
        return false;
    }
    return user.role === 'ADMIN';
}

//UTILIZANDO WINDOW BOM (verificar)(verificar)(verificar)

export function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '#/login';
}
// funcion para devolver a login si isAuthenticated() es false
export function requiereAuth() {
    if (!isAuthenticated()) {
        alert('Debes iniciar sesion...');
        window.location.href = '#/login';
        return false;
    }
    return true;
}

// verificar admin. FALTA terminar de completar el href FALTA terminar de completar el href

export function requiereAdmin(){
    if (!isAuthenticated()) {
        alert('Debes iniciar sesion...');
        window.location.href = '#/login';
        return false;
    }
    if (!isAdmin()) {
        alert('No tienes permisos de administrador');
        window.location.href = '#/reservations';
        return false;
    }
    return true;
}
