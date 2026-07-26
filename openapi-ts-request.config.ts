import { defineConfig } from 'openapi-ts-request'
import process from 'node:process'

const schemaPath = process.env.OPENAPI_SCHEMA_PATH || '../admin9-api-laravel/docs/api.json'
const serversPath = process.env.OPENAPI_OUTPUT_PATH || './src/service'

export default defineConfig([
  {
    describe: 'Admin9 Member API',
    schemaPath,
    serversPath,
    includePaths: [/^\/api\/auth(?:\/|$)/],
    requestLibPath: `import request from '@/http/openapi-request';\n import type { OpenApiRequestOptions } from '@/http/types';`,
    requestOptionsType: 'OpenApiRequestOptions',
    isGenReactQuery: false,
    reactQueryMode: 'vue',
    isGenJavaScript: false,
  },
])
