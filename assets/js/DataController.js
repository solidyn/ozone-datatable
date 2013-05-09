var DATATABLEWIDGET = DATATABLEWIDGET || {};
var OWF = OWF || null;

DATATABLEWIDGET.DataController = function () {
	var dataTable = null;
	function initialize () {
		OWF.Intents.receive(
            {
                action: 'addData',
                dataType: 'application/com.solidyn.tabledata'
            },
            function (sender, intent, data) {
                console.log("received data: " + JSON.stringify(data));
                addData(data);
            }
        );
		
	}
	
	function addData (data) {
		var i,
            columns = [];
		
		// Remove all data in the table
        $("#no-data").hide();
		if (dataTable != null) {
			dataTable.fnDestroy();
		}
		
		for (i = 0; i < data.columns.length; i += 1) {
			columns.push({"sTitle" : data.columns[i]});
		}
		
		dataTable = $('#datatable').dataTable({
            "aaData": data.data,
            "aoColumns": columns
        });
	}
	
	initialize();
	
	return this;
};