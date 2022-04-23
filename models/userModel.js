const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema

const userSchema = new mongoose.Schema({
    firstName: {
        type: String, required: [true, 'FirstName is required'], trim: true, text: true
    },
    lastName: {
        type: String, required: [true, 'LastName is required'], trim: true, text: true
    },
    username: {
        type: String, required: [true, 'Username is required'], trim: true, text: true, unique: true, lowercase: true
    },
    email: {
        type: String, required: [true, 'Email is required'], trim: true, unique: true, lowercase: true
    },
    password: {
        type: String, required: [true, 'Password is required'], trim: true,
    },
    picture: {
        type: String, default: 'https://res.cloudinary.com/digua6dil/image/upload/v1650191850/default_pic_f33juu.png'
    },
    cover: {
        type: String
    },
    gender: {
        type: String, required: [true, 'Gender is required'], enum: ['Male', 'Female', 'Other']
    },
    bYear: {
        type: Number, required: true, trim: true
    },
    bMonth: {
        type: Number, required: true, trim: true
    },
    bDay: {
        type: Number, required: true, trim: true
    },
    verified: {
        type: Boolean, default: false
    },
    friends: {
        type: Array, default: []
    },
    followers: {
        type: Array, default: []
    },
    following: {
        type: Array, default: []
    },
    requests: {
        type: Array, default: []
    },
    search: [
        {
            user: {
                type: ObjectId, ref: 'User'
            }
        }
    ],
    details: {
        bio: {
            type: String
        },
        otherName: {
            type: String
        },
        job: {
            type: String
        },
        workPlace: {
            type: String
        },
        highSchool: {
            type: String
        },
        college: {
            type: String
        },
        currentCity: {
            type: String
        },
        hometown: {
            type: String
        },
        relationship: {
            type: String, enum: ['Single', 'In a relationship', 'Married', 'Divorced']
        },
        instagram: {
            type: String
        }
    },
    savedPosts: [
        {
            post: {
                type: ObjectId, ref: 'Post'
            },
            savedAt: {
                type: Date, default: new Date()
            }
        }
    ]
}, {
    timestamps: true
})

module.exports = mongoose.model('User', userSchema)
