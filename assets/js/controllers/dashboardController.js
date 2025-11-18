import { userService, roomService, reservationService } from "../services/apiServices.js";

export async function dashboardController() {
    const reservacionesTbody = document.querySelector("#tbodyReservacionesDashboard");

    // --- TAB USUARIOS ---

    // ENLAZAR EVENTOS USUARIOS
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
            let nuevoUsuario = {
                nombre: nombreNuevoUsuarioInput.value,
                email: emailNuevoUsuarioInput.value,
                password: passwordNuevoUsuarioInput.value,
                role: rolNuevoUsuarioInput.value,
            };

            try {
                let response = await userService.create(nuevoUsuario);
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

            preConfirm: () => {
                let nombreInput = document.getElementById("nombreEditarUsuario");
                let emailInput = document.getElementById("emailEditarUsuario");
                let passwordInput = document.getElementById("passwordEditarUsuario");
                let rolInput = document.getElementById("rolEditarUsuario");

                if (nombreInput.value != "" && emailInput.value != "") {
                    let updateUser = {
                        nombre: nombreInput.value,
                        email: emailInput.value,
                        password: passwordInput.value || user.password,
                        rol: rolInput.value,
                    };

                    return updateUser;
                } else {
                    document.getElementById("infoValidacion").innerText = "* Nombre y Email son obligatorios";
                    return false;
                }
            },
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    let respuesta = await editarUsuario(id, result.value);

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

    // ENLAZAR EVENTOS HABITACIONES

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
}
