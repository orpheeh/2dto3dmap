const mongoose = require('mongoose');


const Map = mongoose.Schema({
    name: { unique: true, require: true, type: String},
    batiment: [
        {
            mur_ext: [ { x: Number, y: Number } ], 
            mur_int: {
                step: [
                    [{x: Number, y: Number}]
                ],
                current: Number
            }
        }
    ],
    filename: {type: String, require: true}
});

module.export = mongoose.model('Map', Map);