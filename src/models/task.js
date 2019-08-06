const monggose = require('mongoose')
const validator = require('validator')

const taskSchema = new monggose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed:{
        type: Boolean,
        default: false
    },
    owner: {
        type: monggose.SchemaTypes.ObjectId,
        require: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Task = monggose.model('Task', taskSchema)

module.exports = Task