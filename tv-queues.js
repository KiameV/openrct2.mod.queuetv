const name = "Queue TV Placer";
const dbcUID="qtvplacer.daysbetween";
const defaultDaysBetweenChecks = 6;
var daysBetweenChecks = 6;
function main() {
	var counter = 0;
	var qtv = null;
	//console.log("[Queue TV Placer] starting with api verison: " + context.apiVersion);
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
		if (!qtv) {
			objectManager.getAllObjects("footpath_addition").forEach(function (i) {
				if (i.identifier == ("rct2.footpath_item.qtv1")) {
					//console.log("[Queue TV Placer] qtv found!")
					qtv = i;
				}
			});
		}
		if (!qtv) {
			//console.log("[Queue TV Placer] qtv not found!")
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
								object: qtv.index
							});
						}
					}
				});
			}
		}
		context.subscribe("map.change", function (ev) {
			//console.log("[Queue TV Placer] map change");
			qtv = null;
		})
	});
}

registerPlugin({
    name: '"Queue TV Placer"',
    version: '1.1',
    authors: ['KiameV'],
    type: 'local',
    licence: 'MIT',
    targetApiVersion: 85,
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
			width: 250,
			height: 50,
			widgets: [
			{
				type: 'label',
				name: 'Days Between Checks Label',
				text: 'Days Between checks',
				x: 15,
				y: 25,
				width: 130,
				height: 25,
			},
			{
				type: 'textbox',
				name: 'Days Between Checks',
				text: ''+daysBetweenChecks,
				x: 150,
				y: 20,
				width: 80,
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