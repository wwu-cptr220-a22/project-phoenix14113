
// "https://cdn.cloudflare.steamstatic.com/steam/apps/1252330/header.jpg"
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
}

const URL_GAMEID_TEMPLATE = 'https://cors-anywhere.herokuapp.com/http://store.steampowered.com/api/appdetails?appids={gameId}'

function fetchItems (gamesList) {
  // use the steam id from the profile to get the actual game data 
  document.querySelector('tbody').innerHTML = ''
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
  fetchGameList(document.querySelector('input').value)
})

function renderError () {
  const p = document.createElement('p')
  p.classList.add('alert')
  p.classList.add('alert-danger')

  p.textContent = 'An error occur while trying to access this SteamID!'
  document.querySelector('tbody').innerHTML = ''
  document.querySelector('tbody').appendChild(p)
}
