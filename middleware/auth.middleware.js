const jwt = require('jsonwebtoken')
const config = require("config");

// middleware - это функция, которая позволяет перехватывать данные и делать определенную логику
// next позволяет продолжить выполнение запроса
// "OPTIONS" метод проверяет доступность сервера
module.exports = (req, res, next) => {
    if (req.method === "OPTIONS") {
      return next()
    }

    try {
      const token = req.headers.authorization.split(' ')[1]   // парсим из строки "Bearer TOKEN"

      if (!token) {
        return res.status(401).json({message: "Нет авторизации."})
      }

      // если токен есть то надо его раскодировать
      const decoded = jwt.verify(token, config.get('jwtSecret'))
      req.user = decoded      // кладем раскодированный токен в объект request
      next()                  // для продолжения выполнения запроса

    } catch (e) {
      res.status(401).json({message: "Нет авторизации."})
    }
}