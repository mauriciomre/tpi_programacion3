import { userService, roomService, reservationService } from "../services/apiServices.js";

export async function dashboardController() {
    // --- TAB USUARIOS ---

    // ENLAZAR ELEMENTOS USUARIOS
    const usuariosTbody = document.querySelector("#tbodyUsuariosDashboard");
    const buscarTodosUsuariosBtn = document.querySelector("#btnBuscarTodosUsuarios");
    const buscarUsuarioInput = document.querySelector("#buscarUsuarioInput");
    const buscarUsuarioBtn = document.querySelector("#buscarUsuarioBtn");

    const guardarNuevoUsuarioBtn = document.querySelector("#btnGuardarNuevoUsuario");

    const loaderUsuario = `
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    `;

    // BUSCAR USUARIO POR TEXTO
    buscarUsuarioBtn.addEventListener("click", async () => {
        usuariosTbody.innerHTML = loaderUsuario;
        if (buscarUsuarioInput.value != "") {
            buscarCoincidenciasUsuarios(buscarUsuarioInput.value);
        } else {
            let allUsers = await userService.getAll();
            mostrarUsuarios(allUsers);
        }
    });

    // BUSCAR USUARIOS
    buscarTodosUsuariosBtn.addEventListener("click", async () => {
        usuariosTbody.innerHTML = loaderUsuario;
        let allUsers = await userService.getAll();
        mostrarUsuarios(allUsers);
    });

    async function buscarCoincidenciasUsuarios(inputValue) {
        let texto = inputValue.toLowerCase();

        let allUsers = await userService.getAll();

        let allMatchUsers = allUsers.filter((user) => {
            for (let key in user) {
                let value = user[key];

                if (String(value).toLowerCase().includes(texto)) {
                    return true;
                }
            }
            return false;
        });

        mostrarUsuarios(allMatchUsers);
    }

    async function mostrarUsuarios(usuarios) {
        usuariosTbody.innerHTML = "";
        usuarios.forEach((user) => {
            usuariosTbody.innerHTML += `
                                    <tr>
                                        <td>
                                            ${user.id}
                                        </td>
                                        <td>
                                            ${user.nombre}
                                        </td>
                                        <td>
                                            ${user.email}
                                        </td>
                                        <td>
                                            ${user.password}
                                        </td>
                                        <td>
                                            ${user.role}
                                        </td>
                                        <td>
                                            <button class="btn text-success btnEditar" data-id=${user.id}>
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn text-danger btnBorrar" data-id=${user.id}>
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
        `;
        });
    }

    // AGREGAR NUEVO USUARIO

    async function validarEmailUnico(email) {
        let allUsers = await userService.getAll();

        let encontrado = allUsers.some((user) => user.email.toLowerCase() == email.toLowerCase());

        console.log(encontrado);

        return !encontrado;
    }

    guardarNuevoUsuarioBtn.addEventListener("click", async () => {
        let nombreNuevoUsuarioInput = document.querySelector("#nombreNuevoUsuario");
        let emailNuevoUsuarioInput = document.querySelector("#emailNuevoUsuario");
        let passwordNuevoUsuarioInput = document.querySelector("#passwordNuevoUsuario");
        let rolNuevoUsuarioInput = document.querySelector("#rolNuevoUsuario");
        let avisoRellenarCamposDiv = document.querySelector("#avisoRellenarCampos");
        let cerrarNuevoUsuarioBtn = document.querySelector("#btnCerrarNuevoUsuario");

        if (
            nombreNuevoUsuarioInput.value != "" &&
            emailNuevoUsuarioInput.value != "" &&
            passwordNuevoUsuarioInput.value
        ) {
            if (await validarEmailUnico(emailNuevoUsuarioInput.value)) {
                let nuevoUsuario = {
                    nombre: nombreNuevoUsuarioInput.value,
                    email: emailNuevoUsuarioInput.value,
                    password: passwordNuevoUsuarioInput.value,
                    role: rolNuevoUsuarioInput.value,
                };

                try {
                    await userService.create(nuevoUsuario);
                    avisoRellenarCamposDiv.innerHTML = "";
                    cerrarNuevoUsuarioBtn.click();
                    nombreNuevoUsuarioInput.value = "";
                    emailNuevoUsuarioInput.value = "";
                    passwordNuevoUsuarioInput.value = "";
                    Swal.fire({
                        icon: "success",
                        title: "Usuario guardado",
                        text: "El usuario fue registrado correctamente.",
                        confirmButtonText: "Aceptar",
                    });

                    await buscarUsuarioBtn.click();
                } catch (error) {
                    avisoRellenarCamposDiv.innerHTML = `
                                                        <p class="text-danger"> 
                                                        * El usuario no pudo guardarse correctamente: ${error}
                                                        </p>`;
                }
            } else {
                avisoRellenarCamposDiv.innerHTML = `
                                                    <p class="text-danger"> 
                                                    * El Email ingresado ya existe
                                                    </p>`;
            }
        } else {
            avisoRellenarCamposDiv.innerHTML = `
                                                    <p class="text-danger"> 
                                                    * Debe rellenar todos los campos
                                                                    antes de guardar
                                                    </p>`;
        }
    });

    // EDITAR USUARIO
    usuariosTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnEditar");
        if (!btn) return;

        const id = btn.dataset.id;
        const user = await userService.getById(id);

        Swal.fire({
            title: "Editar usuario",
            html: `
            <form id="formEditarUsuario">
                <div class="form-group text-start" style="text-align: start;">
                    <label for="nombreEditarUsuario">Nombre</label>
                    <input type="text" class="form-control" id="nombreEditarUsuario" value="${user.nombre}">
                </div>

                <div class="form-group text-start" style="text-align: start;">
                    <label for="emailEditarUsuario">Email</label>
                    <input type="email" class="form-control" id="emailEditarUsuario" value="${user.email}">
                </div>

                <div class="form-group text-start" style="text-align: start;">
                    <label for="passwordEditarUsuario">Password</label>
                    <input type="password" class="form-control" id="passwordEditarUsuario" placeholder="Nueva contraseña (opcional)">
                </div>

                <div class="form-group text-start" style="text-align: start;">
                    <label for="rolEditarUsuario">Rol</label>
                    <select class="form-control" id="rolEditarUsuario">
                        <option value="user" ${user.rol === "user" ? "selected" : ""}>user</option>
                        <option value="admin" ${user.rol === "admin" ? "selected" : ""}>admin</option>
                    </select>
                </div>

                <div class="mt-3 text-danger" id="infoValidacion" style="text-align: start;"></div>
            </form>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",

            preConfirm: async () => {
                let nombreInput = document.getElementById("nombreEditarUsuario");
                let emailInput = document.getElementById("emailEditarUsuario");
                let passwordInput = document.getElementById("passwordEditarUsuario");
                let rolInput = document.getElementById("rolEditarUsuario");

                if (nombreInput.value != "" && emailInput.value != "") {
                    if (await validarEmailUnico(emailInput.value)) {
                        let updateUser = {
                            nombre: nombreInput.value,
                            email: emailInput.value,
                            password: passwordInput.value || user.password,
                            rol: rolInput.value,
                        };

                        return updateUser;
                    } else {
                        document.getElementById("infoValidacion").innerText = "* El Email ingresado ya existe";
                        return false;
                    }
                } else {
                    document.getElementById("infoValidacion").innerText = "* Nombre y Email son obligatorios";
                    return false;
                }
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    editarUsuario(id, result.value);

                    Swal.fire("Actualizado!", "El usuario fue editado correctamente", "success");
                } catch (error) {
                    Swal.fire("Error", "No se pudo actualizar el usuario", "error");
                }
            }
        });
    });

    async function editarUsuario(idUser, dataUser) {
        let response = await userService.update(idUser, dataUser);
        await buscarUsuarioBtn.click();
    }

    // BORRAR USUARIO
    usuariosTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnBorrar");
        if (!btn) return;

        const id = btn.dataset.id;
        const user = await userService.getById(id);

        Swal.fire({
            title: `Seguro que quiere eliminar al usuario ${user.nombre}?`,
            showDenyButton: true,
            confirmButtonText: "Si",
            denyButtonText: `Cancelar`,
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarUsuario(id);
                Swal.fire("Eliminado!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("El usuario no se eliminó", "", "info");
            }
        });
    });

    async function eliminarUsuario(idUser) {
        let response = await userService.delete(idUser);
        await buscarUsuarioBtn.click();
    }

    // --- TAB HABITACIONES ---

    // ENLAZAR ELEMENTOS HABITACIONES

    const habitacionesTbody = document.querySelector("#tbodyHabitacionesDashboard");
    const buscarTodasHabitacionesBtn = document.querySelector("#btnBuscarTodasHabitaciones");
    const buscarHabitacionInput = document.querySelector("#buscarHabitacionInput");
    const buscarHabitacionBtn = document.querySelector("#buscarHabitacionBtn");

    const guardarNuevaHabitacionBtn = document.querySelector("#btnGuardarNuevaHabitacion");

    const loaderHabitacion = `
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                        <td>
                                            <div class="loader"></div>
                                        </td>
                                    </tr>
                                    `;

    // BUSCAR HABITACION POR TEXTO
    buscarHabitacionBtn.addEventListener("click", async () => {
        habitacionesTbody.innerHTML = loaderHabitacion;
        if (buscarHabitacionInput.value != "") {
            buscarCoincidenciasHabitaciones(buscarHabitacionInput.value);
        } else {
            let allRooms = await roomService.getAll();
            mostrarHabitaciones(allRooms);
        }
    });

    // BUSCAR HABITACIONES
    buscarTodasHabitacionesBtn.addEventListener("click", async () => {
        habitacionesTbody.innerHTML = loaderHabitacion;
        let allRooms = await roomService.getAll();
        mostrarHabitaciones(allRooms);
    });

    async function buscarCoincidenciasHabitaciones(inputValue) {
        let texto = inputValue.toLowerCase();

        let allRooms = await roomService.getAll();

        let allMatchRooms = allRooms.filter((room) => {
            for (let key in room) {
                let value = room[key];

                if (String(value).toLowerCase().includes(texto)) {
                    return true;
                }
            }
            return false;
        });

        mostrarHabitaciones(allMatchRooms);
    }

    async function mostrarHabitaciones(habitaciones) {
        habitacionesTbody.innerHTML = "";
        habitaciones.forEach((room) => {
            habitacionesTbody.innerHTML += `
                                    <tr>
                                        <td>
                                            ${room.id}
                                        </td>
                                        <td>
                                            ${room.tipo}
                                        </td>
                                        <td>
                                            $ ${room.precio}
                                        </td>
                                        <td>
                                            ${room.disponible ? "Disponible" : "No disponible"}
                                        </td>
                                        <td>
                                            <button class="btn text-success btnEditar" data-id=${room.id}>
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn text-danger btnBorrar" data-id=${room.id}>
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
        `;
        });
    }

    // AGREGAR NUEVA HABITACION
    guardarNuevaHabitacionBtn.addEventListener("click", async () => {
        let tipoNuevaHabitacionInput = document.querySelector("#tipoNuevaHabitacion");
        let precioNuevaHabitacionInput = document.querySelector("#precioNuevaHabitacion");
        let disponibleNuevaHabitacionInput = document.querySelector("#disponibleNuevaHabitacion");
        let infovalidateNewRoomDiv = document.querySelector("#infoValidateNewRoom");
        let cerrarNuevaHabitacionBtn = document.querySelector("#btnCerrarNuevaHabitacion");

        infovalidateNewRoomDiv.innerHTML = "";

        if (
            tipoNuevaHabitacionInput.value != "" &&
            precioNuevaHabitacionInput.value != "" &&
            disponibleNuevaHabitacionInput.value
        ) {
            let nuevaHabitacion = {
                tipo: tipoNuevaHabitacionInput.value,
                precio: precioNuevaHabitacionInput.value,
                disponible: disponibleNuevaHabitacionInput.value === "true",
            };

            try {
                let response = await roomService.create(nuevaHabitacion);
                infovalidateNewRoomDiv.innerHTML = "";
                cerrarNuevaHabitacionBtn.click();

                tipoNuevaHabitacionInput.value = "";
                precioNuevaHabitacionInput.value = "";
                disponibleNuevaHabitacionInput.value = "";

                Swal.fire({
                    icon: "success",
                    title: "Habitación guardada",
                    text: "La habitacion fue registrada correctamente.",
                    confirmButtonText: "Aceptar",
                });

                await buscarHabitacionBtn.click();
            } catch (error) {
                infovalidateNewRoomDiv.innerHTML = `
                                                    <p class="text-danger"> 
                                                    * La habitación no pudo guardarse correctamente: ${error}
                                                    </p>`;
            }
        } else {
            infovalidateNewRoomDiv.innerHTML = `
                                                    <p class="text-danger"> 
                                                    * Debe rellenar todos los campos
                                                                    antes de guardar
                                                    </p>`;
        }
    });

    // EDITAR HABITACION
    habitacionesTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnEditar");
        if (!btn) return;

        const id = btn.dataset.id;
        const room = await roomService.getById(id);

        Swal.fire({
            title: "Editar habitación",
            html: `
            <form id="formEditarHabitacion">
                <div class="form-group text-start" style="text-align: start;">
                    <label for="tipoEditarHabitacion">Tipo</label>
                    <input type="text" class="form-control" id="tipoEditarHabitacion" value="${room.tipo}">
                </div>

                <div class="form-group text-start" style="text-align: start;">
                    <label for="precioEditarHabitacion">Precio</label>
                    <input type="number" class="form-control" id="precioEditarHabitacion" value="${room.precio}">
                </div>

                <div class="form-group text-start" style="text-align: start;">
                    <label for="disponibleEditarHabitacion">Disponible</label>
                    <select class="form-control" id="disponibleEditarHabitacion">
                        <option value="true" ${room.disponible === "si" ? "selected" : ""}>Disponible</option>
                        <option value="false" ${room.disponible === "no" ? "selected" : ""}>No disponible</option>
                    </select>
                </div>

                <div class="mt-3 text-danger" id="infoValidateEditRoom" style="text-align: start;"></div>
            </form>
        `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",

            preConfirm: () => {
                let tipoInput = document.getElementById("tipoEditarHabitacion");
                let precioInput = document.getElementById("precioEditarHabitacion");
                let disponibleInput = document.getElementById("disponibleEditarHabitacion");

                if (tipoInput.value != "" && precioInput.value != "") {
                    let updateRoom = {
                        tipo: tipoInput.value,
                        precio: parseFloat(precioInput.value),
                        disponible: disponibleInput.value === "true",
                    };

                    return updateRoom;
                } else {
                    document.getElementById("infoValidateEditRoom").innerText = "* Tipo y Precio son obligatorios";
                    return false;
                }
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let respuesta = await editarHabitacion(id, result.value);

                    Swal.fire("Actualizado!", "La habitación se editó correctamente", "success");
                } catch (error) {
                    Swal.fire("Error", "No se pudo actualizar la habitación", "error");
                }
            }
        });
    });

    async function editarHabitacion(idRoom, dataRoom) {
        let response = await roomService.update(idRoom, dataRoom);
        await buscarHabitacionBtn.click();
    }

    // BORRAR HABITACION
    habitacionesTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnBorrar");
        if (!btn) return;

        const id = btn.dataset.id;
        const room = await roomService.getById(id);

        Swal.fire({
            title: `Seguro que quiere eliminar la habitación ${room.id} ${room.tipo}?`,
            showDenyButton: true,
            confirmButtonText: "Si",
            denyButtonText: `Cancelar`,
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarHabitacion(id);
                Swal.fire("Eliminado!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("La habitación no se eliminó", "", "info");
            }
        });
    });

    async function eliminarHabitacion(idRoom) {
        let response = await roomService.delete(idRoom);
        await buscarHabitacionBtn.click();
    }

    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioActual");
            window.location.href = "#/login";
        });
    }

    // --- TAB RESERVACIONES ---

    // ENLAZAR ELEMENTOS RESERVACIONES
    const reservacionesTbody = document.querySelector("#tbodyReservacionesDashboard");
    const buscarTodasReservasBtn = document.querySelector("#btnBuscarTodasReservas");
    const buscarReservaInput = document.querySelector("#buscarReservaInput");
    const buscarReservaBtn = document.querySelector("#buscarReservaBtn");
    const guardarNuevaReservaBtn = document.querySelector("#btnGuardarNuevaReserva");
    const infoValidateNewReserva = document.querySelector("#infoValidateNewReserva");
    const cerrarNuevaReservaBtn = document.querySelector("#btnCerrarNuevaReserva");

    const loaderReserva = `
<tr>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
</tr>
<tr>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
<td><div class="loader"></div></td>
</tr>
`;

    async function mostrarReservaciones(reservas) {
        reservacionesTbody.innerHTML = "";
        reservas.forEach((res) => {
            reservacionesTbody.innerHTML += `
        <tr>
            <td>${res.id}</td>
            <td>${res.usuario}</td>
            <td>${res.habitacion}</td>
            <td>${res.checkIn}</td>
            <td>${res.checkOut}</td>
            <td>${res.estado}</td>
            <td>
                <button class="btn text-success btnEditarReserva" data-id=${res.id}>
                    <i class="fas fa-edit"></i>
                </button>
            </td>
            <td>
                <button class="btn text-danger btnBorrarReserva" data-id=${res.id}>
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
        });
    }

    buscarReservaBtn.addEventListener("click", async () => {
        reservacionesTbody.innerHTML = loaderReserva;
        if (buscarReservaInput.value != "") {
            let texto = buscarReservaInput.value.toLowerCase();
            let todas = await reservationService.getAll();
            let filtradas = todas.filter((res) => {
                for (let key in res) {
                    if (String(res[key]).toLowerCase().includes(texto)) return true;
                }
                return false;
            });
            mostrarReservaciones(filtradas);
        } else {
            let todas = await reservationService.getAll();
            mostrarReservaciones(todas);
        }
    });

    buscarTodasReservasBtn.addEventListener("click", async () => {
        reservacionesTbody.innerHTML = loaderReserva;
        let todas = await reservationService.getAll();
        mostrarReservaciones(todas);
    });

    guardarNuevaReservaBtn.addEventListener("click", async () => {
        let usuarioNuevaReserva = document.querySelector("#usuarioNuevaReserva");
        let habitacionNuevaReserva = document.querySelector("#habitacionNuevaReserva");
        let checkInNuevaReserva = document.querySelector("#checkInNuevaReserva");
        let checkOutNuevaReserva = document.querySelector("#checkOutNuevaReserva");
        let estadoNuevaReserva = document.querySelector("#estadoNuevaReserva");

        infoValidateNewReserva.innerHTML = "";

        if (
            usuarioNuevaReserva.value != "" &&
            habitacionNuevaReserva.value != "" &&
            checkInNuevaReserva.value != "" &&
            checkOutNuevaReserva.value != ""
        ) {
            let nuevaReserva = {
                usuario: usuarioNuevaReserva.value,
                habitacion: parseInt(habitacionNuevaReserva.value),
                checkIn: checkInNuevaReserva.value,
                checkOut: checkOutNuevaReserva.value,
                estado: estadoNuevaReserva.value,
            };

            try {
                await reservationService.create(nuevaReserva);
                infoValidateNewReserva.innerHTML = "";
                cerrarNuevaReservaBtn.click();

                usuarioNuevaReserva.value = "";
                habitacionNuevaReserva.value = "";
                checkInNuevaReserva.value = "";
                checkOutNuevaReserva.value = "";

                Swal.fire({
                    icon: "success",
                    title: "Reservación guardada",
                    text: "La reservación fue registrada correctamente.",
                    confirmButtonText: "Aceptar",
                });

                await buscarReservaBtn.click();
            } catch (error) {
                infoValidateNewReserva.innerHTML = `
            <p class="text-danger"> 
            * La reservación no pudo guardarse correctamente: ${error}
            </p>`;
            }
        } else {
            infoValidateNewReserva.innerHTML = `
        <p class="text-danger"> 
        * Debe rellenar todos los campos antes de guardar
        </p>`;
        }
    });

    reservacionesTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnEditarReserva");
        if (!btn) return;

        const id = btn.dataset.id;
        const reserva = await reservationService.getById(id);

        Swal.fire({
            title: "Editar reservación",
            html: `
        <form id="formEditarReserva">
            <div class="form-group text-start">
                <label>Usuario</label>
                <input type="text" class="form-control" id="usuarioEditarReserva" value="${reserva.usuario}">
            </div>
            <div class="form-group text-start">
                <label>Habitación</label>
                <input type="number" class="form-control" id="habitacionEditarReserva" value="${reserva.habitacion}">
            </div>
            <div class="form-group text-start">
                <label>Check In</label>
                <input type="date" class="form-control" id="checkInEditarReserva" value="${reserva.checkIn}">
            </div>
            <div class="form-group text-start">
                <label>Check Out</label>
                <input type="date" class="form-control" id="checkOutEditarReserva" value="${reserva.checkOut}">
            </div>
            <div class="form-group text-start">
                <label>Estado</label>
                <select class="form-control" id="estadoEditarReserva">
                    <option value="pendiente" ${reserva.estado == "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="confirmado" ${reserva.estado == "confirmado" ? "selected" : ""}>Confirmado</option>
                    <option value="cancelado" ${reserva.estado == "cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </div>
            <div class="mt-3 text-danger" id="infoValidateEditReserva"></div>
        </form>
        `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",

            preConfirm: () => {
                let usuario = document.getElementById("usuarioEditarReserva").value;
                let habitacion = document.getElementById("habitacionEditarReserva").value;
                let checkIn = document.getElementById("checkInEditarReserva").value;
                let checkOut = document.getElementById("checkOutEditarReserva").value;
                let estado = document.getElementById("estadoEditarReserva").value;

                if (!usuario || !habitacion || !checkIn || !checkOut) {
                    document.getElementById("infoValidateEditReserva").innerText =
                        "* Todos los campos son obligatorios";
                    return false;
                }

                return {
                    usuario,
                    habitacion: parseInt(habitacion),
                    checkIn,
                    checkOut,
                    estado,
                };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await reservationService.update(id, result.value);
                    Swal.fire("Actualizado!", "La reservación se editó correctamente", "success");
                    buscarReservaBtn.click();
                } catch (error) {
                    Swal.fire("Error", "No se pudo actualizar la reservación", "error");
                }
            }
        });
    });

    reservacionesTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnBorrarReserva");
        if (!btn) return;

        const id = btn.dataset.id;
        const reserva = await reservationService.getById(id);

        Swal.fire({
            title: `¿Eliminar la reservación ${id}?`,
            showDenyButton: true,
            confirmButtonText: "Sí",
            denyButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await reservationService.delete(id);
                Swal.fire("Eliminada!", "", "success");
                buscarReservaBtn.click();
            }
        });
    });
}
