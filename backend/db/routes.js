const { Router } = require('express')
const controller = require('./controller')

const router = Router()

router.get('/', controller.getUsers) // nodejs zna da ne moramo da prosledimo req, res
router.post('/', controller.addUser)
router.get('/:id', controller.getUserById)
router.put('/:id', controller.updateUser)
router.delete('/:id', controller.deleteUser)

module.exports = router