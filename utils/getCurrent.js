const getCurrentDateAndTime = () => new Date();
const getCurrentTimestampUnix = () => Math.floor(Date.now() / 1000);

console.log(getCurrentDateAndTime());
console.log(getCurrentTimestampUnix());

module.exports = { getCurrentDateAndTime, getCurrentTimestampUnix };
