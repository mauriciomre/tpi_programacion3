import { handleLogin, handleRegister } from "../controllers/authController.js";
import { isAuthenticated, getActualUser } from "../services/storageService.js";

//Modifique el codigo de mauri para que verifique en local storage y traiga los datos del usuario

export function renderizarLoginView() {
    console.log('Renderizando login view')

    if (isAuthenticated()) {
        const user = getActualUser();
        console.log('Usuario logueado!')
        if (user.role === 'ADMIN') {
            window.location.href = '#/dashboard';
        } else {
            window.location.href = '#/habitaciones';
        }
        return;
    }

    const loginForm = document.getElementById("loginForm")



    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        await handleLogin(email, password);
    });

}

export function renderizarRegisterView(){
    console.log('Renderizando register view')

    if (isAuthenticated()) {
        const user = getActualUser();
        console.log('Usuario logueado!')
        if (user.role === 'ADMIN') {
            window.location.href = '#/dashboard';
        } else {
            window.location.href = '#/habitaciones';
        }
        return;
    }

    const registerForm = document.getElementById("registerForm");

    if (registerForm === null){
        console.error('No se encontro el formulario de registro...')
        return;
    }

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = e.target.nombre.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        await handleRegister(nombre, email, password);
    });
}