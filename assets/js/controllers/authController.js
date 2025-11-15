// src/controllers/authController.js

/*

    const user = new User(data); // creás la instancia de la clase
    localStorage.setItem("user", JSON.stringify(user));
    alert(`Bienvenido ${user.nombre}`);
}
*/

import { userService } from "../services/apiServices";
import { saveUser } from "../services/storageService";

//LOGIN (VERIFICAR LOS HREF)

export async function handleLogin(email, password) {
    console.log(`Intentando logear con ${email}`);

    //validar mail y pass
    
    if (email === '' || password === ''){
        alert('No puedes dejar campos vacios');
        return false;
    }

    try{
        const user = await userService.getByEmail(email);

        if (user === null){
            alert('Usuario no encontrado');
            return false;
        }

        if (user.password !== password){
            alert('Contrasenia Incorrecta');
            return false;
        }
        // login exitoso
        console.log(`Login exitoso: ${user}`)
        saveUser(user);
        alert(`Bienvenid@ ${user.nombre}`);

        if (user.role === 'ADMIN'){
            window.location.href = '#/loquesea'
        }else{
            window.localStorage.href ='#/reservations'
        }
        
        return true;

    } catch (error){
        console.error(`Error de login: ${error}`);
        alert('Error al iniciar seesion.');
        return false;
    }
}

//REGISTRO

export async function handleRegister(nombre, email, password) {
    console.log (`intentando registrar con ${email} y ${nombre}`);

     if (nombre === '' || email === '' || password === '') {
        alert('No puedes dejar campos vacios');
        return false;
    }

    // Se intenta crear user con role USUARIO por defecto
    try{
        const existingUser = await userService.getByEmail(email);
        
        if (existingUser !== null) {
            alert('Este email ya esta registrado');
            return false;
        }
         const newUser = await userService.create({
            nombre: nombre,
            email: email,
            password: password,
            role: 'USUARIO'
         });

         console.log('Usuario creado:', newUser);

         saveUser(newUser);
         alert(`Bienvenido ${newUser.nombre}`);

         window.location.href = '#/reservations';

         return true;
    } catch (error){
        console.error(`Error de login: ${error}`);
        alert('Error al registrar usuario.');
        return false;
    }
}