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

router.put('/user/:id', async (req, res) => {
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

module.exports = router