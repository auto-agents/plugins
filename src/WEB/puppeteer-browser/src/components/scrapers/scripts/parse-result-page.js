// browser script: parse google search 'result' page

let wait = async ms => await new Promise(resolve => {
    console.log('wait ' + ms + ' ms');
    setTimeout(() => {
        console.log('end wait ' + ms + ' ms')
        resolve();
    }, ms);
})

// 0. TEST CASE

let delay = 250

// 1. parse result list

// the postfix 'ved' in 'data-ved' is surelly periodically changed
let list = document.querySelectorAll('a[ping][data-ved]').values().toArray()
    .filter(x => x.id == '')

let results = list.map((x, i) => new Object({ index: i, topic: x.innerText, href: x.href }))

let pagesList = document.querySelectorAll('a[aria-label] > span').values().toArray()
    .splice(1)
    .map(x => x.parentNode)
let pages = pagesList.map((x, i) => new Object({ page: i + 2, href: x.href }))
