const roomsUrl = "https://6914d9e73746c71fe049d586.mockapi.io/:endpoint/rooms";

export async function getRooms() {
    const response = await fetch(roomsUrl);
    return await response.json();
}

export async function createRoom(data) {
    const response = await fetch(roomsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function getRoomById(id) {
    const users = await getRooms();
    return users.find((u) => u.id === id);
}
