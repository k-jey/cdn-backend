const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    } catch (e){
        res.status(400).send()
    }   
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send()
    } catch (e){
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch(e){
        res.status(500).send()
    }
})

router.get('/user/:id', async (req,res)=>{

    try{
        const user = await User.findOne({ _id: req.params.id })

        if (!user){
            return res.status(404).send()
        }
        res.send(user)
    }catch (e){
        res.status(500).send(e)
    }
})

router.get('/users/all', async (req, res)=>{

    try {
        const users = await User.find({ userRole: 2 })

        if(!users){
            return res.status(404).send()
        }
        res.send(users)
        
    } catch(e){
        res.status(500).send()
    }
})

///users/search?search=css
router.get('/users/search', auth, async (req, res)=>{

    try {
        if (req.user.userRole === 1){

            let searchParameter = ""

            if (req.query.search){
                searchParameter = req.query.search
            }
            
            console.log(searchParameter)
            const users = await User.find({ userRole: 2, skillSet: { "$in" : searchParameter } })

            if(!users){
                return res.status(404).send()
            }
            res.send(users)
        } else {
            return res.status(401).send()
        } 
    } catch(e){
        res.status(500).send()
    }
})

router.patch('/user/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'contact', 'password', 'skillSet', 'hobby']
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidUpdate){
        return res.status(400).send({error: 'Invalid Update'})
    }
    
    try{
        const user = await User.findOne({ _id: req.params.id })

        if (!user){
            return res.status(404).send()
        }

        updates.forEach((update) => user[update] = req.body[update])
        await user.save()
        res.send(user)
    } catch (e){
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res)=> {
    
    try{
        const user = await User.findOneAndDelete({ _id: req.params.id })

        if (!user){
            return res.status(404).send()
        }

        sendCancelationEmail(user.email, user.name)
        res.send(user)

    }catch (e){
        res.status(500).send(e)
    }
})

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            cb(new Error ('The File must be a picture'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send( {error: error.message} )
})

router.delete('/users/me/avatar', auth, async(req, res)=>{
    try{
        req.user.avatar = undefined
        await req.user.save()
        res.send()
    }catch(e){
        res.status(400).send()
    }
})


router.get('/users/:id/avatar', async (req, res) => {
    try{

        const user = await User.findById(req.params.id)

        if (!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }catch(e){
        res.status(400).send()
    }
})
module.exports = router