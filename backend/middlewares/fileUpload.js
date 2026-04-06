const cloudinary = require('cloudinary').v2;
const multer = require('multer');
cloudinary.config({
  cloud_name: 'di6baswzt',
  api_key: '317938433555512',
  api_secret: 'wCRz21HDa7K3agECBJn_uplZc-k'
});

const upload = multer({ dest: 'uploads/' });

function uploadImage(req, res, next) {

  if (!req.body.image) {
      return next(); 
  }


  cloudinary.uploader.upload(req.body.image, function(error, result) {
      if (error) {
          console.error('Error uploading image to Cloudinary:', error);
          return res.status(500).json({ error: 'Error uploading image' }); // Return error if upload fails
      } else {
          req.imageUrl = result.url; // Save the uploaded image URL in the request object
          next(); // Proceed to the next middleware
      }
  });
}

module.exports = {uploadImage ,upload};
