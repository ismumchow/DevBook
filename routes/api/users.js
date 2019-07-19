const express = require('express'); 
const router = express.Router(); 

//@route GET request api/users
//desc   Test Route
//@acess Public

router.get('/',(req,res) => res.send('user route'));


module.exports = router;