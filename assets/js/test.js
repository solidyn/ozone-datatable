OWF.ready(function() {
    $(document).ready(function() {
		$("#add-data").on("click", function() {
			var data = {
			  data: [
			    ["1", "dog", "runs"],
			    ["2", "cats", "purrs"]
			  ],
			  columns: [
			    {
				  "title": "number", "visible": false
				},
			    {
				  "title": "animal"
				},
				{
			      "title": "action"
			    }
			  ]
			};
			// if ($("#eventRadio").is(':checked')) {
			// 		OWF.Eventing.publish("com.solidyn.universe-commands", data);
			// 	} else {
				OWF.Intents.startActivity(
		            {
		                action:'addData', dataType:'application/com.solidyn.tabledata'
		            },
					data,
		            function (dest) {

		            }
		        );
			//}
		});
	});
});