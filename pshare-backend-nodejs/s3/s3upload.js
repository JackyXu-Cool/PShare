const fs = require("fs");
const AWS = require("aws-sdk");

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: "us-east-2"
})

const s3bucket = new AWS.S3();

const uploadFile = () => {
    fs.readFile("uploads/images/2fdd7240-8740-11ea-a552-61f8f6b22adf.jpeg", (err, data) => {
       if (err) throw err;
       const base64data = Buffer.from(data, "binary");
       const params = {
            Key: "pshare-backend-nodejs/backup.jpg",
            Body: base64data,
            Bucket: "elasticbeanstalk-us-east-2-252866775004",
            ACL:'public-read'
        }
       s3bucket.upload(params, function(s3Err, data) {
           if (s3Err) throw s3Err
           console.log(`File uploaded successfully at ${data.Location}`)
       });
    });
};

module.exports = uploadFile;