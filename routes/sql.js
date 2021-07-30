var sqlite3 = require('sqlite3').verbose();
var file = "hr";
var db = new sqlite3.Database(file);
db.all("SELECT first_name,last_name FROM employees", function(err, rows) {
        rows.forEach(function (row) {
            console.log(row.first_name, row.last_name);
        })
	});	
db.close();