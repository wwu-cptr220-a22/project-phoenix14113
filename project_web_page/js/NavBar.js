'use strict'

function addLogo () {
  const span = document.createElement('span')
  span.classList.add('logo')
  span.ariaHidden = 'true'
  span.textContent = '\xa0'
  return span
}

function addlink (path, text, span = null) {
  const a = document.createElement('a')
  const content = document.createTextNode(text)
  a.href = path
  if (span) {
    a.appendChild(span)
  }
  a.appendChild(content)
  return a
}

function createLI (path, text, addLogoElement = false) {
  let span = null
  if (addLogoElement) {
    span = addLogo()
  }
  const a = addlink(path, text, span)
  const li = document.createElement('li')
  li.appendChild(a)
  document.querySelector('ul').appendChild(li)
}

function createNavBar () {
  // add homepage navigation link
  createLI('./index.html#', 'Main\xa0Page', true)

  // add Why This Site navigation link
  createLI('./index.html#column-two', 'Why\xa0This\xa0Site', false)

  // add Sales Table navigation link
  createLI('./GamesTable.html', 'Sales\xa0Table', false)

  // add About Us navigation link
  createLI('./AboutTheTeam.html', 'About\xa0Us', false)
}

function deleteNavBar () {
  const ul = document.querySelector('ul')

  while (ul.lastElementChild !== ul.firstElementChild) {
    ul.removeChild(ul.lastElementChild)
  }
}

let showingNavBar = false

document.querySelector('li#menu').addEventListener('click', () => {
  if (!showingNavBar) {
    showingNavBar = true
    createNavBar()
  } else {
    showingNavBar = false
    deleteNavBar()
  }
})
