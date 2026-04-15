// browser script: parse google search 'result' page

(async () => {

    // 1. parse result list

    var optIncludeYouTubeResults = '{includeYouTubeResults}' == true
    var excludeEmptyTopics = '{excludeEmptyTopics}' == true

    // the postfix 'ved' in 'data-ved' is surelly periodically changed
    let list = document.querySelectorAll('a[ping][data-ved]').values().toArray()
        .filter(x => x.id == '')

    let results = list.map((x, i) => new Object({ index: i, topic: x.innerText, href: x.href }))
    if (excludeEmptyTopics)
        results = results.filter(x => x.topic != null && x.topic.length > 0)

    let pagesList = document.querySelectorAll('a[aria-label] > span').values().toArray()
        .splice(1)
        .map(x => x.parentNode)
    let pages = pagesList.map((x, i) => new Object({ page: i + 2, href: x.href }))

    return { results: results, pages: pages }

})()