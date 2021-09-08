const users = [];

const addUser = ({ id, name, room }) => new Promise((resolve, reject) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);

    if (existingUser) { reject({ error: "Username is taken" }) }

    const user = { id, room, name };

    users.push(user);

    resolve({ user })
})

const removeUser = (id) => {
    const index = users.indexOf(user => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => new Promise((resolve) => resolve(users.find(user => user.id === id)));

const getUsersInRoom = (room) => users.filter(user => user.room === room)

module.exports = { addUser, removeUser, getUser, getUsersInRoom }