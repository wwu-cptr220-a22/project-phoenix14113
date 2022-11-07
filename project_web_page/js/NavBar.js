'use strict'

function addLogo () {
  // create a span that has the logo attached to it
  const span = document.createElement('span')
  span.classList.add('logo')
  span.ariaHidden = 'true'
  span.textContent = '\xa0'
  return span
}

function addlink (path, text, span = null) {
  // Have the input text link to the path when clicked
  const a = document.createElement('a')
  a.classList.add('link')
  const content = document.createTextNode(text)
  a.href = path

  // If a span is passed in put it in before adding the text
  if (span) {
    a.appendChild(span)
  }
  a.appendChild(content)
  return a
}

function createLI (path, text, addLogoElement = false) {
  let span = null

  // if this function starts comes with a true addLogoElement then
  // a logo will be added to the a element before its text
  if (addLogoElement) {
    span = addLogo()
  }
  // create a element
  const a = addlink(path, text, span)

  // turn the a element into a list entry
  const li = document.createElement('li')
  li.appendChild(a)

  // add it to the navbar
  li.addEventListener('click', () => {
    document.location.href = path
  })
  document.querySelector('ul').appendChild(li)
}

function createNavBar () {
  // add homepage navigation link
  createLI('./index.html#', 'Main\xa0Page', true)

  // add Why This Site navigation link
  createLI('./index.html#column-two', 'Why\xa0This\xa0Site', false)

  // add Sales Table navigation link
  createLI('./GamesTable.html', 'Sales\xa0Table', false)

  createLI('./stats.html', 'Stats\xa0Table', false)
  // add About Us navigation link
  createLI('./AboutTheTeam.html', 'About\xa0Us', false)
}

function deleteNavBar () {
  const ul = document.querySelector('ul')
  // remove everything that is not the menu li element
  while (ul.lastElementChild !== ul.firstElementChild) {
    ul.removeChild(ul.lastElementChild)
  }
}

let showingNavBar = false

document.querySelector('li#menu').addEventListener('click', () => {
  // create interactive menu li entry
  if (!showingNavBar) {
    // show the nav bar when pressed if the navbar isn't present
    showingNavBar = true
    createNavBar()
  } else {
    // remove the nav bar when pressed if the navbar isn't present
    showingNavBar = false
    deleteNavBar()
  }
})
