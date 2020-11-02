const router = require('express').Router();
const passport = require('passport')


//Google authentication routes
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    res.redirect('/create_event/profile')
})


module.exports = router;