const express = require('express')
const env = require('dotenv')
const multer = require('multer')
const cors = require('cors')
const mongoose = require('mongoose')
const File = require('./model/File')
const fs = require('fs')
const path = require('path')
const { Downloader } = require('nodejs-file-downloader')

env.config()
const port = process.env.port



// connect to the database
async function  connectToDatabase() {
  const connection = await mongoose.connect(process.env.DB_URL)
  if (connection) {
    console.log('connected to the database')
  } else {
    console.log('error connecting to the database')
  }
}

function configureStorage() { 
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    }
  })

  const upload = multer({ storage: storage })
  return upload
}

// create the app 
const app = express()
app.use(cors())


connectToDatabase()


app.get('/', (req, res) => {
  res.send({
    message: "your app is running so good."
  })
})

const upload = configureStorage()

app.post('/upload', upload.single("file"), async (req, res) => {
  console.log(req.file)
  // save the file to the database
  const fileUploaded = new File({
    ...req.file
  })

  const savingFile = await fileUploaded.save()
  if(savingFile) {
    console.log("file saved successfully")
    res.send({
      message: "file uploaded successfully",
      file: req.file
    })
  } else {  
    console.log("error saving file")    
  }
})

app.get('/files', async (req, res) => {
  // get the files
  const files = await File.find({}, 'originalname')
  
  // return the files
  res.status(200).send(files)
    
})

app.delete('/delete/:filename', async (req, res) => {
  var {dbDeleted, serverDeleted} = false
  const filename = req.params.filename
  console.log(filename)
  // delete the file from the database
  try{
    const deletedFileDb = await File.deleteOne({ originalname: filename })
    if (deletedFileDb) {
      dbDeleted = true
    }
  } catch (error) {
    console.log(error)
  }
  

  // delete the file from the server
  try {
    const deletedFileServer = fs.unlinkSync(`uploads/${filename}`)
    if (deletedFileServer) {
      serverDeleted = true
    }
  } catch (error) { 
    console.log(error)
  }

  if (dbDeleted && serverDeleted) {
    res.send({
      message: "file deleted successfully"
    })
  } else {
    res.send({
      message: "error deleting file"
    })
  }
})

app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename
  const filepath = path.join(__dirname, 'uploads', filename)

  console.log(filepath)

  res.download(filepath, filename, (error) => {
    if (error) {
      console.log(error)
    } else {
      console.log("file downloaded successfully")
    }
  })
})

app.listen(port, () => {
  console.log(`the mutler app is running on port ${port}`)
})