// browser script: parse google search 'result' page

(async () => {

    let textContent = (node, f) => {
        var r = ''
        var childs = node.childNodes.values().toArray()
        if (childs.length == 0) {
            if (node.textContent && node.textContent.trim().length > 0)
                return '\n' + node.textContent
            return ''
        }
        childs.forEach(c => {
            var sr = f(c, f)
            r += f(c, f)
        })
        return r
    }

    let tc = node => textContent(node, textContent)

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

    window.ch = []

    let results = list.map((x, i) => {

        const p = x.parentNode?.parentNode?.parentNode?.parentNode?.parentNode
        const o = new Object({ index: i, topic: /*x.innerText*/tc(x), href: x.href, summary: '' })
        const childs = p.childNodes.values().toArray()
        if (p && childs.length >= 2) {
            window.ch.push({ n: p, c: childs })
            o.summary = tc(childs[1]) //.textContent
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

    window.r = results


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
        //aiContent = tc(n.parentNode.parentNode)
    }

    // "head" response

    let headResponse1 = ''
    lst = document.querySelectorAll('span[lang]').values().toArray()
    if (lst.length > 0) {
        //headResponse1 = lst[0].textContent
        headResponse1 = tc(lst[0])
    }

    let headResponse2 = ''
    lst = document.querySelectorAll('div[lang]').values().toArray()
    if (lst.length > 0) {
        //headResponse2 = lst[0].textContent
        headResponse2 = tc(lst[0])
    }

    let result = {
        results: results,
        pages: pages,
        aiContent: aiContent,
        headResponse1: headResponse1,
        headResponse2: headResponse2
    }

    console.log(result)
    return result

})()