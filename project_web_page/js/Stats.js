'use strict'

const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'
const URL_GAMEID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids={gameId}'
const URL_CUSTOMID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=781B096A18E5438AAA028E11D22B796E&vanityurl={vanityurl}'
const URL_ACHIEVEMENTS_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=440&key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'
let userList = []

// MY USER ID IS 76561198416262376
// ANOTHER IS 76561198147673590
// ADAM'S IS 76561198239932484

function buildLeaderboard () {

  const tbody = document.querySelector('tbody')
  tbody.innerHTML = ''

  userList.forEach((element) => {
    const userRow = document.createElement('tr')
    const userRank = document.createElement('td')
    console.log(element)
    userRank.textContent = element.playerRank
    const userUsername = document.createElement('td')
    userUsername.textContent = element.playerName

    const userTimePlayed = document.createElement('td')
    console.log(element)
    let playHours = element.timePlayed / 60
    let playMinutes = (playHours - Math.round(playHours)) * 60
    const newPlayTime = playHours.toFixed(0) + 'h ' + playMinutes.toFixed(0) + 'm'
    userTimePlayed.textContent = newPlayTime

    const userAchievements = document.createElement('td')
    if (element.achievementsEarned !== 'N/A' && element.achievementsEarned !== undefined) {
      userAchievements.textContent = element.achievementsEarned + ' / ' + element.achievementsTotal
    } else {
      userAchievements.textContent = 'N/A'
    }

    userRow.appendChild(userRank)
    userRow.appendChild(userUsername)
    userRow.appendChild(userTimePlayed)
    userRow.appendChild(userAchievements)

    tbody.appendChild(userRow)
  })
}

// sort the rows by achievement count
function sortByAchievements (oldUserList) {

  const newUserList = []
  const valid = []
  const garbage = []

  // separate the N/A's from the actual numbers
  oldUserList.forEach((element) => {
    if (element.achievementsEarned === 'N/A') {
      garbage.push(element)
    } else {
      valid.push(element.achievementsEarned)
    }
  })

  // sort the value rows
  valid.sort(function(a , b){ return a - b })
  valid.forEach((sorted_element) => {
    for (let i = 0; i < oldUserList.length; i++) {
      if (oldUserList[i].achievementsEarned === sorted_element) {
        newUserList.push(oldUserList[i])
        oldUserList.splice(i, 1)
        break
      }
    }
  })
  // apply rank to value rows
  let counter = 1
  newUserList.forEach((element) => {
    element.playerRank = counter
    if ((index > 0) && (element.achievementsEarned !== newUserList[index - 1].achievementsEarned)) {
      counter++
    }
  })
  // apply rank to N/A rows
  garbage.forEach((element) => {
    element.playerRank = counter
    newUserList.push(element)
  })

  userList = newUserList
}

function sortByTimePlayed (oldUserList) {

  const newUserList = []
  const minutes_list = []

  oldUserList.forEach((element) => {
    minutes_list.push(element.timePlayed)
  })

  minutes_list.sort(function(a , b){ return a - b })
  minutes_list.forEach((sorted_element) => {
    for (let i = 0; i < oldUserList.length; i++) {
      if (oldUserList[i].timePlayed === sorted_element) {
        newUserList.push(oldUserList[i])
        oldUserList.splice(i, 1)
        break
      }
    }
  })

  let counter = 1
  newUserList.forEach((element, index) => {
    element.playerRank = counter
    if ((index > 0) && (element.timePlayed !== newUserList[index - 1].timePlayed)) {
      counter++
    }
  })

  userList = newUserList
}

// MAKES THE MAGNIFYING GLASS SEARCH BOX DO STUFF
const search_button = document.querySelector('#friend-finder')
// Collect user ID
search_button.addEventListener('click', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const input = document.querySelector('input')
  if (input.value === '') {
    renderError(new Error('Please enter a valid username or ID number.'))
    return
  }
  if (/^\d+$/.test(input.value)) {
    fetchGameList(input.value)
  } else {
    const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=781B096A18E5438AAA028E11D22B796E&vanityurl={vanityurl}'
    const url = URL_USERID_TEMPLATE.replace('{vanityurl}', input.value)
    const promise = fetch(url).then((response) => {
      return response.json()
    }).then((data) => { fetchGameList(data.response.steamid) }).catch(renderError)
    userList.push(input.value)
    return promise
  }
})

const achievement_button = document.querySelector('#achievement-sort')
achievement_button.addEventListener('click', (event) => {
  event.preventDefault()
  sortByAchievements(userList)
  buildLeaderboard()
})

const time_played_button = document.querySelector('#time-played-sort')
time_played_button.addEventListener('click', (event) => {
  event.preventDefault()
  sortByTimePlayed(userList)
  buildLeaderboard()
})

function fetchGameList (steamId) {
  // collect all games from a user's library
  const url = URL_USERID_TEMPLATE.replace('{steamId}', steamId)
  const promise = fetch(url).then((response) => {
    return response.json()
  }).then((data) => {
    return fetchItems(data, steamId)
  })
    .catch(renderError)
  return promise
}

function renderError (error) {
  // make an error message element
  const p = document.createElement('p')
  p.classList.add('alert')
  p.classList.add('alert-danger')
  if (error.message === 'Unexpected token \'S\', "See /corsd"... is not valid JSON') {
    // error message for not accepting the proxy services
    const a = document.createElement('a')
    a.href = 'https://cors-anywhere.herokuapp.com/corsdemo'
    a.textContent = 'Please click this link and request temporary access to use this page. Then come back to this page and refresh the page.'
    p.appendChild(a)
    p.style.textDecoration = 'underline'
  } else if (error.message === "There don't appear to be any games in this library.") {
    // error for no games owned
    p.textContent = error.message
  } else {
    // error for not putting valid SteamId
    p.textContent = 'An error occur while trying to access this SteamID!'
  }
}

function fetchItems (gamesList, steamId) {
  // use the steam id from the profile to get the actual game data
  // console.log(gamesList.response.games)
  const playerInfo = {}

  // collect each game from their library and render it
  gamesList.response.games.forEach((element) => {
    if (element.appid === 252950) {
      playerInfo['timePlayed'] = element.playtime_forever
    } else {
      playerInfo['timePlayed'] = 0
    }
  })

  // add user achievements to the table
  const URL_ACHIEVEMENTS_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=252950&key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'
  const url_achievements = URL_ACHIEVEMENTS_TEMPLATE.replace('{steamId}', steamId)
  const promise_achievements = fetch(url_achievements).then((response) => {
    return (response.json())
  }).then((data) => {
    if (data.playerstats.success === false) {
      playerInfo['achievementsEarned'] = 'N/A'
      playerInfo['achievementsTotal'] = 'N/A'
    } else {
      console.log(data)
      const achieved_array = []
      data.playerstats.achievements.forEach((element) => { if (element.achieved === 1) { achieved_array.push(element) } })
      playerInfo['achievementsEarned'] = achieved_array.length
      playerInfo['achievementsTotal'] = data.playerstats.achievements.length
    }
  })

  // add username to the table
  const URL_USERNAME_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=781B096A18E5438AAA028E11D22B796E&steamids={steamIds}'
  const url = URL_USERNAME_TEMPLATE.replace('{steamIds}', '[' + steamId + ']')
  const promise = fetch(url).then((response) => {
    return (response.json())
  }).then((data) => {
    playerInfo['playerName'] = data.response.players[0].personaname
  }).then(buildLeaderboard)

  // throw an error if there are no games in their library
  if (gamesList.response.games === undefined) {
    renderError(new Error('There don\'t appear to be any games in this library.'))
    return
  }

  playerInfo['playerRank'] = ''

  userList.push(playerInfo)
}
