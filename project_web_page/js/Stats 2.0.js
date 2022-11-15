'use strict'

const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'
const URL_GAMEID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids={gameId}'
const URL_CUSTOMID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=781B096A18E5438AAA028E11D22B796E&vanityurl={vanityurl}'
let userList = []

// MY USER ID IS 76561198416262376

function buildLeaderboard () {

  const tbody = document.querySelector('tbody')
  const categories = document.createElement('tr')

  const rank = document.createElement('td')
  rank.textContent = 'Rank'
  const username = document.createElement('td')
  username.textContent = 'Username'
  const timePlayed = document.createElement('td')
  timePlayed.textContent = 'Time Played'
  const achievements = document.createElement('td')
  achievements.textContent = 'Achievements'

  categories.appendChild(rank)
  categories.appendChild(username)
  categories.appendChild(timePlayed)
  categories.appendChild(achievements)
  tbody.appendChild(categories)

  userList.forEach((element) => {
    const userRow = document.createElement('tr')
    const userRank = document.createElement('td')
    userRank.textContent = '1'
    const userUsername = document.querySelector('td')
    userUsername.textContent = element
    const userTimePlayed = document.createElement('td')
    userTimePlayed.textContent = '0h 00m'
    const userAchievements = document.querySelector('td')
    userAchievements.textContent = '0/100'

    userRow.appendChild(userRank)
    userRow.appendChild(userUsername)
    userRow.appendChild(userTimePlayed)
    userRow.appendChild(userAchievements)

    tbody.appendChild(userRow)
  })
}

// MAKES THE MAGNIFYING GLASS SEARCH BOX DO STUFF
const button = document.querySelector('.fa-search')
// Collect user ID
button.addEventListener('click', (event) => {
  event.preventDefault()
  event.stopPropagation()
  const input = document.querySelector('input')
  userList.push(input)
  console.log(userList) //-------------------------------------
  if (/^\d+$/.test(input.value)) {
    fetchGameList(input.value)
  } else {
    const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=781B096A18E5438AAA028E11D22B796E&vanityurl={vanityurl}'
    const url = URL_USERID_TEMPLATE.replace('{vanityurl}', input.value)
    const promise = fetch(url).then((response) => {
      return response.json()
    }).then((data) => { fetchGameList(data.response.steamid) }).catch(renderError)
    return promise
  }
  document.querySelector('tbody').innerHTML = ''
  buildLeaderboard()
})

function fetchGameList (steamId) {
  // collect all games from a user's library
  const url = URL_USERID_TEMPLATE.replace('{steamId}', steamId)
  const promise = fetch(url).then((response) => {
    return response.json()
  }).then(fetchItems)
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
  // document.querySelector('tbody').innerHTML = ''------------------------
  // document.querySelector('tbody').appendChild(p)------------------------
}

function fetchItems (gamesList) {
  // use the steam id from the profile to get the actual game data
  // document.querySelector('tbody').innerHTML = ''------------------------
  console.log(gamesList.response.games)

  // throw an error if there are no games in their library
  if (gamesList.response.games === undefined) {
    renderError(new Error("There don't appear to be any games in this library."))
    return
  }

  // show interactive progress
  progressNeeded = gamesList.response.games.length
  currentProgress = 0
  document.querySelector('#before-table').innerHTML = ''
  createProgressBar()

  // colect each game from their library and render it
  gamesList.response.games.forEach((element) => {
    const url = URL_GAMEID_TEMPLATE.replace('{gameId}', element.appid)
    const promise = fetch(url).then((response) => {
      return response.json()
    }).then(renderItems)
      .catch(renderError)
    return promise
  })
}
