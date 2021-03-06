const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check,validationResult} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const request = require('request');
const config = require('config')


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

//@route GET request api/profile
//desc   create  or update a user profile
//@acess Private

router.post('/', [auth, [
    check('status', 'status is required')
    . not()
        .isEmpty(),
    check('skills', "skills is required")
        .not() 
        .isEmpty()  
    ]
], async (req,res)=> {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json ( {
            errors: errors.array()
            });
          }
        const { 
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube, 
            facebook,
            twitter,
            instagram,
            linkedin
        } = req.body;

        // build profile obj 
        const profileFields  = {}; 
            profileFields.user = req.user.id; 
            if (company) profileFields.company = company; 
            if (website) profileFields.website = website;
            if (location) profileFields.location = location;
            if (bio) profileFields.bio= bio;
            if (status) profileFields.status = status;
            if (githubusername) profileFields.githubusername = githubusername;

            if (skills) {
                profileFields.skills = skills.split(',').map(skill => skill.trim());
            }
         

            //build social array
            profileFields.social = {};

            if (youtube) profileFields.social.youtube = youtube;
            if (twitter) profileFields.social.twitter= twitter;
            if (facebook) profileFields.social.facebook= facebook;
            if (linkedin) profileFields.social.linkedin = linkedin;
            if (instagram) profileFields.social.instagram = instagram;

            try {
                let profile = await Profile.findOne ({ 
                    user : req.user.id
                })

                if (profile) {
                    // update
                    profile = await Profile.findOneAndUpdate (
                        { user: req.user.id }, 
                        { $set: profileFields},
                        { new : true }
                        );
                    return res.json(profile);
                }
                // create 
                profile = new Profile(profileFields); 
                
                await profile.save();
                res.json(profile);
            }
            catch (error){
                console.error(error.message);
                res.status(500).send('server error');
            }
        
        }
    );

//@route GET request api/profile/me
//desc   Get all profiles
//@acess Public

router.get('/', async (req,res) => {

    try {
        const profiles = await Profile.find ().populate('user', ['name', 'avatar']); 
        res.json(profiles);
        
    } catch (error) {
        console.log (error.message);
        res.status(500);
    }

});

//@route GET request api/profile/user/:user_id
//desc   Get profile by user ID
//@acess Public

router.get('/user/:user_id', async (req, res) => {

    try {
        const profile = await Profile.findOne({
            user : req.params.user_id //on link
        }).populate('user', ['name', 'avatar']);

        if (!profile) return res.status(400).json({
                msg : "There is no profile for this user"
            });
        
        res.json(profile);

    } catch (error) {
        console.log(error.message);
        if (err.kind == 'ObjectId') { return res.status(400).json({
            msg: "There is no profile for this user"
        
        });
     }
             res.status(500);

    }

});

//@route Delete request api/profile
//desc   Get all profile, user & post
//@acess Private

router.delete('/', auth, async (req, res) => {

    try {
        //@todo rmeove users posts



        //remove profile
         await Profile.findOneAndRemove({
             user: req.user.id
         });
         //remove user
         await User.findOneAndRemove({
             _id: req.user.id
        });
        
        res.json({  msg : "user removed" });

    } catch (error) {

        console.log(error.message);
        res.status(500).send('sever error');
    }

});

//@route put request api/profile/experience
//desc  add profile experience
//@acess Private

router.put ('/experience',[auth, [ 
    check('title', 'Title is required')
    .not()
    .isEmpty(),
    check('company', 'Company is required')
    .not()
    .isEmpty(),
    check('from', 'From date is required')
    .not()
    .isEmpty()    
]], async (req,res) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            errors: errors.array()
        });
    }

    const { 
        title, company, location, from, to, current,description
    } = req.body; 

    const newExp = { 
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try { 
        const profile = await Profile.findOne( {
            user : req.user.id
        })

        profile.experience.unshift(newExp);

        await profile.save(); 

        res.json(profile);
    }
    catch (err) { 
        console.error(err.message)
        res.status(500).send('Server Error')
    }
    
}); 


//@route DEL request api/profile/experience/:exp_id
//desc  delete profile experience
//@acess Private
 router.delete ('/experience/:exp_id', auth, async (req,res)=> {
    try {

        const profile = await Profile.findOne({
            user: req.user.id
        });

        const removeIndex = profile.experience
        .map(item =>item.id)
        .indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex,1); 

        await profile.save();

        res.json(profile);
        
    } catch (error) {
        console.log(error)
        res.status(400).send('server error');
    }

 });

 //@route put request api/profile/education
//desc  add profile experience
//@acess Private


router.put('/education', [auth, [
    check('school', 'school is required')
        .not()
        .isEmpty(),
    check('degree', 'degree is required')
        .not()
        .isEmpty(),
    check('fieldofstudy', 'field of study is required')
        .not()
        .isEmpty(),
    check('from', 'from date is required')
        .not()
        .isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const {
        school,
        degree,
        fieldofstudy,
         from, 
         to, 
         current, 
         description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })

        profile.education.unshift(newEdu);

        await profile.save();

        res.json(profile);
    }
    catch (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
    }

});


//@route DEL request api/profile/education/:edu_id
//desc  delete profile experience
//@acess Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {

        const profile = await Profile.findOne({
            user: req.user.id
        });

        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (error) {
        console.log(error)
        res.status(400).send('server error');
    }

});

//@route DEL request api/profile/github/:username
//desc  Get user repos from gh
//@acess Public

router.get('/github/:username', async (req, res) => {

    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&cleint_secret=${config.get('githubSecret')}`, 
            method: 'GET', 
            headers: { 'user-agent': 'node.js'}

        };

        request(options, (error,response,body) => { 
            if(error) console.error(error);

            if (response.statusCode !== 200) {
                res.status(404).json({ msg : "no github profile found"})
            }

            res.json(JSON.parse(body));
        });


    } catch (error) {
        console.log(error.message);
        res.status(500).send('server error');
    }

});

module.exports = router;