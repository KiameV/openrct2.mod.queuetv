function main() {
	var qtv;
	var counter = 0;
	context.subscribe("interval.day", function (ev) {
		counter++;
		if (counter < 6) {
			return;
		}
		counter = 0;
		if (context.mode !== "normal") {
			return;
		}
		var qtv;
		context.getAllObjects("footpath_addition").forEach(function (a) {
			if (a.identifier.toLowerCase().includes("qt")) {
				qtv = a;
			}
		});
		if (!qtv) {
			return;
		}
		for (var x = 0; x < map.size.x; x++) {
			for (var y = 0; y < map.size.y; y++) {
				var elements = map.getTile(x, y).elements
				elements.filter(function (e) {
					if (e.type === "footpath" && e.isQueue && (e.addition == null || e.addition == 0)) {
						surface = elements.filter(function (e) { return e.type === "surface"; })[0];
						if (surface.hasOwnership && surface.hasConstructionRights) {
							context.executeAction("footpathadditionplace", {
								x: x * 32,
								y: y * 32,
								z: e.baseZ,
								object: qtv.index + 1
							});
						}
					}
				});
			}
		}
	});
}

registerPlugin({
    name: 'TV Queues',
    version: '1.0',
    authors: ['KiameV'],
    type: 'local',
    licence: 'MIT',
    targetApiVersion: 44,
    main: main
});
