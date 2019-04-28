// const fs = require('fs');
const dt = new Date();
let dtString = `${dt.getDate()}${dt.getMonth()}${dt.getFullYear()}${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}`;
fs.mkdirSync(dtString)

let count = 0;
count++;
console.log(count.toString())