const winston = require("winston");

// Kreiranje instance loggera
const logger = winston.createLogger({
  level: "info", // Nivo logova (npr. 'info', 'warn', 'error')
  format: winston.format.combine(
    winston.format.timestamp(), // Dodajemo timestamp u logove
    winston.format.json() // Logovi će biti u JSON formatu
  ),
  transports: [
    // new winston.transports.Console(), // Ispis logova na konzoli
    new winston.transports.File({ filename: "logs.log" }), // Logovanje u fajl
  ],
});
function logWarning(message) {
  logger.warn(message);
}

function logError(message) {
  logger.error(message);
}

function logUserLogin(username) {
  logger.info(`User ${username} loggedin.`);
}
function logUserInfo(username, action) {
  logger.info(`User ${username} did action: ${action}.`);
}

function logUserAction(username, action) {
  logger.info(`User ${username} did action: ${action}.`);
}

module.exports = {
  logUserLogin,
  logUserInfo,
  logUserAction,
  logWarning,
  logError,
};
