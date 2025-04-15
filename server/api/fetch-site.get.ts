import { defineEventHandler, getQuery, H3Error } from 'h3'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const url = query.url as string | undefined

    if (!url) {
        throw createError({
            statusCode: 400,
            statusMessage: 'URL query parameter is required',
        })
    }

    try {
        console.log(`Server API: Fetching ${url}`)
        // Servers can fetch without browser CORS restrictions
        const response = await fetch(url)

        if (!response.ok) {
            console.error(`Server API: Fetch failed for ${url} with status ${response.status}`)
            throw createError({
                statusCode: response.status,
                statusMessage: `Failed to fetch from external URL: ${response.statusText}`,
            })
        }

        // Important: Handle content type appropriately
        // Assuming text/html for now
        const contentType = response.headers.get('content-type') || 'text/plain';
        const text = await response.text()

        console.log(`Server API: Successfully fetched ${url}`)

        // Set content type of the API response
        setHeader(event, 'Content-Type', contentType)
        return text // Return the fetched text

    } catch (error: any) {
        console.error(`Server API: Error fetching ${url}:`, error)
        // Handle potential fetch errors (network issues, etc.)
        // Ensure H3Error is thrown for Nuxt error handling
        if (error.statusCode) { // Re-throw existing H3Errors
             throw error;
        }
        throw createError({
            statusCode: 500,
            statusMessage: `Server error fetching URL: ${error.message}`,
        })
    }
}) 