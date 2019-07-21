// for jwt
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth  = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User')
const config = require('config');
const {
    check,
    validationResult
} = require('express-validator');
//@route Post request api/auth
//desc 
//@acess Public


router.get('/',auth, async (req, res) => {
try { 
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
    }
catch (err) {
    res.send(err.message);
    res.status(500).send('server error');
    }
} );

router.post('/', [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'password is required').exists()
    ],
    async (req, res) => {
        console.log(req.body);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const {
            email,
            password
        } = req.body;

        try {
            // see if user exits (dont send mult emails)
            let user = await User.findOne({
                email
            });

            if (!user) {
                return res
                .status(400)
                .json({
                    errors: [{
                        msg: 'usr dne'
                    }]
                });
            }


            const isMatch = await bcrypt.compare(password,user.password); 

            if(!isMatch) {

                return res
                    .status(400)
                    .json({
                        errors: [{
                            msg: 'wrong pw'
                        }]
                    });

            }




            //return jwt 
            const payload = {
                user: {
                    id: user.id // will give us a promise
                }
            }

            jwt.sign(
                payload,
                config.get('jwtToken'), {
                    expiresIn: 36000
                },
                (err, token) => {
                    if (err) throw err;
                    else {
                        res.json({
                            token
                        });
                    }
                })

        } catch (error) {

            console.error(error.message);
            res.status(500).send('Server err');

        }

    });



module.exports = router;