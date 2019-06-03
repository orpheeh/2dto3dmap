
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, __dirname + '/uploads')
    },
    filename: function (req, file, cb) {
        cb(null,  Date.now().toString() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
 });

require('./model');
const Image = mongoose.model('Image');
const Map = mongoose.model('Map');

module.exports = function (app) {
    const control = require('./controller');

    app.route('/map')
        .get(control.get_all_map)

    app.route('/map/:id')
        .put(control.update_map)
        .get(control.get_map)
        .delete(control.delete_map);

    app.post('/upload', upload.single('map'), function (req, res, next) {
        const map = new Map(req.body);
        map.filename = req.file.filename;
        map.save((err, newmap) => {
            if(err)
                res.send(err);
            res.json(newmap);
        });
    });

    app.get('/download/:id', function(req, res){
        Image.findById(req.params.id, function(err, img){
            if(err){
                res.send(err);
            }
            res.download(__dirname + '/uploads/' + img.filename);
        });
    });

    app.get('/images', function(req, res){
        Image.find({}, function(err, imgs){
            if(err)
                res.send(err);
            res.json(imgs);
        });
    });
}