import AITool from "../../../../../../shared/src/components/ai-tools/ai-tool"

export default class WebSearchTool extends AITool {

    constructor(ctx, config) {
        super(ctx, config)
    }

    specification() {
        return {
            name: 'web_search',
            description: 'search information on internet using an online search engine',
            parameters: {
                type: "object",
                properties: {
                    "query": {
                        "type": "string",
                        "description": "the query to provide to the search engine"
                    },
                    "engine": {
                        "description": "the search engine that must be used",
                        "type": "string",
                        "enum": ["google"],
                        "default": "google"
                    }
                }
            },
            required: ["query"]
        }
    }

    async run(args) {

    }
}
