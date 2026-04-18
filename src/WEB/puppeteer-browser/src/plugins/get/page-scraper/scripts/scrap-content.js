(async () => {

    let wait = async ms => await new Promise(resolve => {
        console.log('wait ' + ms + ' ms');
        setTimeout(() => {
            console.log('end wait ' + ms + ' ms')
            resolve();
        }, ms);
    })

    let textContent = (node, f) => {
        var r = ''
        var childs = node.childNodes.values().toArray()
        if (childs.length == 0
            && (node.tagName != 'script' && node.tagName != 'style')) {
            if (node.textContent && node.textContent.trim().length > 0)
                return '\n' + node.textContent
            return ''
        }
        childs.forEach(c => {
            r += f(c, f)
        })
        return r
    }

    let tc = node => textContent(node, textContent)?.trim()

    // -----------------------------------

    console.log('scrap content')
    await wait(1)

    let r = {
        title: document.title,
        lang: document.querySelector('html')?.attributes['lang']?.value,
        header: null,
        footer: null,
        sections: {},
        text: tc(document.querySelector('body')),
        links: [],
        buttons: [],
        inputs: [],
        textAreas: [],
        images: [],
        metas: {}
    }

    // 1. get titles + texts

    for (let i = 1; i < 5; i++) {
        let titlesList = document.querySelectorAll('h' + i).values().toArray()
        let texts = titlesList.map(n => tc(n.parentNode))
        r.sections[i] = texts
    }

    // 2. links

    r.links = document.querySelectorAll('a').values().toArray()
        .map(x => new Object({ text: tc(x), href: x.href }))
        .filter(x => x != null && x.href != null && x.href !== undefined
            && x.href?.trim()?.length > 0
        )

    // 2. links - buttons

    r.buttons = document.querySelectorAll('button').values().toArray()
        .map(x => new Object({ id: x.id, name: x.name, type: x.type, text: tc(x) }))
        .filter(x => x != null && x.text != null && x.text !== undefined
            && x.text?.trim()?.length > 0
        )

    // 3. input

    r.inputs = document.querySelectorAll('input').values().toArray()
        .map(x => new Object({
            id: x.id, name: x.name, type: x.type,
            value: x.value, placeholder: x.placeholder,
            label: x.ariaLabel
        }))

    // 3. input - text areas

    r.textAreas = document.querySelectorAll('textarea').values().toArray()
        .map(x => new Object({
            id: x.id, name: x.name, type: x.type,
            value: x.value, placeholder: x.placeholder,
            label: x.ariaLabel
        }))

    // 4. images

    r.images = document.querySelectorAll('img').values().toArray()
        .map(x => new Object({ alt: x.alt, src: x.src }))
        .filter(x => x.src != null && x.src !== undefined
            && x.src.trim().length > 0
        )

    // 5. header & footer

    let n = (document.querySelector('header'))
    if (n) r.header = tc(n)
    n = (document.querySelector('footer'))
    if (n) r.footer = tc(n)

    // 6 meta

    let metList = document.querySelectorAll('meta').values().toArray()
    metList.map(m => {
        for (let i = 0; i < m.attributes.length; i++)
            r.metas[m.attributes[i].name] = m.attributes[i].value
    })

    return r

})()