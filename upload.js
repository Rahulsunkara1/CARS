import multer from 'multer'

const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  },
})

export const upload = multer({ storage: storage })

// export default { upload }
