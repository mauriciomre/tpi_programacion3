import { userService } from "../services/apiServices.js";
import { saveUser } from "../services/storageService.js";

//LOGIN (VERIFICAR LOS HREF)

export async function handleLogin(email, password) {
    console.log(`Intentando logear con ${email}`);

    //validar mail y pass

    if (email === "" || password === "") {
        await Swal.fire({
            icon: "warning",
            title: "¡Atención!",
            text: "No puedes dejar campos vacíos",
            confirmButtonText: "Aceptar",
        });
        return false;
    }

    try {
        const user = await userService.getByEmail(email);

        if (user === null) {
            Swal.fire({
                icon: "warning",
                title: "¡Atención!",
                text: "Usuario no encontrado",
                confirmButtonText: "Aceptar",
            });
            return false;
        }

        if (user.password !== password) {
            Swal.fire({
                icon: "warning",
                title: "¡Atención!",
                text: "Contraseña Incorrecta",
                confirmButtonText: "Aceptar",
            });
            return false;
        }
        // login exitoso
        console.log(`Login exitoso: ${user}`);

        const userName = user.nombre || user.email
        saveUser(user);
        Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: `Bienvenido ${user.nombre}`,
            confirmButtonText: "Aceptar",
        });

        const userRoleUpper = user.role ? user.role.toUpperCase() : "USUARIO";
        console.log(`DEBUG: El rol del usuario en MAYÚSCULAS es: "${userRoleUpper}"`);

        if (userRoleUpper === "ADMIN") {
            //
            console.log("DEBUG: Rama ADMIN seleccionada.");
            window.location.href = "#/dashboard";
        } else {
            //
            console.log("DEBUG: Rama USUARIO seleccionada.");
            window.location.href = "#/reservations";
        }

        return true;
    } catch (error) {
        console.error(`Error al iniciar sesión: ${error}`);
        Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Error al iniciar seesion.",
            confirmButtonText: "Aceptar",
        });
        return false;
    }
}

//REGISTRO

export async function handleRegister(nombre, email, password) {
    console.log(`intentando registrar con ${email} y ${nombre}`);

    if (nombre === "" || email === "" || password === "") {
        Swal.fire({
            icon: "warning",
            title: "¡Cuidado!",
            text: "No puedes dejar campos vacios",
            confirmButtonText: "Aceptar",
        });
        return false;
    }

    if (password.length < 6) {
        Swal.fire({
            icon: "warning",
            title: "¡Cuidado!",
            text: "La contraseña debe tener al menos 6 caracteres",
            confirmButtonText: "Aceptar",
        });
        return false;
    }

    // Se intenta crear user con role USUARIO por defecto
    try {
        const existingUser = await userService.getByEmail(email);

        if (existingUser !== null) {
            Swal.fire({
                icon: "warning",
                title: "¡Cuidado!",
                text: `Este email ya esta registrado`,
                confirmButtonText: "Aceptar",
            });
            return false;
        }
        const newUser = await userService.create({
            nombre: nombre,
            email: email,
            password: password,
            role: "USUARIO",
        });

        console.log("Usuario creado:", newUser);

        saveUser(newUser);
        Swal.fire({
            icon: "success",
            title: "¡Bienvenido!",
            text: `Bienvenido ${newUser.nombre}`,
            confirmButtonText: "Aceptar",
        });

        window.location.href = "#/reservations";

        return true;
    } catch (error) {
        console.error(`Error de login: ${error}`);
        Swal.fire({
            icon: "error",
            title: "¡Error!",
            text: "Error al registrar usuario.",
            confirmButtonText: "Aceptar",
        });
        return false;
    }
}


// funciones para el administrador (Crear usuario y cambiar contraseña)

export async function adminCreateUser(nombre, email, password, role) {
    console.log(`intentando registrar con ${email}, ${nombre} y ${role}`);

    if (nombre === "" || email === "" || password === "" || role === "") {
        Swal.fire({
            icon: "warning",
            title: "¡Cuidado!",
            text: "No puedes dejar campos vacios",
            confirmButtonText: "Aceptar",
        });
        return false;
    }

    // Admin crea user con eleccion de role
    try {
        const existingUser = await userService.getByEmail(email);

        if (existingUser !== null) {
            Swal.fire({
                icon: "warning",
                title: "¡Cuidado!",
                text: `Este email ya esta registrado`,
                confirmButtonText: "Aceptar",
            });

            return false;
        }
        const newUser = await userService.create({
            nombre: nombre,
            email: email,
            password: password,
            role: role
        });

        console.log("Usuario creado por admin:", newUser);

        saveUser(newUser);
        Swal.fire({
            icon: "success",
            title: "Registro correcto",
            text: `Usuario ${newUser.nombre} creado`,
            confirmButtonText: "Aceptar",
        });

        return true;

    } catch (error) {
        console.error(`Error de login: ${error}`);
        Swal.fire({
            icon: "error",
            title: "Falló registro",
            text: `Error al crear usuario.`,
            confirmButtonText: "Aceptar",
        });
        return false;
    }
}

export async function adminChangePassword(idUser, newPassword) {

    if (newPassword === '' || newPassword.length < 6) {
        Swal.fire({
            icon: "warning",
            title: "Corrige",
            text: "La contraseña debe tener al menos 6 caracteres",
            confirmButtonText: "Aceptar",
        });
        return false;
    }

    try {
        await userService.changePassword(idUser, newPassword);
        Swal.fire({
            icon: "Succes",
            title: "Contraseña cambiada",
            text: `Contraseña cambiada con exito.`,
            confirmButtonText: "Aceptar",
        });

        return true;
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: `Error al cambiar de contraseña`,
            confirmButtonText: "Aceptar",
        });
        return false;
    }
}