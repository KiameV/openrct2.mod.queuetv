const name = "Queue TV Placer";
const dbcUID="qtvplacer.daysbetween";
const defaultDaysBetweenChecks = 6;
var daysBetweenChecks = 6;
function main() {
	var qtv;
	var counter = 0;
	loadSettings();
	registerQTVSettings();
	context.subscribe("interval.day", function (ev) {
		counter++;
		if (counter < daysBetweenChecks || daysBetweenChecks == 0) {
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
    name: '"Queue TV Placer"',
    version: '1.0',
    authors: ['KiameV'],
    type: 'local',
    licence: 'MIT',
    targetApiVersion: 44,
    main: main
});

function loadSettings() {
	daysBetweenChecks = context.sharedStorage.get(dbcUID, defaultDaysBetweenChecks);
}

function registerQTVSettings() {
		ui.registerMenuItem(name, function () {
		var window = ui.openWindow({
			title: name,
			id: 1,
			classification: name,
			width: 300,
			height: 50,
			widgets: [
			{
				type: 'label',
				name: 'Days Between Checks Label',
				text: 'Days Between checks',
				x: 5,
				y: 25,
				width: 150,
				height: 25,
			},
			{
				type: 'textbox',
				name: 'Days Between Checks',
				text: ''+daysBetweenChecks,
				x: 160,
				y: 20,
				width: 30,
				height: 25,
				onChange: function(i) {
					var n = parseInt(i);
					if (i >= 0) {
						daysBetweenChecks = n;
						context.sharedStorage.set(dbcUID, daysBetweenChecks);
					}
				},
			},
			]
		});
	});
}