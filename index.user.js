// ==UserScript==
// @name            SteamPTP
// @icon            https://raw.githubusercontent.com/octoman90/SteamPTP/master/assets/icon48.png
// @version         0.2.0
// @description     A Chrome extension that displays total playtime and playtime percentage for each game in Steam profiles
// @author          man90 (https://github.com/octoman90)
// @namespace       https://github.com/octoman90/SteamPTP/
// @updateURL       https://github.com/octoman90/SteamPTP/raw/master/index.user.js
// @downloadURL     https://github.com/octoman90/SteamPTP/raw/master/index.user.js
// @supportURL      https://github.com/octoman90/SteamPTP/issues
// @license         GPL-3.0
// @match           *://steamcommunity.com/id/*/games/?tab=all*
// @match           *://steamcommunity.com/profiles/*/games/?tab=all*
// @grant           none
// @run-at          idle
// ==/UserScript==

(() => {
	"use strict"

	// Function that takes a list of game card elements and outputs
	// a list of playtimes as numbers and the sum
	function parseAndCalc(playtimeElements) {
		const parsedPlaytimes = playtimeElements
			.map(el => {
				const str = el.childNodes[1]?.textContent

				// This here is the main reason why this script
				// won't work for non-English interfaces
				const inMinutes = /minutes/i.test(str)

				return parseFloat(str.replaceAll(",", "")) / (inMinutes ? 60 : 1)
			})

		return {
			playtimes: parsedPlaytimes,
			total: parsedPlaytimes.reduce((acc, val) => acc + val),
		}
	}

	// Function that adds playtime percentage to a given game card
	function injectPercentage(element, playtime, total) {
		const percentage = (playtime / total * 100).toFixed(1)
		if (0 === parseFloat(percentage)) {
			return
		}

		element.innerHTML += ` (${percentage}%)`
	}

	// Function that adds a total playtime text to the page
	function injectTotal(total) {
		if (total < 1) {
			return
		}

		const totalElement = document.createElement("div")
		totalElement.innerText = `${total.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} hours`
		totalElement.style.marginRight = "1rem"
		totalElement.style.placeSelf = "center end"

		const privacySettingsLink = document.querySelector("[class^=gameslistapp_PrivacySettingsLink]")
		const bar = privacySettingsLink.parentNode
		bar.style.gridTemplateColumns = "auto 1fr auto auto"
		bar.style.gridTemplateAreas = "\"search totalPlaytime bothOwned sort\""

		bar.insertBefore(totalElement, privacySettingsLink)
	}

	// Main function that gathers all game cards on the page
	// And launches the processing
	function processPlaytimes() {
		// Find playtime elements
		const playtimeH5s = [...document.querySelectorAll("[class^=gameslistitems_Hours]")]
		const { playtimes, total } = parseAndCalc(playtimeH5s)

		// Add playtime percentages
		playtimeH5s.forEach((el, i) => {
			injectPercentage(el, playtimes[i], total)
		})
		injectTotal(total)
	}

	// Observer catches the app adding game cards
	// If there's a pause of at least 100ms the processing function is fired
	// It would be nicer to process them card by card whenever one gets added
	// but I CBA to hack into React apps any farther
	let t = null

	const observer = new MutationObserver((mutationList, observer) => {
		for (const mutation of mutationList) {
			for (const node of mutation.addedNodes) {
				if (!node.className?.startsWith("gameslistitems_GamesListItemContainer")) {
					continue
				}

				if (t) {
					clearTimeout(t)
				}

				t = setTimeout(() => {
					observer.disconnect()
					processPlaytimes()

					// There may be a problem if it takes the browser more than 100ms
					// to add the next card, but it works for me
				}, 100)
			}
		}
	})

	observer.observe(document.querySelector("#application_root"), {
		attributes: false,
		childList: true,
		subtree: true,
	})
})()
