const cloudinary = require('cloudinary').v2
const {CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET} = process.env

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: CLOUD_API_KEY,
    api_secret: CLOUD_API_SECRET
})

const uploadToCloud = async (file, path) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({folder: path}, (err, res) => {
            if (err) reject(err)
            else resolve({url: res.secure_url})
        })['end'](file.data)
    })
}

exports.uploadFiles = async (req, res) => {
    try {
        const {path} = req.body
        const files = Object.values(req.files).flat()
        let media = []

        for (const file of files) {
            const url = await uploadToCloud(file, path)
            media.push(url)
        }
        return res.status(200).json(media)
    } catch (e) {
        return res.status(500).json({message: 'An error occurred during upload'})
    }
}
