const { format } = require("date-fns-tz");

const getCurrentDateAndTime = () => {
    const timeZone = "UTC";
    const localTime = format(new Date(), "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
    }).replace("Z", "");

    return localTime;
};

const getCurrentTimestampUnix = () => {
    const formattedDateString = getCurrentDateAndTime().replace(" ", "T") + "Z";
    const unixTimestamp = Math.floor(
        new Date(formattedDateString).getTime() / 1000
    );
    return unixTimestamp;
};

console.log(getCurrentDateAndTime());
console.log(getCurrentTimestampUnix());

module.exports = { getCurrentDateAndTime, getCurrentTimestampUnix };
