// browser script: query google search 'home' page
// input: query

(async () => {

    let wait = async ms => await new Promise(resolve => {
        console.log('wait ' + ms + ' ms');
        setTimeout(() => {
            console.log('end wait ' + ms + ' ms')
            resolve();
        }, ms);
    })

    // 0. setup

    let query = '{query}'
    let kdbDelay = '{minimumKbdDelay}'
    let delay = '{minimumPauseDelay}'

    // 1. check if sorry captcha page

    if (window.location.pathname == '{catchaPathName}')
        return '{CAPTCHA_BEFORE_HOME_PAGE}'

    // 1. check if cookie consentement page

    let buttons = document.querySelectorAll('[role="none"]').values().toArray()
        .map(x => x.parentNode)
        .filter(x => x.tagName == 'BUTTON'
            && x.getBoundingClientRect().width != 0
        )
    let isConsentement = buttons.length == 4
    if (isConsentement)
        // refuse all
        buttons[2].click()
    await wait(delay * 2)

    // 2. fill query input field (home page)

    let queryInput = document.querySelectorAll('textarea[autofocus]')[0]
    queryInput.focus()
    queryInput.value = ''
    await wait(delay)

    for (let i = 0; i < query.length; i++) {
        queryInput.value += query[i]
        await wait(kdbDelay)
    }

    // 3. click the 'Search' button

    let submitButtons = document.querySelectorAll('input[type=submit]')
    let visiblesButtons = submitButtons
        .values().filter(x => x.getBoundingClientRect().width != 0).toArray()
    let submitButton = visiblesButtons[0]

    await wait(delay * 5)
    submitButton.click()

    // --> the page change to the result page
    // OR
    // the sorry page (human check)
    /*
    host:"www.google.com"
    hostname:"www.google.com"
    href:"https://www.google.com/sorry/index?continue=https://www.google.com/search%3Fq%3Dpython%2Bscripts%26sca_esv%3D829b6725c1213f11%26source%3Dhp%26ei%3DdRneaZzeOpS7ruEPqLOCgAo%26iflsig%3DAFdpzrgAAAAAad4nhWNP6L1H9u0K_oPDVkkYNri9eLvq%26ved%3D0ahUKEwjc7IDAk-2TAxWUnSsGHaiZAKAQ4dUDCBI%26oq%3D%26gs_lp%3DEgdnd3Mtd2l6IgBIAFAAWABwAHgAkAEAmAEAoAEAqgEAuAEMyAEAmAIAoAIAmAMAkgcAoAcAsgcAuAcAwgcAyAcAgAgB%26sclient%3Dgws-wiz%26sei%3Duxneaf36HICC9u8P4eSPyAE&q=EhAqDydCUAEFZZ0inws4Dz6-GLuz-M4GIjDkqn78npCABqJLay8mAXfgwC1Kl5s0liSxOv6-BTnKhEo9nR8labAyKtp0GMjtumYyAVJaAUM"
    origin:"https://www.google.com"
    pathname:"/sorry/index"
    */

    return '{RESULT_PAGE}'

})()
