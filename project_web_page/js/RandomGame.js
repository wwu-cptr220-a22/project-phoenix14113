'use strict'

function addButton (genre) {
  const li = document.createElement('li')
  const button = document.createElement('button')
  button.textContent = genre
  button.id = 'genre-button'

  button.addEventListener('click', () => {
    console.log(genre)
  })

  li.appendChild(button)
  document.querySelector('#genres').appendChild(li)
}

function renderButtons () {
  addButton('Action')
  addButton('Adventure')
  addButton('Roleplaying')
  addButton('Simulation')
  addButton('Strategy')
  addButton('Sports & Race')
}

renderButtons()
