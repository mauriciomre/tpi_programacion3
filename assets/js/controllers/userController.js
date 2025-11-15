import { getUsers } from "../services/apiServices";

let usuarios = await getUsers();

console.log(usuarios);
