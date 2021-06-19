(function () {
	"use strict"

	const parsePlaytime = str => parseFloat(str.replaceAll(",", ""))

	// Find playtime elements
	const playtimeH5s = [...document.querySelectorAll(".hours_played")]
		.filter(h5 => h5.innerText.length > 0)

	// Calculate total playtime
	const total = playtimeH5s
		.map(playtime => parsePlaytime(playtime.innerText))
		.reduce((acc, val) => acc + val, 0)

	playtimeH5s.forEach((playtime) => {
		// Calculate percentage
		const percentage = parsePlaytime(playtime.innerText) / total * 100

		// Append percentage to the elements
		playtime.innerText += ` (${percentage.toFixed(1)}%)`
	})
})();
