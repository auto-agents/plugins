export default class ItalicRemover {

    constructor(ctx) {
        this.ctx = ctx
    }

    run(text) {
        if (!text || text.length == 0) return text
        var i = 0
        var x0 = -1
        const sym = '*'
        var r = ''
        while (i < text.length) {
            const pc = i > 0 ? text[i - 1] : null
            const c = text[i]
            const nc = i < text.length - 1 ? text[i + 1] : null
            if (c == sym && pc != sym && nc != sym) {

                if (x0 == -1) {

                    x0 = i
                }
                else {
                    //console.log(text.substring(x0, i + 1))
                    x0 = -1
                }
            } else {
                if (x0 == -1) r += c
            }
            i++
        }
        return r
    }
}