const monggose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new monggose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error('Please Enter the Valid Email')
            }
        }
    },
    contact: {
        type: String,
        required: true,
        
    },
    hobby: {
        type: String
        
    },
    skillSet: {
        type: Array
    },
    userRole: {
        type: Number,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.methods.toJSON = function () {
    const user = this

    const userObject = user.toObject()

    return userObject
}

const User = monggose.model('User', userSchema)

module.exports = User