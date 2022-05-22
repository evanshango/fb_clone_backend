const Post = require('../models/postModel')
// const User = require('../models/userModel')

exports.createPost = async (req, res) => {
    try {
        const post = await new Post(req.body)
        const newPost = await post.save()
        return res.status(201).json(newPost)
    } catch (e) {
        return res.status(500).json({message: 'Unable to create a post. Please try again...'})
    }
}
