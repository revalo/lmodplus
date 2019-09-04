// Keeps the LMOD logged in session alive.

setInterval(() => {
    axios.get('https://learning-modules.mit.edu/service/membership/user');
}, 20000);
