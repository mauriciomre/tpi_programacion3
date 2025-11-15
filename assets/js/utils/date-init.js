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
