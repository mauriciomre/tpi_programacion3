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
                            </tr>
                            <tr>
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
                            </tr>
                            `;

    // MOSTRAR RESERVACIONES
    async function mostrarReservaciones(reservas) {
        reservacionesTbody.innerHTML = "";
        reservas.forEach((res) => {
            reservacionesTbody.innerHTML += `
        <tr>
            <td>${res.id}</td>
            <td>${res.userId}</td>
            <td>${res.roomId}</td>
            <td>${res.checkIn}</td>
            <td>${res.checkOut}</td>
            <td>${res.estado}</td>
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
