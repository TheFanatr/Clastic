import { defineEventHandler, getQuery, setHeader, createError } from 'h3'
import puppeteer from 'puppeteer'

// Helper function (optional, logic moved into main evaluate for simplicity now)
// async function getComputedStyles(elementHandle: puppeteer.ElementHandle<Element>): Promise<Record<string, string>> { ... }

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const url = query.link as string | undefined
    const selector = query.selector as string | undefined

    if (!url || !selector) {
        throw createError({
            statusCode: 400,
            statusMessage: "Both 'link' and 'selector' query parameters are required",
        })
    }

    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;
    try {
        console.log(`Server API [/api/site]: Launching Puppeteer for ${url}`)
        browser = await puppeteer.launch({ 
            headless: true, 
             args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for server environments
         });
        const page = await browser.newPage();
        
        // Increase timeout, set user agent
        await page.setDefaultNavigationTimeout(60000); // 60 seconds
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        console.log(`Server API [/api/site]: Navigating to ${url}`)
        await page.goto(url, { waitUntil: 'networkidle2' }); // Wait for network activity to settle

        console.log(`Server API [/api/site]: Querying selector "${selector}"`);
        // Wait for the selector to appear on the page
        try {
            await page.waitForSelector(selector, { timeout: 10000 }); // Wait up to 10 seconds
        } catch (e) {
             console.warn(`Server API [/api/site]: Selector "${selector}" not found within timeout.`);
             // Return empty array if selector not found, instead of throwing error?
             return []; 
        }

        // Combine element finding and style extraction in one evaluate
        const elementsData = await page.evaluate((sel: string) => { // Type hint for sel
            const results = [];
            const selectedElements = document.querySelectorAll(sel);
            
            for (const el of Array.from(selectedElements)) {
                 // Type hint for el
                 const htmlElement = el as HTMLElement; 
                 const computedStyle = window.getComputedStyle(htmlElement);
                 const styles: Record<string, string> = {};
                 for (let i = 0; i < computedStyle.length; i++) {
                     const key = computedStyle[i];
                     styles[key] = computedStyle.getPropertyValue(key);
                 }
                results.push({
                    html: htmlElement.outerHTML,
                    styles: styles
                });
            }
            return results;
        }, selector);

        console.log(`Server API [/api/site]: Found ${elementsData.length} elements for selector "${selector}"`);

        await browser.close();
        browser = null; // Ensure it's marked as closed

        setHeader(event, 'Content-Type', 'application/json')
        return elementsData; // Return the array of {html, styles}

    } catch (error: any) {
        console.error(`Server API [/api/site]: Puppeteer error for ${url} with selector "${selector}":`, error)
        if (browser) {
            // Use the same type logic here
            await browser.close(); 
        }
        throw createError({
            statusCode: 500,
            statusMessage: `Server error processing site: ${error.message}`,
            data: { url: url, selector: selector }
        })
    }
}) 