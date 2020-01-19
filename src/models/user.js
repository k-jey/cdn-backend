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
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value){
            if (value.includes('password')){
                throw new Error ('The password contains word PASSWORD')
            }
        }
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

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user){
        throw new Error ('Unable to Login')
    }

    const isValidLogin = await bcrypt.compare(password, user.password)

    if (!isValidLogin){
        throw new Error ('Unable to Login')
    }

   return user 
}


// Hash the plain text password
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = monggose.model('User', userSchema)

module.exports = User