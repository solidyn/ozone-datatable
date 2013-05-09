var DATATABLEWIDGET = DATATABLEWIDGET || {};
var OWF = OWF || null;

DATATABLEWIDGET.DataController = function () {
	function initialize () {
		// OWF.Intents.receive(
		//             {
		//                 action: 'addData',
		//                 dataType: 'application/com.solidyn.tabledata'
		//             },
		//             function (sender, intent, data) {
		//                 console.log("received data: " + JSON.stringify(data));
		//             }
		//         );
		
	}
	
	function addData (data) {
		var i,
            columns = [];
		
		// Remove all data in the table
		$("#datatable").empty();
		
		for (i = 0; i < data.columns.length; i += 1) {
			columns.push({"sTitle" : data.columns[i]});
		}
		
		$('#datatable').dataTable({
            "aaData": data.data,
            "aoColumns": columns
        });
	}
	
	initialize();
	
	var data = {
	  data: [
	    ["1", "dog", "runs"],
	    ["2", "cats", "purrs"]
	  ],
	  columns: [
	    "number",
	    "animal",
	    "action"
	  ]
	};
	
	addData(data);
	return this;
};