var DATATABLEWIDGET = DATATABLEWIDGET || {};
var OWF = OWF || null;

DATATABLEWIDGET.DataController = function () {
	var dataTable = null,
		displayedData;

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
	
	// Moves the data over one column to make room for the +/- column
	function adjustForAssociatedData (data, associatedDataColumn) {
		for (var i = 0; i < data.length; i += 1) {
			if(data[i].length <= associatedDataColumn) {
				data[i].unshift("");
			} else {
				data[i].unshift("<img id='" + i + "' class='details-toggle' src='assets/img/details_open.png'></img>");	
			}
		}
		return data;
	}
	
	function formatSubTable (table_id) {
		return "<table id='details_" + table_id + "'></table>";
	}
	
	function initializeSubTable(associatedDataTableColumn) {
		$(".details-toggle").click(function() {
			var nTr = $(this).parents('tr')[0];
		    if (dataTable.fnIsOpen(nTr)) {
                /* This row is already open - close it */
                this.src = "assets/img/details_open.png";
                dataTable.fnClose(nTr);
            }
            else {
                /* Open this row */
                this.src = "assets/img/details_close.png";
				var id = $(this).attr("id");
                dataTable.fnOpen(nTr, formatSubTable(id), 'details');

				var subTableColumns = [];
				for (var j = 0; j < displayedData[id][associatedDataTableColumn].columns.length; j += 1) {
					subTableColumns.push({"sTitle": displayedData[id][associatedDataTableColumn].columns[j].title});
				}
				
				$("#details_" + id).dataTable({
					"aaData": displayedData[id][associatedDataTableColumn].data,
					"aoColumns": subTableColumns,
					"sDom": 'C<"clear">Rlfrtip',
					"sPaginationType": "bootstrap"
				});
            }	
		});
	}
	
    function initializeContextMenu() {
		$('tbody').contextmenu({
		    target: '#context-menu',
		    onItem: function(e, item) {
		    	if($(item).text() === "Color By") {
					$('#column-selector-modal').modal();
				}
		    }
		 });

		$("#select-column-button").click(function() {
			var selectedColumnValue = $('input[name=column-options]:checked').val();
		});
	}
	
	function addData (data) {
		var i,
            columns = [],
			handleAssociatedData = false,
			massagedData = data.data,
			associatedDataTableColumn = -1;
		
		// Remove all data in the table
        $("#no-data").hide();
		if (dataTable) {
			dataTable.fnDestroy();
		}
		
		for (i = 0; i < data.columns.length; i += 1) {
			if (data.columns[i].type !== "associatedData") {
				// This works because setting bVisible to undefined is equivalent to true not false
				columns.push({"sTitle" : data.columns[i].title, "bVisible": data.columns[i].visible});		
				$("#columns-selector").append("<label class='radio'><input type='radio' name='column-options' value='" + data.columns[i].title + "'>" + data.columns[i].title + "</label>")
			} else {
				// Puts an untitled column in the first spot where the plus/minus icon will go
				columns.unshift({"sTitle" : ""});
				handleAssociatedData = true;
				// +1 because we are going to shift it below
				associatedDataTableColumn = i;
			}
		}
		
		if (handleAssociatedData) {
			massagedData = adjustForAssociatedData(massagedData, associatedDataTableColumn);
			associatedDataTableColumn += 1;
		}
		
		displayedData = massagedData;

		dataTable = $('#datatable').dataTable({
            "aaData": massagedData,
            "aoColumns": columns,
			"sDom": 'TC<"clear">Rlfrtip',
			"sPaginationType": "bootstrap",
			"oTableTools": {
				"sSwfPath": "assets/js/lib/datatables/extras/TableTools/swf/copy_csv_xls_pdf.swf",
				"aButtons": [
					"copy",
					"print",
					{
						"sExtends":    "collection",
						"sButtonText": "Save",
						"aButtons":    [ "csv", "xls", "pdf" ]
					}
				]
			}
        });

		if (data.style) {
			$("table").attr("style", data.style);
		}
		
		initializeSubTable(associatedDataTableColumn);
		initializeContextMenu();
	}
	
	initialize();
	
	return this;
};