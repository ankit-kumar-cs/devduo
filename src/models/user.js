import mongoose from 'mongoose';
import validator from 'validator';
const userSchema = new mongoose.Schema({
    username: {
        type: 'string',
        validate: {
            validator: function(v) { return validator.isEmail(v)
            },
            message: (props) => `${props.value} is not a valid username!`
        },
        unique: true
    },
    name: {
        type: 'string',
        validate: {
            validator: function(v) {
                return v.length >= 3 && v.length < 30;
            },
            message: () => `Length of the name should be greater than two and less than 30`
        }
    },
    photo: {
        type: 'string'
    },
    googleId: {
        type: 'string'
    },
    emailVerified: {
        type: 'boolean',
        default: false
    }
})

export const User = mongoose.model('User', userSchema);
