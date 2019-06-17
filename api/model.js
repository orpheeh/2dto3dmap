const mongoose = require('mongoose');


const Map = mongoose.Schema({
    name: { unique: true, require: true, type: String},
    batiment: [
        {
            name: String,
            mur_ext: [ { x: Number, y: Number } ], 
            mur_int: {
                step: [
                    [{x: Number, y: Number}]
                ],
            }
        }
    ],
    filename: {type: String, require: true}
});

module.export = mongoose.model('Map', Map);