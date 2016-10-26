var Airtable = require('airtable');
var json2csv = require('json2csv');
var fs = require('fs');

Airtable.configure({
    endpointUrl: 'https://api.airtable.com',
    apiKey: 'keyKWYJPOEObWhNt2'
});
var base = Airtable.base('app4qIwfmG0ZKAdBH');


function getList(view, base,callback ){
var tab = []; 
base('Table 1').select({
    view: view
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
    		tab.push({
		'Name':record.get('Name'),
		'Notes': record.get('Notes')
	});
    		console.log(record.get('Notes'));
         });
    fetchNextPage();
    callback(tab);
   // console.log(tab);
}, function done(error) {
    if (error) {
        console.log(error);
    }
});
};

function callbackTab(tab){
	var fields =  ['Name', 'Notes'];
	console.log(JSON.stringify(tab));
	var csv = json2csv({data: JSON.stringify(tab), fields: fields, del:','});
	fs.writeFile ('MainView.csv', csv, function(err){
	if(err) throw err;
	console.log('file saved')
;});
};

//getList('Main View', base, callbackTab);
var promise = function pgetList(view, base){
    base('Table 1').select({view: view})
    .eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
            tab.push({
        'Name' :record.get('Name'),
        'Notes':record.get('Notes')
    });
       });     
  fetchNextPage();
  return tab;
}, function done(error) {
    if (error) {
        console.log(error);
    }
});
}; 

console.log(promise('Main View', base).then(function(resut){
    return result;
}));




