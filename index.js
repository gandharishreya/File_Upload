require("dotenv").config();
const express=require("express")
const path = require("path");
const multer= require("multer");
const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");
const uuid=require("uuid").v4
const app =express()

app.use(express.static(path.join(__dirname, 'public')));

/*
Array of files 
const upload = multer({dest: "uploads/"});
app.post('/upload', upload.array("file"), (req, res) =>{

    res.json({status:"success"});
})
*/
/* multi files with names
const upload = multer({dest: "uploads/"});
const multiupload =upload.fields([
    {name:"avatar", maxCount:1},
    {name:"resume", maxCount:1},
])
app.post('/upload', multiupload, (req, res) =>{
    console.log(req.files);
    res.json({status:"success"});
})
*/
/*
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads");
    },
    filename: (req, file, cb)=>{
        const {originalname} = file;
        cb(null, `${uuid()}-${originalname}`);
    },
})
*/

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

/*app.post('/upload', upload.array("file"), async(req, res) =>{
    try{
   // const file= req.files[0]
    const results = await s3Uploadv2(req.files)
    console.log(results)
    return res.json({status:"success"});
    }
    //console.log(req.files);
    //res.json({status:"success", files: req.files});
    catch(error){
        console.error('Error uploading to S3:', error);
        res.status(500).json({status: "error", message: error.message});
    }
});
*/

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
    return res.json({ status: "success", message: "File uploaded successfully!" });

   
    }
    //console.log(req.files);
    //res.json({status:"success", files: req.files});
    catch(error){
        console.error('Error uploading to S3:', error);
        res.status(500).json({status: "error", message: error.message});
    }
});

/*app.use((error, req, res, next)=>{
    if(error instanceof multer.MulterError){
        if(error.code === "LIMIT_FILE_SIZE"){
            return res.json({
                message: "file is too large"
            })
        }
    }
    if(error.code === "LIMIT_FILE_SIZE"){
            return res.json({
                message: "file is limit reached"
            })
        }

        if(error.code === "LIMIT_UNEXPECTED_FILE"){
            return res.status(400).json({
                message: "file must be an image",
            })
        }

})*/
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "File is too large" });
        }

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({ message: "File must be an image" });
        }
    }

    return res.status(500).json({ message: "Something went wrong", error: error.message });
});


app.listen(4000, ()=>console.log("Listening to the port 4000"));