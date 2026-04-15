// browser script: parse google search 'result' page

(async () => {

    // 1. check captcha

    if (window.location.pathname == '{catchaPathName}')
        return '{CAPTCHA_BEFORE_RESULT_PAGE}'

    // 2. parse result list

    var includeYouTubeResults = '{includeYouTubeResults}' == 'true'
    var excludeEmptyTopics = '{excludeEmptyTopics}' == 'true'
    var skipResults = '{skipResults}'
    var excludedResultUrls = JSON.parse('{excludedResultUrls}')

    let isExcludedResultUrl = (href) => {
        var r = false
        excludedResultUrls.forEach(x => {
            r |= href.startsWith(x)
        });
        return r
    }

    // the postfix 'ved' in 'data-ved' is surelly periodically changed
    let list = document.querySelectorAll('a[ping][data-ved]').values().toArray()
        .filter(x => x.id == '')

    let results = list.map((x, i) => {

        const p = x.parentNode?.parentNode?.parentNode?.parentNode?.parentNode
        const o = new Object({ index: i, topic: x.innerText, href: x.href, summary: '' })
        const childs = p.childNodes.values().toArray()
        if (p && childs.length >= 2) {
            o.summary = childs[1].textContent
        }
        return o;
    })
    if (excludeEmptyTopics)
        results = results.filter(x => x.topic != null && x.topic.length > 0)
    if (!includeYouTubeResults)
        results = results.filter(x => !x.href.startsWith('https://www.youtube.com/'))
    results = results.filter(x => !isExcludedResultUrl(x.href))
    if (skipResults > 0)
        results = results.splice(skipResults)


    let pagesList = document.querySelectorAll('a[aria-label] > span').values().toArray()
        .splice(1)
        .map(x => x.parentNode)
    let pages = pagesList.map((x, i) => new Object({ page: i + 2, href: x.href }))

    // ai content

    let aiContent = ''
    let lst = document.querySelectorAll('mark').values().toArray()
    if (lst.length > 0) {
        let n = lst[0]
        if (n?.parentNode?.parentNode)
            aiContent = n.parentNode.parentNode.textContent
    }

    // "head" response

    let headResponse1 = ''
    lst = document.querySelectorAll('span[lang]').values().toArray()
    if (lst.length > 0) {
        headResponse1 = lst[0].textContent
    }

    let headResponse2 = ''
    lst = document.querySelectorAll('div[lang]').values().toArray()
    if (lst.length > 0) {
        headResponse2 = lst[0].textContent
    }

    let result = { results: results, pages: pages, aiContent: aiContent, headResponse1: headResponse1, headResponse2: headResponse2 }

    console.log(result)
    return result

})()