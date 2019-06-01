

module.exports = function (app){
    const control = require('./controller');

    app.route('/map')
        .get(control.get_all_map)
        .post(control.create_map);
    
    app.route('/map/:id')
        .put(control.update_map)
        .get(control.get_map)
        .delete(control.delete_map);
}