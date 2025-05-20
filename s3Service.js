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

/*
exports.s3Uploadv3 = async(files)=>{
    const s3client = new S3Client({
         region: process.env.AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
    })

     const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  const uploadResults = await Promise.all(
    files.map(async (file) => {
      const Key = `uploads/${uuid()} - ${file.originalname}`;

      const params = files.map(file =>{
        return{
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${uuid()} - ${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        }

 /*  })

   return await Promise.all(
    params.map((param)=>s3client.send(new PutObjectCommand(param)))
   )


   // return s3client.send(new PutObjectCommand(param))
    await s3client.send(new PutObjectCommand(params));

      return {
        Location: `https://${bucket}.s3.${region}.amazonaws.com/${Key}`,
      };
    })
  );

  return uploadResults;
}
*/

exports.s3Uploadv2 = async (files) => {
  const s3 = new S3({
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const params = files.map((file) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `uploads/${uuid()} - ${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
  });

  return await Promise.all(
    params.map((param) => s3.upload(param).promise())
  );
};

// AWS SDK v3 Upload (FIXED)
exports.s3Uploadv3 = async (files) => {
  const s3client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

  const bucket = process.env.AWS_BUCKET_NAME;
  const region = process.env.AWS_REGION;

  const uploadResults = await Promise.all(
  files.map(async (file) => {
      const Key = `uploads/${uuid()}-${file.originalname}`;

      const params = {
        Bucket: bucket,
        Key,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        await s3client.send(new PutObjectCommand(params));
        return {
          Location: `https://${bucket}.s3.${region}.amazonaws.com/${Key}`,
        };
      } catch (err) {
        console.error("S3 Upload error:", err);
        throw err;
      }
    })
  );


  return uploadResults;
};