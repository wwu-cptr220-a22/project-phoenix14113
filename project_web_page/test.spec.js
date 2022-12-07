/*
contains 4 html tests: 1 in Source Code is Valid, 3 in
    HTML contents check
contains 4 css tests: 1 in Source Code is Valid, 3 in
    CSS style checks
*/

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio') // for html testing
const inlineCss = require('inline-css') // for css testing
const htmlFiles = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html'))
const jsFiles = fs.readdirSync(path.join(__dirname, 'js')).filter((f) => f.endsWith('.js'))
// include custom matchers
const styleMatchers = require('jest-style-matchers')
expect.extend(styleMatchers)

// basic validation for all code
describe('Source code is valid', () => {
  test('HTML validates without errors', async () => {
    const lintOpts = {
      'attr-bans': ['align', 'background', 'bgcolor', 'border', 'frameborder', 'marginwidth', 'marginheight', 'scrolling', 'style', 'width', 'height'], // adding height, allow longdesc
      'tag-bans': ['style', 'b'], // <i> allowed for font-awesome
      'doctype-first': true,
      'doctype-html5': true,
      'html-req-lang': true,
      'attr-name-style': false, // for meta tags
      'line-end-style': false, // either way
      'indent-style': false, // can mix/match
      'indent-width': false, // don't need to beautify
      'id-class-style': false, // I like dashes in classnames
      'img-req-alt': true
    }

    for (const f of htmlFiles) {
      await expect(path.join(__dirname, f)).toHaveNoHtmlLintErrorsAsync(lintOpts)
    }
  })

  test('CSS validates without errors', async () => {
    await expect(path.join(__dirname, '/css/style.css')).toHaveNoCssLintErrorsAsync() // test all files in css folder
    await expect(path.join(__dirname, '/css-emcoberly/style.css')).toHaveNoCssLintErrorsAsync() // test all files in css folder
    await expect(path.join(__dirname, '/css-harrbr/style.css')).toHaveNoCssLintErrorsAsync() // test all files in css folder
  })

  test('JavaScript lints without errors', () => {
    if (fs.existsSync(path.join(__dirname, 'js'))) {
      for (const f of jsFiles) {
        expect([path.join(__dirname, 'js', f)]).toHaveNoEsLintErrors()
      }
    }
  })
})

// cheerio instance for AboutTeam.html
const htmlPathAboutTeam = path.join(__dirname, htmlFiles[0])
const htmlAboutTeam = fs.readFileSync(htmlPathAboutTeam, 'utf-8') // load the HTML file once

let $AboutTeamHTML
beforeAll(() => {
  $AboutTeamHTML = cheerio.load(htmlAboutTeam)
})

// cheerio instance for GamesTable.html
const htmlPathGamesTable = path.join(__dirname, htmlFiles[1])
const htmlGamesTable = fs.readFileSync(htmlPathGamesTable, 'utf-8')

let $GamesTableHTML
beforeAll(() => {
  $GamesTableHTML = cheerio.load(htmlGamesTable, 'utf-8')
})

// cheerio instance for index.html
const htmlPathIndex = path.join(__dirname, htmlFiles[2])
const htmlIndex = fs.readFileSync(htmlPathIndex, 'utf-8')

let $indexHTML
beforeAll(() => {
  $indexHTML = cheerio.load(htmlIndex)
})

// cheerio instance for RandomGame.html
const htmlPathRandomGame = path.join(__dirname, htmlFiles[3])
const htmlRandomGame = fs.readFileSync(htmlPathRandomGame, 'utf-8')

let $RandomGameHTML
beforeAll(() => {
  $RandomGameHTML = cheerio.load(htmlRandomGame)
})

// cheerio instance for stats.html
const htmlPathStats = path.join(__dirname, htmlFiles[4])
const htmlStats = fs.readFileSync(htmlPathStats, 'utf-8')

let $statsHTML
beforeAll(() => {
  $statsHTML = cheerio.load(htmlStats)
})

// cheerio instance css/style.css

describe('HTML content checks', () => {
  test('All html files have a navbar', async () => {
    let bodyChildren = $AboutTeamHTML('body').children()
    expect(bodyChildren[0].tagName).toMatch('nav') // AboutTeam.html body's first child is nav

    bodyChildren = $GamesTableHTML('body').children()
    expect(bodyChildren[0].tagName).toMatch('nav') // GamesTable.html body's first child is nav

    bodyChildren = $indexHTML('body').children()
    expect(bodyChildren[0].tagName).toMatch('nav') // index.html body's first child is nav

    bodyChildren = $RandomGameHTML('body').children()
    expect(bodyChildren[0].tagName).toMatch('nav') // RandomGame.html body's first child is nav

    bodyChildren = $statsHTML('body').children()
    expect(bodyChildren[0].tagName).toMatch('nav') // stats.html body's first child is nav
  })

  test('Checking initial image count', async () => {
    let Images = $AboutTeamHTML('img').children()
    expect(Images.length === 1)

    Images = $GamesTableHTML('img').children()
    expect(Images.length === 0)

    Images = $indexHTML('img').children()
    expect(Images.length === 3)

    Images = $RandomGameHTML('img').children()
    expect(Images.length === 1)

    Images = $statsHTML('img').children()
    expect(Images.length === 0)
  })

  test('Tables are present', async () => {
    let tables = $GamesTableHTML('img').children()
    expect(tables.length === 1)

    tables = $RandomGameHTML('img').children()
    expect(tables.length === 1)

    tables = $statsHTML('img').children()
    expect(tables.length === 1)
  })
})

describe('CSS style checks', () => {
  const baseDir = 'file://' + __dirname + '/'
  const CSSPathAdam = path.join(__dirname, '/css/style.css')
  const CSSAdam = fs.readFileSync(CSSPathAdam, 'utf-8')

  let $CSSAdam

  beforeAll(async () => {
    // test CSS by inlining properties and then reading them from cheerio
    const inlined = await inlineCss(htmlGamesTable, { extraCss: CSSAdam, url: baseDir, removeLinkTags: false })
    $CSSAdam = cheerio.load(inlined)
  })
  describe("Adam's css file tests", () => {
    test('footers are at the bottoms by default', async () => {
      const footer = $CSSAdam('footer')
      expect(footer.css('position')).toEqual('fixed')
      expect(footer.css('bottom')).toEqual('0')
      expect(footer.css('top')).toEqual(undefined)
    })

    test('nav bars are at the bottoms by default', async () => {
      const nav = $CSSAdam('nav')
      expect(nav.css('position')).toEqual('fixed')
      expect(nav.css('top')).toEqual('0')
      expect(nav.css('bottom')).toEqual(undefined)
    })

    test('Table headers are rounded with unique color', async () => {
      const th = $CSSAdam('th')
      expect(th.css('border-radius')).toEqual('10px 10px 0 0')
      expect(th.css('background-color')).toEqual('#073c6d')
    })
  })
})

describe('JavaScript interaction checks', () => {
  // load JavaScript libraries separately
  // const NavJsPath = path.join(__dirname , 'js' , jsFiles[0])
  // const TableJsPath = path.join(__dirname , 'js' , jsFiles[4])

  /* I give up. I have been at this for 3 freaking hours with no
  progress. I can't get jest tounderstand that it can import function
  that use the key word document. I have watched a half dozen videos,
  read the textbook, and copied things from previous homework assignment
  and none of it has worked. I am done. thanks */

  test('Click on hamburger menu gives the menu', async () => {
    // const button = $GamesTableHTML('li#menu')
  })
})
