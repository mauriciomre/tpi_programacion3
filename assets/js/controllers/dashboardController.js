import { userService, roomService, reservationService } from "../services/apiServices.js";

export async function dashboardController() {
    const logoutBtn = document.querySelector("#logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("usuarioActual");
            window.location.href = "#/login";
        });
    }

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
                    email: emailNuevoUsuarioInput.value.toLowerCase(),
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
                        <option value="user" ${user.role === "user" ? "selected" : ""}>user</option>
                        <option value="admin" ${user.role === "admin" ? "selected" : ""}>admin</option>
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
                let roleInput = document.getElementById("rolEditarUsuario");

                if (nombreInput.value != "" && emailInput.value != "") {
                    if (
                        (await validarEmailUnico(emailInput.value)) ||
                        emailInput.value.toLowerCase() == user.email.toLowerCase()
                    ) {
                        let updateUser = {
                            nombre: nombreInput.value,
                            email: emailInput.value,
                            password: passwordInput.value || user.password,
                            role: roleInput.value,
                        };

                        console.log(updateUser);

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

    // --- TAB RESERVACIONES ---

    // ENLAZAR ELEMENTOS RESERVACIONES
    const reservacionesTbody = document.querySelector("#tbodyReservacionesDashboard");
    const buscarTodasReservasBtn = document.querySelector("#btnBuscarTodasReservas");
    const buscarReservaInput = document.querySelector("#buscarReservaInput");
    const buscarReservaBtn = document.querySelector("#buscarReservaBtn");
    const agregarNuevaReservaBtn = document.querySelector("#btnAgregarNuevaReserva");
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

    // MOSTRAR RESERVACIONES
    async function mostrarReservaciones(reservas) {
        reservacionesTbody.innerHTML = "";
        reservas.forEach((res) => {
            reservacionesTbody.innerHTML += `
        <tr>
            <td>${res.id}</td>
            <td>${res.usuario.nombre} (${res.userId}) - ${res.usuario.email}</td>
            <td>${res.roomId} - ${res.habitacion.tipo}</td>
            <td>${res.checkIn}</td>
            <td>${res.checkOut}</td>
            <td><span class="badge badge-pill ${colocarClassEstado(res.estado)}">${res.estado.toUpperCase()}</span></td>
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

    function colocarClassEstado(estado) {
        if (estado == "confirmado") {
            return "badge-success";
        }

        if (estado == "pendiente") {
            return "badge-warning";
        }

        if (estado == "cancelado") {
            return "badge-danger";
        }
    }

    buscarReservaBtn.addEventListener("click", async () => {
        reservacionesTbody.innerHTML = loaderReserva;

        let todas = await reservasUsuariosHabitaciones();

        if (buscarReservaInput.value !== "") {
            let texto = buscarReservaInput.value.toLowerCase();

            let filtradas = todas.filter((res) => {
                for (let key in res) {
                    if (typeof res[key] === "string" || typeof res[key] === "number") {
                        if (String(res[key]).toLowerCase().includes(texto)) {
                            return true;
                        }
                    }
                }

                if (res.usuario) {
                    for (let key in res.usuario) {
                        if (String(res.usuario[key]).toLowerCase().includes(texto)) {
                            return true;
                        }
                    }
                }

                if (res.habitacion) {
                    for (let key in res.habitacion) {
                        if (String(res.habitacion[key]).toLowerCase().includes(texto)) {
                            return true;
                        }
                    }
                }

                return false;
            });

            mostrarReservaciones(filtradas);
        } else {
            mostrarReservaciones(todas);
        }
    });

    buscarTodasReservasBtn.addEventListener("click", async () => {
        reservacionesTbody.innerHTML = loaderReserva;
        let todas = await reservasUsuariosHabitaciones();
        mostrarReservaciones(todas);
    });

    async function reservasUsuariosHabitaciones() {
        let reservas = await reservationService.getAll();
        let usuarios = await userService.getAll();
        let habitaciones = await roomService.getAll();

        let resultado = reservas.map((res) => {
            let usuario = usuarios.find((u) => u.id == res.userId);
            let habitacion = habitaciones.find((h) => h.id == res.roomId);

            return {
                ...res,
                usuario,
                habitacion,
            };
        });

        return resultado;
    }

    // AGREGAR RESERVACION
    const usuarioNuevaReserva = document.querySelector("#usuarioNuevaReserva");
    const checkInNuevaReserva = document.querySelector("#checkInNuevaReserva");
    const checkOutNuevaReserva = document.querySelector("#checkOutNuevaReserva");
    const habitacionNuevaReserva = document.querySelector("#habitacionNuevaReserva");
    const estadoNuevaReserva = document.querySelector("#estadoNuevaReserva");

    agregarNuevaReservaBtn.addEventListener("click", async () => {
        usuarioNuevaReserva.innerHTML = ``;
        let allUsers = await userService.getAll();
        allUsers.forEach((user) => {
            usuarioNuevaReserva.innerHTML += `<option value="${user.id}">${user.nombre} (${user.id}) - ${user.email}</option>`;
        });

        checkInNuevaReserva.value = "";
        checkOutNuevaReserva.value = "";
        infoValidateNewReserva.innerHTML = "";
        await cargarHabitacionesDisponibles();
    });

    checkInNuevaReserva.addEventListener("change", () => {
        cargarHabitacionesDisponibles();
    });

    checkOutNuevaReserva.addEventListener("change", () => {
        cargarHabitacionesDisponibles();
    });

    async function cargarHabitacionesDisponibles() {
        let checkIn = checkInNuevaReserva.value;
        let checkOut = checkOutNuevaReserva.value;

        habitacionNuevaReserva.innerHTML = "";

        if (!checkIn || !checkOut || checkIn == "" || checkOut == "") {
            habitacionNuevaReserva.innerHTML = `<option value="">Seleccione fechas primero...</option>`;
            return;
        }

        if (checkIn >= checkOut) {
            infoValidateNewReserva.innerHTML = `<p class="text-danger">* El check-out debe ser posterior al check-in</p>`;
            return;
        } else {
            infoValidateNewReserva.innerHTML = "";
        }

        let habitaciones = await roomService.getAll();
        let reservas = await reservationService.getAll();

        let disponibles = habitaciones.filter((hab) => {
            if (hab.disponible) {
                let reservada = reservas.some((res) => {
                    if (parseInt(res.roomId) != parseInt(hab.id)) return false;

                    let resIn = new Date(res.checkIn);
                    let resOut = new Date(res.checkOut);
                    let inDate = new Date(checkIn);
                    let outDate = new Date(checkOut);

                    let seSolapan = !(outDate <= resIn || inDate >= resOut);

                    return seSolapan;
                });

                return !reservada;
            } else {
                return false;
            }
        });

        if (disponibles.length === 0) {
            habitacionNuevaReserva.innerHTML = `<option value="">No hay habitaciones disponibles</option>`;
            return;
        }

        habitacionNuevaReserva.innerHTML = `<option value="">Seleccione una habitación...</option>`;

        disponibles.forEach((h) => {
            habitacionNuevaReserva.innerHTML += `
            <option value="${h.id}">
                Habitación ${h.id} - ${h.tipo} - $${h.precio}/noche
            </option>
        `;
        });
    }

    guardarNuevaReservaBtn.addEventListener("click", async () => {
        if (
            usuarioNuevaReserva.value === "" ||
            habitacionNuevaReserva.value === "" ||
            checkInNuevaReserva.value === "" ||
            checkOutNuevaReserva.value === ""
        ) {
            infoValidateNewReserva.innerHTML = `
            <p class="text-danger">* Debe completar todos los campos</p>
        `;
            return;
        }

        if (checkInNuevaReserva.value >= checkOutNuevaReserva.value) {
            infoValidateNewReserva.innerHTML = `
            <p class="text-danger">* La fecha de salida debe ser mayor a la de entrada</p>
        `;
            return;
        }

        let nuevaReserva = {
            userId: parseInt(usuarioNuevaReserva.value),
            roomId: parseInt(habitacionNuevaReserva.value),
            checkIn: checkInNuevaReserva.value,
            checkOut: checkOutNuevaReserva.value,
            estado: estadoNuevaReserva.value,
        };

        try {
            await reservationService.create(nuevaReserva);

            infoValidateNewReserva.innerHTML = "";

            Swal.fire({
                icon: "success",
                title: "Reservación guardada",
                text: "La reservación fue registrada correctamente.",
                confirmButtonText: "Aceptar",
            });

            buscarReservaBtn.click();
            cerrarNuevaReservaBtn.click();
        } catch (err) {
            infoValidateNewReserva.innerHTML = `
            <p class="text-danger">* Error al guardar la reservación: ${err}</p>
        `;
        }
    });

    // EDITAR RESERVACION
    reservacionesTbody.addEventListener("click", async (e) => {
        const btn = e.target.closest(".btnEditarReserva");
        if (!btn) return;

        const id = btn.dataset.id;

        const reserva = await reservationService.getById(id);
        const usuarios = await userService.getAll();
        const habitaciones = await roomService.getAll();
        const todasReservas = await reservationService.getAll();

        function seSolapan(aInicio, aFin, bInicio, bFin) {
            return !(aFin <= bInicio || aInicio >= bFin);
        }

        function habitacionesDisponibles(checkIn, checkOut) {
            const inDate = new Date(checkIn).getTime();
            const outDate = new Date(checkOut).getTime();

            return habitaciones.filter((hab) => {
                const reservasHab = todasReservas.filter((r) => r.roomId == hab.id && r.id != reserva.id);

                const ocupada = reservasHab.some((r) => {
                    const rIn = new Date(r.checkIn).getTime();
                    const rOut = new Date(r.checkOut).getTime();
                    return seSolapan(inDate, outDate, rIn, rOut);
                });

                return !ocupada;
            });
        }

        Swal.fire({
            title: "Editar reservación",
            width: "600px",
            html: `
        <form id="formEditarReserva">

            <div class="form-group text-start">
                <label>Usuario</label>
                <select id="editarUsuarioReserva" class="form-control">
                    ${usuarios
                    .map(
                        (u) =>
                            `<option value="${u.id}" ${u.id == reserva.userId ? "selected" : ""}>
                            ${u.nombre} (${u.email})
                        </option>`
                    )
                    .join("")}
                </select>
            </div>

            <div class="form-group text-start">
                <label>Check In</label>
                <input type="date" id="editarCheckInReserva"
                    class="form-control"
                    value="${reserva.checkIn}">
            </div>

            <div class="form-group text-start">
                <label>Check Out</label>
                <input type="date" id="editarCheckOutReserva"
                    class="form-control"
                    value="${reserva.checkOut}">
            </div>

            <div class="form-group text-start">
                <label>Habitación disponible</label>
                <select id="editarHabitacionReserva" class="form-control"></select>
            </div>

            <div class="form-group text-start">
                <label>Estado</label>
                <select id="editarEstadoReserva" class="form-control">
                    <option value="pendiente"  ${reserva.estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="confirmado" ${reserva.estado === "confirmado" ? "selected" : ""}>Confirmado</option>
                    <option value="cancelado"  ${reserva.estado === "cancelado" ? "selected" : ""}>Cancelado</option>
                </select>
            </div>

            <div class="mt-3 text-danger" id="infoEditarReserva"></div>

        </form>
        `,
            showCancelButton: true,
            confirmButtonText: "Guardar",
            cancelButtonText: "Cancelar",
            didOpen: () => {
                const selHab = document.querySelector("#editarHabitacionReserva");
                const inEl = document.querySelector("#editarCheckInReserva");
                const outEl = document.querySelector("#editarCheckOutReserva");

                // ---- FUNCION: cargar habitaciones disponibles ----
                function refrescarHabitaciones() {
                    const checkIn = inEl.value;
                    const checkOut = outEl.value;

                    selHab.innerHTML = "";

                    if (!checkIn || !checkOut || checkIn >= checkOut) {
                        selHab.innerHTML = `<option value="">Seleccione fechas válidas</option>`;
                        return;
                    }

                    const libres = habitacionesDisponibles(checkIn, checkOut);

                    if (libres.length === 0) {
                        selHab.innerHTML = `<option value="">No hay habitaciones disponibles</option>`;
                        return;
                    }

                    libres.forEach((h) => {
                        selHab.innerHTML += `
                    <option value="${h.id}" ${h.id == reserva.roomId ? "selected" : ""}>
                        Hab. ${h.id} - ${h.tipo} - $${h.precio}/noche
                    </option>`;
                    });
                }

                // Primera carga
                refrescarHabitaciones();

                // Actualizar dinámicamente al cambiar fechas
                inEl.addEventListener("change", refrescarHabitaciones);
                outEl.addEventListener("change", refrescarHabitaciones);
            },

            preConfirm: () => {
                const userId = document.querySelector("#editarUsuarioReserva").value;
                const roomId = document.querySelector("#editarHabitacionReserva").value;
                const checkIn = document.querySelector("#editarCheckInReserva").value;
                const checkOut = document.querySelector("#editarCheckOutReserva").value;
                const estado = document.querySelector("#editarEstadoReserva").value;

                // Validaciones
                if (!userId || !roomId || !checkIn || !checkOut) {
                    document.querySelector("#infoEditarReserva").innerText = "* Complete todos los campos";
                    return false;
                }

                if (checkIn >= checkOut) {
                    document.querySelector("#infoEditarReserva").innerText =
                        "* El check-out debe ser posterior al check-in";
                    return false;
                }

                return {
                    userId: Number(userId),
                    roomId: Number(roomId),
                    checkIn,
                    checkOut,
                    estado,
                };
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await reservationService.update(id, result.value);
                    Swal.fire("Actualizada", "La reservación fue modificada correctamente", "success");
                    buscarReservaBtn.click();
                } catch (err) {
                    Swal.fire("Error", "No se pudo actualizar la reservación", "error");
                }
            }
        });
    });

    // ELIMINAR RESERVA
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
