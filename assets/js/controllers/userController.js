import { getUsers } from "../services/userServices.js";

let usuarios = await getUsers();

console.log(usuarios);
