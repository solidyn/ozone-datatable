OWF.ready(function() {
    $(document).ready(function() {
		$("#add-data").on("click", function() {
			var data = {
			  data: [
			    ["1", "dog", "runs"],
			    ["2", "cats", "purrs"],
			    ["7", "birds", "squawk", {
					data: [
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
			    },
				{
				  "type": "associatedData"
				}
			  ]
			};
			OWF.Intents.startActivity(
	            {
	                action:'addData', dataType:'application/com.solidyn.tabledata'
	            },
				data,
	            function (dest) {

	            }
	        );
		});
	});
});