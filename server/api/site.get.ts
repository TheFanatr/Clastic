import { defineEventHandler, getQuery, H3Error } from 'h3'

export default defineEventHandler(async (event) => {
    const link = <string>getQuery(event).link
    console.log(`Server API: Fetching ${link}`)
    if (!link) {
        throw createError({
            statusCode: 400,
            statusMessage: 'URL query parameter is required',
        })
    }

    try {
        console.log(`Server API: Fetching ${link}`)
        // Servers can fetch without browser CORS restrictions
        const site = await fetch(link)

        if (!site.ok) {
            console.error(`Server API: Fetch failed for ${link} with status ${site.status}`)
            throw createError({
                statusCode: site.status,
                statusMessage: `Failed to fetch from external URL: ${site.statusText}`,
            })
        }

        // Important: Handle content type appropriately
        // Assuming text/html for now
        const contentType = site.headers.get('content-type') || 'text/plain';
        const text = await site.text()

        console.log(`Server API: Successfully fetched ${link}`)

        // Set content type of the API response
        setHeader(event, 'Content-Type', contentType)
        return text // Return the fetched text

    } catch (error: any) {
        console.error(`Server API: Error fetching ${link}:`, error)
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