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

	// Add the overall playtime entry
	const overallPlaytime = document.querySelector(".gameListRow").cloneNode(true)
	overallPlaytime.id = "game_753"
	overallPlaytime.querySelector(".gameListRowItemName").innerText = "Overall"
	overallPlaytime.querySelector(".bottom_controls").remove()
	overallPlaytime.querySelector(".gameListRowLogo a").removeAttribute("href")
	try { overallPlaytime.querySelector(".recentAchievements").remove() } catch { }
	overallPlaytime.querySelector(".hours_played").innerText = `${total.toFixed(0)} hrs on record`
	overallPlaytime.querySelector(".game_capsule").src = "https://cdn.cloudflare.steamstatic.com/steam/apps/753/capsule_184x69.jpg"
	document.querySelector("#games_list_rows").insertBefore(overallPlaytime, document.querySelector(".gameListRow"))

	// Add playtime percentages
	playtimeH5s.forEach((playtime) => {
		// Calculate percentage
		const percentage = parsePlaytime(playtime.innerText) / total * 100

		// Append percentage to the elements
		playtime.innerText += ` (${percentage.toFixed(1)}%)`
	})
})();
