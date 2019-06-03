
const create = document.querySelector('#create');
const chooser = document.querySelector('#map-choose');
const open = document.querySelector('#open');

window.addEventListener('load', function(){
    request('http://127.0.0.1:3000/map', 'GET', JSON.stringify({}), function(json){
        for(let i = 0; i < json.length; i++){
            const option = document.createElement('option');
            option.value = json[i]._id;
            option.innerHTML = json[i].name;
            chooser.appendChild(option);
        }
    });
});

create.addEventListener('click', function(){
    const name = document.querySelector('#map-name').value;
    if(name === ""){
        return;
    }
    const file = document.querySelector('#themap');
    const fd = new FormData();
    fd.append('map', file.files[0]);
    fd.append('name', name);

    request('http://127.0.0.1:3000/upload', 'POST', fd, function(json){
        window.location = './app.html?id=' + json._id + '&name=' + json.name;
    });
});

open.addEventListener('click', function(){
    let name = "";
    for(let i = 0; i < chooser.children.length; i++)
        if(chooser.children[i].selected)
            name = chooser.children[i].innerHTML;
    window.location = './app.html?id=' + chooser.value + '&name=' + name;
});

function request(url, method, data, callback){
    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            console.log(this.responseText);
            callback(JSON.parse(this.responseText));
        }
    }
    xhr.open(method, url, true);
    xhr.send(data);
}