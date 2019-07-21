const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const Profile = require('../../models/Profile');
const User = require('../../models/User');


//@route GET request api/profile/me
//desc   Get current users private
//@acess Private

router.get('/me',auth, async (req, res) => {
    try {
        const profile = await Profile.findOne ({ user: req.user.id }).populate('user',['name','avatar']); 
        if(!profile) {
            return res.status(400).json ({ 
                msg: "no profile for this user"
            });
        }
        res.json(profile);

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error')
    }
}); // whatever route we want to protect just add auth


module.exports = router;