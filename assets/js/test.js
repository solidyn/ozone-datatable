OWF.ready(function() {
    $(document).ready(function() {
		$("#add-data").on("click", function() {
			var data = {
			  data: [
			    ["1", "dog", "runs"],
			    ["2", "cats", "purrs"],
				["5", "cats", "scratch"],
				["9", "reptiles", "<a href='http://google.com' target='_blank'>hiss<a>"],
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
			  ],
			  style: "font-size: 20px"
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