// for jwt
const express = require('express');
const router = express.Router();

//@route GET request api/auth
//desc   Test Route
//@acess Public

router.get('/', (req, res) => res.send('auth route'));


module.exports = router;