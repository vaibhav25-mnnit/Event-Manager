const router = require('express').Router();



//Middleware to check if user is loged in or not
const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login')
    } else (
        next()
    )
}


router.get('/', authCheck, (req, res) => {
    res.render('profile', {
        name: req.user.name,
        email: req.user.email,
        image: req.user.profile_photo
    })
})



module.exports = router;