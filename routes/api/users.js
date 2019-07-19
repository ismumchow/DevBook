const express = require('express'); 
const router = express.Router(); 
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator/check');


const User = require('../../models/User');

//@route GET request api/users
//desc   Register User
//@acess Public

router.post('/',[
    check('name', "name is required")
    .not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6})
],
    async (req,res) => {
    console.log (req.body);
    const errors = validationResult (req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
    }

    const {name,email,password} = req.body; 

    try {
        // see if user exits (dont send mult emails)
        let user = await User.findOne({email
        });

        if (user) {
            res.status(400).json({
                errors: [ {
                    msg: 'user already exists'
                }]
            });
        }

        // get users gravatar 

        const avatar = gravatar.url(email, {
            s: '200', //length
            r:'pg',
            d: 'mm'  // default image
        })

        user = new User ({ 
            name,
            email,
            avatar,
            password
        }); 

        //encrypt pw using bcrypt 

        const salt = await bcrypt.genSalt(10);

         user.password = await bcrypt.hash(password,salt);
         
         await user.save();

        //return jwt 
       res.send('user registered!')

    } catch (error) {
        
        console.error(error.message);
        res.status(500).send('Server err');

    }
//sample comment

});


module.exports = router;