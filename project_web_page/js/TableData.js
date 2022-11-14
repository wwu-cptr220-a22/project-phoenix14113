// https://cors-anywhere.herokuapp.com/ has been prepended to each API link
// so that the link redirects through a proxy server to avoid CORS errors
// that the steam API throws for not being a secure access.
let progressNeeded = 0
let currentProgress = 0
function percentConverter (value) {
  return String((value * 100).toFixed(0))
}

function createProgressBar () {
  const progressBar = document.createElement('div')
  progressBar.classList.add('progress-bar')
  progressBar.role = 'progressbar'
  progressBar.setAttribute('aria-valuenow', '0')
  progressBar.setAttribute('aria-valuemin', '0')
  progressBar.setAttribute('aria-valuemax', '100')
  progressBar.style.width = '0%'

  const progressContainer = document.createElement('div')
  progressContainer.classList.add('progress')
  progressContainer.appendChild(progressBar)

  document.querySelector('#before-table').appendChild(progressContainer)
}

function renderItems (game) {
  const objectKey = Object.keys(game)
  // if the game in question has been loaded successfully
  // also remove games that don't have sales data that aren't free
  if (game[objectKey[0]].success && (game[objectKey[0]].data.is_free || game[objectKey[0]].data.price_overview)) {
    // collect game data from a game object
    const gameName = game[objectKey[0]].data.name
    const gameImg = game[objectKey[0]].data.header_image
    let gamePrice = null
    let gameDiscount = null
    // change print format if the game is free
    if (!game[objectKey[0]].data.is_free) {
      gamePrice = game[objectKey[0]].data.price_overview.final_formatted
      gameDiscount = game[objectKey[0]].data.price_overview.discount_percent
    } else {
      gamePrice = 'Free'
      gameDiscount = 'Free'
    }
    if (gameDiscount !== 0) {
      // create a row with the game information
      const img = document.createElement('img')
      img.src = gameImg
      const imageColumn = document.createElement('td')
      imageColumn.appendChild(img)

      const NameColumn = document.createElement('td')
      NameColumn.textContent = gameName

      const PriceColumn = document.createElement('td')
      PriceColumn.textContent = gamePrice

      const DiscountColumn = document.createElement('td')
      DiscountColumn.textContent = gameDiscount

      if (gameDiscount !== 'Free') {
        DiscountColumn.textContent += '%'
      }
      // add the row to the table
      const tr = document.createElement('tr')
      tr.appendChild(imageColumn)
      tr.appendChild(NameColumn)
      tr.appendChild(PriceColumn)
      tr.appendChild(DiscountColumn)
      document.querySelector('tbody').appendChild(tr)
    }
  }
  currentProgress += 1
  document.querySelector('.progress-bar').setAttribute('aria-valuenow', percentConverter(currentProgress / progressNeeded))
  document.querySelector('.progress-bar').style.width = percentConverter(currentProgress / progressNeeded) + '%'
}

const URL_GAMEID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids={gameId}'

function fetchItems (gamesList) {
  // use the steam id from the profile to get the actual game data
  document.querySelector('tbody').innerHTML = ''
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

const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=781B096A18E5438AAA028E11D22B796E&steamid={steamId}'
function fetchGameList (steamId) {
  // collect all games from a user's library
  const url = URL_USERID_TEMPLATE.replace('{steamId}', steamId)
  const promise = fetch(url).then((response) => {
    return response.json()
  }).then(fetchItems)
    .catch(renderError)
  return promise
}

fetchGameList('76561198239932484')
document.querySelector('#search').addEventListener('click', (event) => {
  // collect SteamID
  event.preventDefault()
  event.stopPropagation()
  if (/^\d+$/.test(document.querySelector('input').value)) {
    // if the input value is a number exclusively go straight to collecting
    // the library
    fetchGameList(document.querySelector('input').value)
  } else {
    // if there is a string it means that a custom url was entered which means
    // that the SteamId must be decoded from the url
    const URL_USERID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=781B096A18E5438AAA028E11D22B796E&vanityurl={vanityurl}'
    const url = URL_USERID_TEMPLATE.replace('{vanityurl}', document.querySelector('input').value)
    const promise = fetch(url).then((response) => {
      return response.json()
    }).then((data) => { fetchGameList(data.response.steamid) }).catch(renderError)
    return promise
  }
})

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
  document.querySelector('tbody').innerHTML = ''
  document.querySelector('tbody').appendChild(p)
}
