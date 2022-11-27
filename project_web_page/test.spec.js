const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio') //for html testing
const html_files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.html'))
const js_files = fs.readdirSync(path.join(__dirname, 'js')).filter((f) => f.endsWith('.js'))
// include custom matchers
const styleMatchers = require('jest-style-matchers')
expect.extend(styleMatchers)


let htmlPath = __dirname + '/' + html_files[0];
let html = fs.readFileSync(htmlPath, 'utf-8'); //load the HTML file once

let $AboutTeam; //cheerio instance
beforeAll(() => {
  $AboutTeam = cheerio.load(html);
})

htmlPath = __dirname + '/' + html_files[1];
html = fs.readFileSync(htmlPath, 'utf-8');

let $GamesTable; //cheerio instance
beforeAll(() => {
  $GamesTable = cheerio.load(fs.readFileSync(__dirname + '/' + html_files[1], 'utf-8'));
})

htmlPath = __dirname + '/' + html_files[2];
html = fs.readFileSync(htmlPath, 'utf-8');

let $index; //cheerio instance
beforeAll(() => {
  $index = cheerio.load(fs.readFileSync(__dirname + '/' + html_files[2], 'utf-8'));
})

htmlPath = __dirname + '/' + html_files[3];
html = fs.readFileSync(htmlPath, 'utf-8');

let $RandomGame; //cheerio instance
beforeAll(() => {
  $RandomGame = cheerio.load(fs.readFileSync(__dirname + '/' + html_files[3], 'utf-8'));
})

htmlPath = __dirname + '/' + html_files[4];
html = fs.readFileSync(htmlPath, 'utf-8');

let $stats; //cheerio instance
beforeAll(() => {
  $stats = cheerio.load(fs.readFileSync(__dirname + '/' + html_files[4], 'utf-8'));
})

describe('HTML content checks', () => {
  test('All html files have a navbar', async () => {
    let bodyChildren = $AboutTeam('body').children();
    expect(bodyChildren[0].tagName).toMatch('nav'); //AboutTeam.html body's first child is nav

    bodyChildren = $GamesTable('body').children();
    expect(bodyChildren[0].tagName).toMatch('nav'); //GamesTable.html body's first child is nav

    bodyChildren = $index('body').children();
    expect(bodyChildren[0].tagName).toMatch('nav'); //index.html body's first child is nav

    bodyChildren = $RandomGame('body').children();
    expect(bodyChildren[0].tagName).toMatch('nav'); //RandomGame.html body's first child is nav

    bodyChildren = $stats('body').children();
    expect(bodyChildren[0].tagName).toMatch('nav'); //stats.html body's first child is nav

  })

})

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

    for (const f of html_files) {
      await expect(__dirname + '/' + f).toHaveNoHtmlLintErrorsAsync(lintOpts)
    }
  })

  test('CSS validates without errors', async () => {
    await expect(__dirname +'/css/*.css').toHaveNoCssLintErrorsAsync() // test all files in css folder
  })

  test('JavaScript lints without errors', () => {
    if (fs.existsSync(path.join(__dirname, 'js'))) {
      

      for (const f of js_files) {
        expect([__dirname + '/js/' + f]).toHaveNoEsLintErrors()
      }
    }
  })
})