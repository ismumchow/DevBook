const express = require('express');
const router = express.Router();

//@route GET request api/profile
//desc   Test Route
//@acess Public

router.get('/', (req, res) => res.send('profile route'));


module.exports = router;