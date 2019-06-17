const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/2dto3dmap', { useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Impossible de se connecter à mongodb, désolé !"));

require('./model');
const Map = mongoose.model('Map');

exports.get_all_map = function(req, res){
    Map.find({}, function(err, maps){
        if(err)
            res.send(err);
        else
            res.json(maps);
    })
}

exports.create_map = function(req, res){
    const map = new Map(req.body);
    map.save(function(err, new_map){
        if(err)
            res.send(err);
        else
            res.json(new_map);
    });
}

exports.update_map = function(req, res){
    Map.findOneAndUpdate({"_id" : req.params.id }, req.body, function(err, doc){
        if(err)
            res.send(err);
        else{
            res.json(doc);
        }
    });
}

exports.delete_map = function(req, res){
    Map.findOneAndDelete({ _id: req.params.id }, function(err, doc){
        if(err)
            res.send(err);
        else
            res.json(doc);
    });
}

exports.get_map = function(req, res){
    Map.findById(req.params.id, function(err, doc){
        if(err)
            res.send(err);
        else
            res.json(doc);
    });
}