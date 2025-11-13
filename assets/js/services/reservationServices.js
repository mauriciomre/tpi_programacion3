const reservationUrl = "https://6914ead03746c71fe04a079f.mockapi.io/reservations";

export async function getReservation() {
    const response = await fetch(reservationUrl);
    return await response.json();
}

export async function createReservation(data) {
    const response = await fetch(reservationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function getReservationById(id) {
    const users = await getReservation();
    return users.find((u) => u.id === id);
}
