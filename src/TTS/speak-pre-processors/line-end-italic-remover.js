export default class LineEndItalicRemover {

    constructor(ctx) {
        this.ctx = ctx
    }

    run(text) {
        if (!text || text.length == 0) return text
        var i = 0
        var x0 = -1
        const sym = '*'
        const cite = '"'
        const ap_l = '('
        const ap_r = ')'
        const eol = '\n'
        var r = ''
        var rmv = ''
        while (i < text.length) {
            const pc = i > 0 ? text[i - 1] : null
            const c = text[i]
            const nc = i < text.length - 1 ? text[i + 1] : null
            if (c == sym
                && pc != sym && pc != cite && pc != ap_r && pc != ap_l
                && nc != sym && nc != cite && nc != ap_r && nc != ap_l
            ) {
                if (x0 == -1) {

                    x0 = i
                    rmv += c
                }
                else {
                    //console.log(text.substring(x0, i + 1))
                    x0 = -1
                    rmv += c
                    if (nc != eol) {
                        r += rmv
                        rmv = ''
                    }
                }
            } else {
                if (x0 == -1) r += c
                else rmv += c
            }
            i++
        }
        return r
    }
}