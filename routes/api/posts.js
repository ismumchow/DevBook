const express = require('express');
const router = express.Router();

//@route GET request api/posts
//desc   Test Route
//@acess Public

router.get('/', (req, res) => res.send('posts route'));


module.exports = router;