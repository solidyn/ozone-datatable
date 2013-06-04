OWF.ready(function() {
    $(document).ready(function() {
		$("#add-data").on("click", function() {
			var data = {
			  rows: [
			    ["1", "dog", "runs", 0.717456],
			    ["2", "cats", "purrs", 0.424564],
				["5", "cats", "scratch", 0.43234584],
				["9", "reptiles", "<a href='http://google.com' target='_blank'>hiss<a>", 0.0100292],
			    ["7", "birds", "squawk", 1.023948, {
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
				  "title": "average height"
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