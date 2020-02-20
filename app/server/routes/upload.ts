import { S3 } from 'aws-sdk';
require('dotenv').config();

const uploadFile = (file: Blob) => {
	const s3 = new S3({
		endpoint: `s3.us-east.amazonaws.com/food-waste`,
		s3BucketEndpoint: true,
		secretAccessKey: process.env.S3_SECRET,
		accessKeyId: process.env.S3_KEY,
	});

	const params = {
		Bucket: process.env.S3_BUCKET_NAME,
		Key: 'randomString.png',
		Body: file,
	};

	s3.upload(params, (err: Error, data: S3.ManagedUpload.SendData) => {
		if (err) {
			throw err;
		}
	});
};
