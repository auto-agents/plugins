
console.log('puppeteer: added utils.js')

/**
 * wait specified milliseconds
 * @param {number} ms milli seconds 
 * @returns 
 */
/*window.wait = async ms => await new Promise(resolve => {
    console.log('wait ' + ms + ' ms');
    setTimeout(() => {
        console.log('end wait ' + ms + ' ms')
        resolve();
    }, ms);
});*/

window.excludedTagNames = ['script', 'noscript', 'style', 'iframe', 'img', 'link']
window.ucExcludedTagNames = window.excludedTagNames.map(x => x.toUpperCase())

/**
 * scrap text content only recursively from a node
 * @param {HTMLElement} node 
 * @param {callback func} f 
 * @returns {String} text content
 */
window.textContent = (node, f) => {
    var r = ''
    var childs = node.childNodes.values().toArray()
    if (childs.length == 0) {
        if (node.nodeType == 3 && node.textContent && node.textContent.trim().length > 0) {
            console.log('fetch: ' + node.textContent)
            console.log(node)
            return '\n' + node.textContent
        }
        return ''
    }
    childs.forEach(c => {
        if (!window.excludedTagNames.includes(c.tagName)
            && !window.ucExcludedTagNames.includes(c.tagName)
        )
            r += f(c, f)
        //else
        //    console.log('reject tag name: ' + c.tagName)
    })
    return r
}

/**
 * shortcut for textContent(...)
 * @param {HTMLElement} node 
 * @returns {String} text content
 */
window.tc = node => textContent(node, textContent)?.trim()
