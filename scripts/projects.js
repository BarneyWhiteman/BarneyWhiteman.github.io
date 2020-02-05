var start = "<div class='gif' style='position:relative;padding-bottom:54%'><iframe src='https://gfycat.com/ifr/";
var end = "' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0' allowfullscreen></iframe></div>";

var projects = [{"name": "Lissajous Curve", "url": "merryforsakenalbacoretuna"},
			{"name": "2D Lighting", "url": "UnfinishedRewardingAsianporcupine"},
			{"name": "2D Lighting", "url": "VillainousBoldBumblebee"},
			{"name": "Sierpinski Triangle", "url": "DeficientSpicyIslandwhistler", "github":"https://github.com/BarneyWhiteman/CodingChallenges/tree/master/cc9_recursive_triangle/recursive_triangle"},
			{"name": "Snake Game", "url": "SevereDirectBaldeagle", "github": "https://github.com/BarneyWhiteman/CodingChallenges/tree/master/cc8_snake/snake"},
			{"name": "\"Swirl Draw\"", "url": "LittleDelightfulInvisiblerail", "github": "https://github.com/BarneyWhiteman/CodingChallenges/tree/master/cc7_swirl_draw/swirlDraw"},
			{"name": "Fractal Tree", "url": "MisguidedMajesticLamb", "github": "https://github.com/BarneyWhiteman/CodingChallenges/tree/master/cc6_fractal_tree/tree"},
			{"name": "\"Pulse\"", "url": "HugePrestigiousDalmatian", "github": "https://github.com/BarneyWhiteman/CodingChallenges/tree/master/cc5_pulse/pulse"},
			{"name": "\"Bouncing Balls\"", "url": "CoarseFloweryJapanesebeetle"},
			{"name": "3D Terrain Generation", "url": "PhysicalAcidicAmethystsunbird"},
			{"name": "Top-down survival game", "url": "VariableHonoredAdamsstaghornedbeetle"}
	];

function loadGifs() {
	var gifs = document.getElementById("gifs");
	for(i in projects) {
		gifs.innerHTML += "<h2>" + projects[i]["name"] + "</h2>";
		if(projects[i]["github"] != null) {
			gifs.innerHTML += "<a href=\"" + projects[i]["github"] + "\">GitHub</a>";
		}
		gifs.innerHTML += start + projects[i]["url"] + end;
		gifs.innerHTML += "<hr class=\"my-4\">";
	}
}
