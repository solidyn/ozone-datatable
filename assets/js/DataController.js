var DATATABLEWIDGET = DATATABLEWIDGET || {};
var OWF = OWF || null;

DATATABLEWIDGET.DataController = function () {
	var dataTable = null,
		displayedData,
		colorBins = [
			{
				color: "#ff0000", // red
				min: 0,
				max: 10
			},
			{
				color: "#00ff00", // green
				min: 10,
				max: 20
			},
			{
				color: "#0000ff", // blue
				min: 20,
				max: 30
			},
			{
				color: "#ffff00", // yellow
				min: 30,
				max: 40
			},
			{
				color: "#00ffff", // cyan
				min: 40,
				max: 50
			}
		];

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
	
	function populateSelectColumnDiv(div, data, associatedDataTableColumn) {
		$("#" + div).empty();
		for (var i = 0; i < data.columns.length; i += 1) {
			if (i !== associatedDataTableColumn - 1) {
				var columnIndex = associatedDataTableColumn > -1 ? i + 1 : i;
				$("#" + div).prepend("<label class='radio'><input column='" + columnIndex + "' type='radio' name='column-options' value='" + data.columns[i].title + "'>" + data.columns[i].title + "</label>")	
			}
		}
	}
	
	function populateColorByDialog(data, associatedDataTableColumn) {
		populateSelectColumnDiv("color-by-columns-selector", data, associatedDataTableColumn);
		$("#color-by-columns-selector").empty();
		
		$("#color-bins tbody").empty();
		for (var i = 0; i < colorBins.length; i += 1) {
			$("#color-bins tbody").append("<tr> \
				<td><div class='input-append color' data-color='" + colorBins[i].color + "' data-color-format='hex'> \
				  <input id='color_" + i + "' type='text' class='span1' value='" + colorBins[i].color + "' ><span class='add-on'><i style='background-color: " + colorBins[i].color + ";'></i></span></div></td> \
				<td><input type='text' id='min_" + i + "' value='" + colorBins[i].min + "'></td> \
				<td><input type='text' id='max_" + i + "' value='" + colorBins[i].max + "'></td> \
				</tr>"
			);
		}
		$('.color').colorpicker();

		$("#color-by-button").click(function() {
			var selectedColumn = $('input[name=column-options]:checked').val();
			
			for (var i = 0; i < colorBins.length; i += 1) {
				colorBins[i].color = $("#color_" + i).val();
				colorBins[i].min = parseFloat($("#min_" + i).val());
				colorBins[i].max = parseFloat($("#max_" + i).val());
			}
			
			appyColorBinsToColumn(selectedColumn);
		});
	}
	
    function initializeContextMenu(data, associatedDataTableColumn) {

		$('#datatable tbody').contextmenu({
		    target: '#context-menu',
		    onItem: function(e, item) {
			    var selectedOption = $(item).text();
		    	if (selectedOption === "Color By") {
					$('#color-by-modal').modal();
				} else if (selectedOption === "Histogram") {
					$('#column-selector-modal').modal();
				}
		    }
		 });

		 populateColorByDialog(data, associatedDataTableColumn);
		 populateSelectColumnDiv("column-selector", data, associatedDataTableColumn); 
		 populateSelectColumnDialog(data, associatedDataTableColumn);
	}
	
	function appyColorBinsToColumn(columnTitle) {
		var index = $("#datatable tr th:contains('" + columnTitle + "')").index();
		if (index > -1) {
			$("#datatable tbody").find('tr').each(function (){
				var cell = $(this).children('td').get(index),
				    color = findBinForValue(parseFloat($(cell).html()));
				
				if (color) {
					$(cell).css("background-color", color);	
				} else {
					$(cell).css("background-color", "");
				}
			});	
		}
	}
	
	function findBinForValue(value) {
		for (var i = 0; i < colorBins.length; i += 1) {
			if (colorBins[i].min < value && value <= colorBins[i].max) {
				return colorBins[i].color;
			}
		}
		return
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
			} else {
				// Puts an untitled column in the first spot where the plus/minus icon will go
				columns.unshift({"sTitle" : ""});
				handleAssociatedData = true;
				
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
			$("#datatable").attr("style", data.style);
		}
		
		initializeSubTable(associatedDataTableColumn);
		initializeContextMenu(data, associatedDataTableColumn);
	}
	
	initialize();
	
	return this;
};