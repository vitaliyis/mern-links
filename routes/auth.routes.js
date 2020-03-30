const {Router} = require('express')
const bcrypt = require('bcryptjs')    // для хэширования пароля
const config = require('config')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../models/User')
const router = Router()

//  /api/auth/register
router.post(
  '/register',
  [             // массив мидлваров для валидации
    check('email', 'Некорректный email.').isEmail(),
    check('password', 'Минимальная длина пароля 6 символов.')
      .isLength({min: 6})
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации.'
        })
      }

      const {email, password} = req.body  // это то, что мы будем отправлять с фронтенда

      const candidate = await User.findOne({ email })   // поиск объекта по email; ждем пока найдет

      if (candidate) {  // если нашли отправляем код 400 с сообщением
        return res.status(400).json({message: 'Такой пользователь уже существует.'})
      }

      // если такого email нету, то регистрируем его и сохраняем
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = new User({email, password: hashedPassword})

      await user.save()   // ждем пока пользователь сохранится

      // сообщаем клиенту, что пользователь создан и передаем код-статус 201
      res.status(201).json({message: 'Пользователь создан.'})

    } catch(e){
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова.'})
    }
})

//  /api/auth/login
router.post(
  '/login',
  [
    check('email', 'Введите корректный email.').normalizeEmail().isEmail(),
    check('password', 'Введите пароль').exists()
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при входе в систему.'
        })
      }

      const {email, password} = req.body

      const user = await User.findOne({email})

      if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден.'})
      }

      // если user найден то сравниваем пароль, который пришел от клиента и из базы
      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль попробуйте снова.'})
      }

      // формируем токен для авторизации
      const token = jwt.sign(
        { userId: user.id },
        config.get('jwtSecret'),
        { expiresIn: '1h' }
      )

      // передаем клиенту ответ
      res.json({ token, userId: user.id })

    } catch(e){
      res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова.'})
    }
})

module.exports = router