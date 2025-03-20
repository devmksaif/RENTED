const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
    {
    usernom: {
        type : String,
        required: true
    },
    email:{
        type : String,
        required: true
    },
    password:{
        type : String,
        required: true
    }
    }, 
    {timestamps : true}
)

module.exports = mongoose.model('users', contactSchema)