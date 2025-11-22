export function initDatePickers() {
    const inEl = document.querySelector("#reservationdatein");
    const outEl = document.querySelector("#reservationdateout");

    if (!inEl || !outEl) return;

    const hoy = moment().startOf("day");

    // Entrada
    $("#reservationdatein").datetimepicker({
        format: "L",
        locale: "es",
        minDate: hoy,
    });

    // Salida
    $("#reservationdateout").datetimepicker({
        format: "L",
        locale: "es",
        useCurrent: false,
        minDate: hoy.add(1, "day"), // salida mínima: mañana
    });

    // Validación: salida > entrada
    $("#reservationdatein").on("change.datetimepicker", function (e) {
        if (e.date) {
            // La salida debe ser al menos un día después
            const nextDay = moment(e.date).add(1, "day");
            $("#reservationdateout").datetimepicker("minDate", nextDay);
        }
    });

    $("#reservationdateout").on("change.datetimepicker", function (e) {
        if (e.date) {
            // La entrada debe ser al menos un día antes
            const prevDay = moment(e.date).subtract(1, "day");
            $("#reservationdatein").datetimepicker("maxDate", prevDay);
        }
    });
}

export function formatearFecha(dateString) {
    if (!dateString) return 'N/A';
    // Crea un objeto Date desde el string 'YYYY-MM-DD'
    const date = new Date(dateString);
    // Muestra en formato DD/MM/YYYY
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function parsearFechaLocalizada(dateString) {

    if (!dateString) return null;

    //Crea un objeto formato ISO para guardar en MockAPI
    const parsedMoment = moment(dateString, 'DD/MM/YYYY', 'es', true).startOf('day');

    if (!parsedMoment.isValid()) {
        console.error("Error de parseo: La cadena de fecha no es válida en formato 'L'", dateString);
        return null;
    }
    return parsedMoment.format('YYYY-MM-DD');
}

export function validarFormatoFechaISO(fechaString) {
    if (!fechaString || !/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) return false;
    // Usa Moment.js para verificar que la cadena sea una fecha válida en formato ISO
    return moment(fechaString, 'YYYY-MM-DD', true).isValid();
}

export function validarFechasConsecutivas(checkIn, checkOut) {
    const fechaIn = moment(checkIn, 'YYYY-MM-DD');
    const fechaOut = moment(checkOut, 'YYYY-MM-DD');
    // Compara si la salida es ESTRICTAMENTE posterior a la entrada, ignorando la hora
    return fechaOut.isAfter(fechaIn, 'day');
}