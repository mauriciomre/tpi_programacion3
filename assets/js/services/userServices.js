const API_URL = "https://6914d9e73746c71fe049d586.mockapi.io/users";

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
