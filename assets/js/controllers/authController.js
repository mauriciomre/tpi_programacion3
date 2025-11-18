import { userService } from "../services/apiServices.js";
import { saveUser } from "../services/storageService.js";

//LOGIN (VERIFICAR LOS HREF)

export async function handleLogin(email, password) {
    console.log(`Intentando logear con ${email}`);

    //validar mail y pass

    if (email === "" || password === "") {
        alert("No puedes dejar campos vacios");
        return false;
    }

    try {
        const user = await userService.getByEmail(email);

        if (user === null) {
            alert("Usuario no encontrado");
            return false;
        }

        if (user.password !== password) {
            alert("Contraseña Incorrecta");
            return false;
        }
        // login exitoso
        console.log(`Login exitoso: ${user}`);
        saveUser(user);
        alert(`Bienvenid@ ${user.nombre}`);

        if (user.role === "ADMIN") {
            window.location.href = "#/loquesea";
        } else {
            window.localStorage.href = "#/reservations";
        }

        return true;
    } catch (error) {
        console.error(`Error de login: ${error}`);
        alert("Error al iniciar seesion.");
        return false;
    }
}

//REGISTRO

export async function handleRegister(nombre, email, password) {
    console.log(`intentando registrar con ${email} y ${nombre}`);

    if (nombre === "" || email === "" || password === "") {
        alert("No puedes dejar campos vacios");
        return false;
    }

    if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }

    // Se intenta crear user con role USUARIO por defecto
    try {
        const existingUser = await userService.getByEmail(email);

        if (existingUser !== null) {
            alert("Este email ya esta registrado");
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
        alert(`Bienvenido ${newUser.nombre}`);

        window.location.href = "#/reservations";

        return true;
    } catch (error) {
        console.error(`Error de login: ${error}`);
        alert("Error al registrar usuario.");
        return false;
    }
}


// funciones para el administrador (Crear usuario y cambiar contraseña)

export async function adminCreateUser(nombre, email, password, role) {
    console.log(`intentando registrar con ${email}, ${nombre} y ${role}`);

    if (nombre === "" || email === "" || password === "" || role === "") {
        alert("No puedes dejar campos vacios");
        return false;
    }

    // Admin crea user con eleccion de role
    try {
        const existingUser = await userService.getByEmail(email);

        if (existingUser !== null) {
            alert("Este email ya esta registrado");
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
        alert(`Usuario ${newUser.nombre} creado`);

        return true;

    } catch (error) {
        console.error(`Error de login: ${error}`);
        alert("Error al crear usuario.");
        return false;
    }
}

export async function adminChangePassword(idUser, newPassword) {
    
     if (newPassword === '' || newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return false;
    }

    try {
        await userService.changePassword(idUser, newPassword);
        alert('Contraseña cambiada con exito.');

        return true;
    } catch (error){
        alert('Error al cambiar de contraseña');
        return false;
    }
}