const formidable = require('formidable');
const sharp = require('sharp');

module.exports.resize = (req, res) => {
    const form = formidable();
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.log(err);
            return;
        }
        const imageInput = files.image.filepath;
        // const contentType = files.image.type;
        sharp(imageInput)
            .resize(512, 512)
            .png()
            .toBuffer()
            .then((data) => {
                // const base64Data = data.toString('base64');
                // res.status(202).json({ b64Data: base64Data, contentType: contentType, extension: 'png' });
                return res.send(data);
            })
            .catch((err) => console.log(err));
    });
};