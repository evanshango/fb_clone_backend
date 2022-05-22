module.exports = async (req, res, next) => {
    try {
        let message = ''
        if (!req.files || Object.values(req.files).flat().length === 0)
            return res.status(400).json({message: 'No files selected'})

        let files = Object.values(req.files).flat()
        files.forEach(file => {
            if (!file.mimetype.match(/^image/)) message = 'Unsupported file format'
            if (file.size > (1024 * 1024 * 5)) message = 'File too large'
        })
        if (message !== '') return res.status(400).json({message})
        next()
    } catch (e) {
        return res.status(500).json({message: e?.message})
    }
}
