import { readFileSync } from 'fs'
import { join } from 'path'

export default class PupeteerPlugin {

    // host plugin (puppeteer)
    plugin = null

    // path where the plugin class is
    pluginPath = null

    constructor(ctx, plugin, config, outputContext, pluginPath) {
        this.ctx = ctx
        this.plugin = plugin
        this.config = config
        this.outputContext = outputContext
        this.pluginPath = pluginPath
    }

    getScriptWithTransform(name, transformsFunc, path) {
        const scriptsPath = path || join(
            this.pluginPath,
            this.config.scriptsPath
        )
        const content = readFileSync(
            join(scriptsPath, name)
        ).toString()
        return !transformsFunc ? content :
            transformsFunc(content)
    }

    async importScripts(page) {
        if (!this.config.imports || this.config.imports.length == 0) return
        const scriptsPath = join(
            this.plugin.specification.file,
            '..',
            this.plugin.config.paths.scripts
        )
        this.config.imports.forEach(async imp => {
            const text = this.getScriptWithTransform(
                imp,
                null,
                scriptsPath
            )
            await page.addScriptTag({
                content: text
            })
        });
    }
}
