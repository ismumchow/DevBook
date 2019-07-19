// for jwt
const express = require('express');
const router = express.Router();
const auth  = require('../../middleware/auth');
const User = require('../../models/User')
//@route GET request api/auth
//desc 
//@acess Public


router.get('/',auth, async (req, res) => {
try { 
    const user = await User.findById(req.user.id).select('-password');
    }
catch (err) {
    res.send(err.message);
    res.status(500).send('server error');
    }
} );


module.exports = router;