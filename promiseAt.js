var Airtable = require('airtable');
var Promise = require('promise');
var json2csv = require('json2csv');
var fs = require('fs');
var csv = require('fast-csv');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyKWYJPOEObWhNt2'
});
var base = Airtable.base('app4qIwfmG0ZKAdBH');
var view = 'Main View';
var places = "places";
var people = "people";
var objects = "objects";
var events = "events";
var media = "media";
var types = "types";
var tags = "tags";
var categories = "categories";
var themes = "themes";
var links = "links";



function getrecords(base, view) {
    return new Promise(function(resolve, reject){
        var tab = []; 
        base('people').select({
            view: view
        }).eachPage(function page(records, fetchNextPage) {
            records.forEach(function(record) {
                tab.push({
                    'Name':record.get('Name'),
                    'Notes': record.get('Notes')
                });
            });
            fetchNextPage();
            resolve(tab);
            reject("Nonononon");
        });
    });
}

     getrecords(base, view)
    .then(function(res){
        return res;
    }).then(function(res){console.log("hi")})


function tabToCSV(tab){
    console.log(tab);
    var fields =  ['Name', 'Notes'];
    var csv = json2csv({data: tab, fields: fields});
    fs.writeFile ('record.csv', csv, function(err){
    if(err) throw err;
    console.log('file saved')
;});
}

function fastcsv(tab){
    console.log(tab);
    var ws = fs.createWriteStream("my.csv");
    csv.write(tab, {headers:true}).pipe(ws);
    //csv.writeToStream(fs.createWriteStream("my.csv"), tab, {headers: true});
    console.log("done");
    }

function process(record){
    var tabOfLinked = [];
    var linked = 'linked';
    //var tab = [{'a':'olala', 'b':'obebe'}, {'linked-x':"hello world", 'linked_y':"hello world 2"}];
    for (var i = 0; i < tab.length;i++){
    Object.keys(tab[i]).forEach(function(key){
        if (key !="undefined"){
        if (key.indexOf(linked) != -1 ){
        console.log(key);
        tabOfLinked.push(key);
        }
 }
    })
}
console.log(tabOfLinked);
return tabOfLinked;
}