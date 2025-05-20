require("dotenv").config();
const express=require("express")
const path = require("path");
const multer= require("multer");
const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");
const uuid=require("uuid").v4
const app =express()

console.log("Loaded ENV Vars:", {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
  AWS_REGION: process.env.AWS_REGION,
});

app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.memoryStorage()

const allowedTypes = ['image', 'application', 'text', 'video', 'audio'];

const fileFilter = (req, file, cb) =>{
    
    const fileType = file.mimetype.split("/")[0];
    if(allowedTypes.includes(fileType)
    ){
        cb(null, true)

    }
    else{
        cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false)
    }
}

const upload = multer({
    storage, 
    fileFilter, 
    limits: {fileSize: 5*1024*1024, files:2}});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.array("file"), async(req, res) =>{
    try{
    //const file= req.files[0]
    console.time("upload-to-s3");
    const results = await s3Uploadv3(req.files)
    console.timeEnd("upload-to-s3");
    console.log(results)
    //res.send('File uploaded successfully!');
    // res.json({status:"success"});
   // return  res.send(`<h2>File uploaded successfully: ${results.Location}</h2><a href="/">Go back</a>`);
  //  return res.send(`<h2>File(s) uploaded successfully:</h2><ul>${results.map(r => `<li>${r.Location}</li>`).join('')}</ul><a href="/">Go back</a>`);
        return res.json({ status: "success", urls: results.map(r => r.Location) });
   
    }
    //console.log(req.files);
    //res.json({status:"success", files: req.files});
    catch(error){
        console.error('Error uploading to S3:', error);
        res.status(500).json({status: "error", message: error.message});
    }
});


app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File is too large" });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: "Invalid file type" });
        }
    }

    return res.status(500).json({ message: "Something went wrong", error: error.message });
});


app.listen(4000, ()=>console.log("Listening to the port 4000"));