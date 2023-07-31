async function getEmail(req, res) {
    console.log('getting email: ' + req.email)
    res.status(200).send(JSON.stringify({email: req.email}))
}

module.exports = { getEmail }