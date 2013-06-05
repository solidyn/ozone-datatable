ozone-datatable
===============

A flexible data table/list view Ozone Widget
--------------------------------------------

This widget accepts list data with any columns and displays it in a data table.  It provides normal table options like sorting, filtering and exporting as CSV along with more advanced options like color-by, count-by and histograms.

Use of this widget is allowed under the TBD license

Getting Started
---------------

1. Downloading and serving the widget
* clone this repository or download it as a zip file
* copy the contents of the _site directory to your web server or serve the Universe Widget using jekyll
2. Configure the widgets for your web server
* modify the widgetUrl property of descriptor.html to point at the correct URL for where the widget is being served from
* if you want to use the test widget, modify the widgetUrl property of test_descriptor.html
3. Add the widgets to your running Ozone Widget Framework using the correct descriptor URLs
4. When you first run the widget you will see the message "No data added yet"

Sending data to the table
-------------------------
Data is sent to the table using Ozone intents.

* Add Data

		{
    		action:'addData',
    		dataType:'application/com.solidyn.tabledata'
		}
		data: {...} // described below
		
* Data contains three pieces: rows, columns and style.  Rows and columns are required while style is optional.  Rows represent the actual data items in an array form.  Columns is an array of objects that describe the ordered elements in the row data.  For example, if our data has a number, an animal and an action a row might look like:

		["1", "dog", "runs"]
The columns for this data would be:

		[
		    {
			  "title": "number", "visible": false // causes this column to be hidden by default
			},
		    {
			  "title": "animal"
			},
			{
		      "title": "action"
		    }
		]
		
* Style can be passed for the table by passing CSS that will be applied to the table.  For example:

		style: "font-size: 20px"

* If your data has nested values in it, you can add it via associated data.  To do this, add a column to tell the widget that your data has associated data:

		{
			"type": "associatedData"
		}
The data passed in this column value should be a data structure containing rows and columns like regular data.  For example:

		["7", "birds", "squawk", {
			rows: [
				["red", "hawk"],
				["blue", "jay"],
				["yellow", "finch"],
				["green", "parrot"],
				["black", "crow"],
				["white", "seagull"],
				["golden", "eagle"]
			],
			columns: [
				{
					title: "color"
				},
				{
					title: "species"
				}
			]
		}]

Interacting with the table
--------------------------
Most of the functions of the table are self-explanatory including pagination, showing/hiding columns, copying, printing and saving table contents.  

* Context Menu
Right-clicking on the table you can also access the color-by, count-by and histogram functions.  These functions allow you to select which column to perform the operation on.

* Multi-column sort
You can sort multiple columns by holding down shift while clicking on the table header after having sorted on a column already.