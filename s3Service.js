const {S3} = require("aws-sdk");
const {S3Client, PutObjectCommand} = require("@aws-sdk/client-s3")
const uuid = require("uuid").v4
exports.s3Uploadv2 = async(files) =>{
    const s3 =new S3({
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,  // Use environment variable or fallback to 'us-east-1'
    });

   /* const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${uuid()} - ${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };*/
   // return await s3.upload(param).promise();
   const params = files.map(file =>{
        return{
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()} - ${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        }

   }

   );

   return await Promise.all(
    params.map((param => s3.upload(param).promise()))

   );
   
};

exports.s3Uploadv3 = async(files)=>{
    const s3client = new S3Client({
         region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
    })

      const params = files.map(file =>{
        return{
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()} - ${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        }

   })

   return await Promise.all(
    params.map((param)=>s3client.send(new PutObjectCommand(param)))
   )

   // return s3client.send(new PutObjectCommand(param))
}