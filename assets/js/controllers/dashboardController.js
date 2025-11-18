import { userService, roomService, reservationService } from "../services/apiServices.js";

export async function dashboardController() {
    const habitacionesTbody = document.querySelector("#tbodyHabitacionesDashboard");
    const reservacionesTbody = document.querySelector("#tbodyReservacionesDashboard");

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

    // MOSTRAR HABITACIONES
    let allRooms = await roomService.getAll();
    habitacionesTbody.innerHTML = "";
    allRooms.forEach((room) => {
        habitacionesTbody.innerHTML += `
                                    <tr>
                                        <td>
                                            ${room.id}
                                        </td>
                                        <td>
                                            ${room.tipo}
                                        </td>
                                        <td>
                                            ${room.precio}
                                        </td>
                                        <td>
                                            ${room.disponible}
                                        </td>
                                        <td>
                                            <button class="btn text-success"
                                                onclick="editarUsuarioDashboard(${room.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn text-danger"
                                                onclick="eliminarUsuarioDashboard(${room.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
        `;
    });

    // MOSTRAR RESERVAS
    let allReservations = await reservationService.getAll();
    reservacionesTbody.innerHTML = "";
    allReservations.forEach((reservacion) => {
        reservacionesTbody.innerHTML += `
                                    <tr>
                                        <td>
                                            ${reservacion.id}
                                        </td>
                                        <td>
                                            ${reservacion.userId}
                                        </td>
                                        <td>
                                            ${reservacion.roomId}
                                        </td>
                                        <td>
                                            ${reservacion.checkIn}
                                        </td>
                                        <td>
                                            ${reservacion.checkOut}
                                        </td>
                                        <td>
                                            ${reservacion.estado}
                                        </td>
                                        <td>
                                            <button class="btn text-success"
                                                onclick="editarUsuarioDashboard(${reservacion.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn text-danger"
                                                onclick="eliminarUsuarioDashboard(${reservacion.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
        `;
    });
}
