import { userService, roomService, reservationService } from "../services/apiServices.js";

export async function dashboardController() {
    const usuariosTbody = document.querySelector("#tbodyUsuariosDashboard");
    const habitacionesTbody = document.querySelector("#tbodyHabitacionesDashboard");
    const reservacionesTbody = document.querySelector("#tbodyReservacionesDashboard");

    const buscarTodosUsuariosBtn = document.querySelector("#btnBuscarTodosUsuarios");
    const buscarUsuarioInput = document.querySelector("#buscarUsuarioInput");
    const buscarUsuarioBtn = document.querySelector("#buscarUsuarioBtn");

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

    buscarUsuarioBtn.addEventListener("click", async () => {
        usuariosTbody.innerHTML = loaderUsuario;
        if (buscarUsuarioInput.value != "") {
            buscarCoincidenciasUsuarios(buscarUsuarioInput.value);
        } else {
            let allUsers = await userService.getAll();
            mostrarUsuarios(allUsers);
        }
    });

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
                                            <button class="btn text-success"
                                                onclick="editarUsuarioDashboard(${user.id})">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                        </td>
                                        <td>
                                            <button class="btn text-danger"
                                                onclick="eliminarUsuarioDashboard(${user.id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
        `;
        });
    }

    async function buscarUsuario(idUser) {}

    async function eliminarUsuario(idUser) {}

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
