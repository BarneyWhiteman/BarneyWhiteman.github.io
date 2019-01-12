
divs = [
"merryforsakenalbacoretuna",
"UnfinishedRewardingAsianporcupine",
"VillainousBoldBumblebee",
"DeficientSpicyIslandwhistler",
"SevereDirectBaldeagle",
"LittleDelightfulInvisiblerail",
"MisguidedMajesticLamb",
"HugePrestigiousDalmatian",
"CoarseFloweryJapanesebeetle",
"PhysicalAcidicAmethystsunbird",
"VariableHonoredAdamsstaghornedbeetle"
]

start = "<div style='position:relative;padding-bottom:54%'><iframe src='https://gfycat.com/ifr/";
end = "' frameborder='0' scrolling='no' width='100%' height='100%' style='position:absolute;top:0;left:0' allowfullscreen></iframe></div>";

function loadGifs() {
	var gifs = document.getElementById("gifs");
	for(i in divs) {
		gifs.innerHTML += start + divs[i] + end;
		gifs.innerHTML += "<hr class=\"my-4\">";
	}
}
