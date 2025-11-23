import { IMAGENES_POR_HABITACION } from "../models/roomImages.js";

export function generateRoomCardHTML(habitacion, opciones = {}) {

    //Para reservaciones usamos noches y precio
    const isReservation = opciones.noches && opciones.precioTotal;

    // Toma rutas de imagenes del map y las pasa como una cadena con join para construir el HTML
    const imagenesHabitacion = IMAGENES_POR_HABITACION[habitacion.tipo] || [];
    const imageStripHTML = imagenesHabitacion.map(src =>
        `<img src="${src}" class="img-fluid" alt="${habitacion.tipo}">`
    ).join('');

    //Contenido Condicional
    let cardTitle = isReservation ? 'HABITACIÓN SELECCIONADA' : habitacion.tipo;
    let cardBodyExtra = '';
    let actionButton = '';

    if (isReservation) {
        // MODO RESERVA
        cardBodyExtra = `
            <p><strong>Noches:</strong> ${opciones.noches}</p>
            <p><strong>Total:</strong> $ ${opciones.precioTotal}</p>
            <p><strong>Check In:</strong> ${opciones.fechaInLocal}</p>
            <p><strong>Check Out:</strong> ${opciones.fechaOutLocal}</p>
        `;
        actionButton = `
            <button id="btnConfirmarReserva" class="btn btn-primary">
                Confirmar reserva
            </button>
        `;
    } else {
        // MODO LISTADO/ROOMS
        cardBodyExtra = `
            <p>${habitacion.descripcion || 'Confort, estilo y la mejor vista de la Patagonia.'}</p>
        `;
        actionButton = `
            <a href="#/reservar?roomId=${habitacion.id}" class="btn btn-warning">Reservar esta habitación</a>
        `;
    }

    // 4. Template Final
    return `
        <div class="card card-primary card-personalizada h-100 w-75 mx-auto">
            <div class="card-header">
                <h3 class="card-title">${cardTitle}</h3>
            </div>
            
            <div class="image-strip">
                ${imageStripHTML}
            </div>

            <div class="card-body">
                <p><strong>Habitación:</strong> ${habitacion.tipo}</p>
                <p><strong>Precio por noche:</strong> $ ${habitacion.precio}</p>
                
                ${cardBodyExtra}

                ${actionButton}
            </div>
        </div>
    `;
}