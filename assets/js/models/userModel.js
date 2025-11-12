const API_URL = "https://66b12345e5b3a9.mockapi.io/api/v1/users";

export async function getUsers() {
    const response = await fetch(API_URL);
    return await response.json();
}

export async function createUser(data) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return await response.json();
}

export async function getUserByEmail(email) {
    const users = await getUsers();
    return users.find((u) => u.email === email);
}
