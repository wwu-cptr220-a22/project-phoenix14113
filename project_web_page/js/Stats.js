'use strict'

const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'

function createLeaderboard () {
  const leaderboard = document.querySelector('#leaderboard')
  const titleBar = document.createElement('tr')

  const NameColumn = document.createElement('td')
}

function buttonPusher () {
  const button = document.querySelector('.fa-search')
  const input = document.querySelector('input')
  button.addEventListener('click', (event) => {
    event.preventDefault()
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
  })
}
buttonPusher()

function getRocketLeague (data) {
  data.response.games.forEach((element) => {
    // Rocket League ID: 252950
    if (element.appid === 105600) {
      let playHours = element.playtime_forever / 60
      let playMinutes = (playHours - Math.round(playHours)) * 60
      console.log(playHours.toFixed(2))
      console.log(playHours.toFixed(0) + 'h ' + playMinutes.toFixed(0) + 'm')
    }
  })
}

const URL_FRIENDID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/ISteamUser/GetFriendList/v1/?steamid={steamid}&key={key}'

function friendGames (steamId) {
  let url = URL_FRIENDID_TEMPLATE.replace('{key}', '781B096A18E5438AAA028E11D22B796E')
  url = url.replace('{steamid}', steamId)
  const promise = fetch(url).then((response) => {
    return response.json()
  }).then(friendListProcessor).catch(renderError)
  console.log(promise)
  return promise
  
}
friendGames('76561198239932484')

function friendListProcessor (data) {
  console.log(data.response)
}

function fetchGameList (steamId) {
  // collect all games from a user's library
  const url = URL_USERID_TEMPLATE.replace('{steamId}', steamId)
  const promise = fetch(url).then((response) => {
    return response.json()
  }).then(getRocketLeague)
    .catch(renderError)
  console.log(friendGames(steamId))
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

fetchGameList('76561198239932484')

