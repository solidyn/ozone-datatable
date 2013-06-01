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
		],
		countByPlot,
		columnSelectDialogMode;

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
		$("#color-by-columns-selector").empty();
		populateSelectColumnDiv("color-by-columns-selector", data, associatedDataTableColumn);
		
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
				} else if (selectedOption === "Count By" || selectedOption === "Histogram") {
					columnSelectDialogMode = selectedOption;
					$('#column-selector-modal').modal();
				} 
		    }
		 });

		 populateColorByDialog(data, associatedDataTableColumn);
		 populateSelectColumnDiv("column-selector", data, associatedDataTableColumn); 
	}
	
	function appyColorBinsToColumn(columnTitle) {
		var index = $("#datatable tr th:contains('" + columnTitle + "')").index();
		if (index > -1) {
			$("#datatable tbody").find('tr').each(function () {
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
	
	function registerHistogramClickHandler() {
		$("#select-column-button").click(function () {
			if (columnSelectDialogMode !== "Histogram") {
				return;
			}
			
			var selectedColumn = $('#column-selector input[name=column-options]:checked').val();
			
			// Count the total number of values and sort them in an array
			var index = $("#datatable tr th:contains('" + selectedColumn + "')").index();
			var sortedData = [];
			var rows = $("#datatable tbody").find('tr');
			var numDataPoints = rows.length;
			
			if (index > -1) {
				$("#datatable tbody").find('tr').each(function () {
					var cell = $(this).children('td').get(index);
					sortedData.push(parseFloat($(cell).html()));					
				});
				sortedData.sort(function(a,b){return a - b})
			}
			
			// now find out how many values are in each bin
			var numBins = Math.ceil(Math.sqrt(numDataPoints)),
			    minValue = sortedData[0],
				maxValue = sortedData[sortedData.length -1],
				range = maxValue - minValue,
				binSize = range / numBins,
				binNumber = 0,
				binMap = {};
				
			for (var i = 0; i < sortedData.length; i += 1) {
				if (sortedData[i] > minValue + (binNumber + 1) * binSize) {
					binNumber += 1;
				}
				binMap[binNumber] ? binMap[binNumber] += 1 : binMap[binNumber] = 1;
			}
			
			var ticks = [],
				values = [];
			
			for (var tick in binMap) {
				ticks.push(Math.floor(((minValue + tick * binSize + (binSize/2)) * 10)) / 10);
				values.push(binMap[tick]);
			}
			
			// Delete the graph if it exists already
			if (countByPlot) {
				countByPlot.destroy();
			}
			
			countByPlot = $.jqplot('countByChart', [values], {
		        // The "seriesDefaults" option is an options object that will
		        // be applied to all series in the chart.
		        seriesDefaults:{
		            renderer:$.jqplot.BarRenderer,
		            rendererOptions: {fillToZero: true,
					barMargin: 3}
		        },
		        axes: {
		            // Use a category axis on the x axis and use our custom ticks.
		            xaxis: {
		                renderer: $.jqplot.CategoryAxisRenderer,
		                ticks: ticks
		            },
		            // Pad the y axis just a little so bars can get close to, but
		            // not touch, the grid boundaries.  1.2 is the default padding.
		            yaxis: {
		                pad: 1.05,
						tickInterval: 1,
						min: 0
		            }
		        }
		    });
		});
	}
	
	function registerCountByClickHandler() {
		$("#select-column-button").click(function () {
			if (columnSelectDialogMode !== "Count By") {
				return;
			}
			var selectedColumn = $('#column-selector input[name=column-options]:checked').val();
			// create a map for each value in the column to how many times it exists
			var index = $("#datatable tr th:contains('" + selectedColumn + "')").index();
			var countMap = {};
			
			if (index > -1) {
				$("#datatable tbody").find('tr').each(function () {
					var cell = $(this).children('td').get(index),
					    value = $(cell).html();
					
					countMap[value] ? countMap[value] += 1 : countMap[value] = 1;
				});
			}
			var ticks = [],
				values = [];
				
			for (var tick in countMap) {
				ticks.push(tick);
				values.push(countMap[tick]);
			}
			
			// Delete the graph if it exists already
			if (countByPlot) {
				countByPlot.destroy();
			}
			
			countByPlot = $.jqplot('countByChart', [values], {
		        // The "seriesDefaults" option is an options object that will
		        // be applied to all series in the chart.
		        seriesDefaults:{
		            renderer:$.jqplot.BarRenderer,
		            rendererOptions: {fillToZero: true}
		        },
		        axes: {
		            // Use a category axis on the x axis and use our custom ticks.
		            xaxis: {
		                renderer: $.jqplot.CategoryAxisRenderer,
		                ticks: ticks
		            },
		            // Pad the y axis just a little so bars can get close to, but
		            // not touch, the grid boundaries.  1.2 is the default padding.
		            yaxis: {
		                pad: 1.05,
						tickInterval: 1,
						min: 0,
		                tickOptions: {
						}
		            }
		        }
		    });
			
			console.log("countMap: " + JSON.stringify(countMap));
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
		registerCountByClickHandler();
		registerHistogramClickHandler();
	}
	
	initialize();
	
	return this;
};