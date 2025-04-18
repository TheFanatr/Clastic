<template>
    <div>
        <h1>Clastic</h1>
        <NuxtLink to="/test-page">Test Page</NuxtLink>
        <br />
        <label for="link">Link</label>
        <input type="text" id="link" name="link" v-model="link" />
        <br />
        <label for="selector">Selector</label>
        <input type="text" id="selector" name="selector" v-model="selector" />
        <br />
        <!-- Dock for the whole site (optional, can be removed if not needed) -->
        <div ref="site_dock" class="site-preview-dock"></div> 
        <hr />
        <h2>Selections:</h2>
        <!-- Use the new component -->
        <SelectionDisplay 
            v-for="(element, index) in selections" 
            :key="`${link}-${selector}-${index}`" 
            :selected-element="element"
        />
         <p v-if="!selections.length && !site_text.pending.value">No elements found for selector: {{ selector }}</p>
         <p v-if="site_text.pending.value">Loading site...</p>
         <p v-if="site_text.error.value">Error loading site: {{ site_text.error.value.message }}</p>
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink } from '#components'
    // SelectionDisplay component is auto-imported by Nuxt
    import { ref, computed, watch, onMounted } from 'vue' 

    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const link_to_load = computed(() => `${useRequestURL().origin}/api/site?link=${encodeURIComponent(link.value)}`)
    const selector = ref('html>body>div>h1') // Example selector
    
    // Use DOMParser directly since SSR is off
    const tree_builder = new DOMParser();

    const site_text = useFetch(link_to_load, { immediate: true }) // Fetch immediately

    // Computed property to get the parsed document's root element
    const site_document_element = computed(() => {
        if (site_text.data.value && typeof site_text.data.value === 'string') {
            try {
                return tree_builder.parseFromString(site_text.data.value, 'text/html').documentElement;
            } catch (e) {
                 console.error("Error parsing HTML:", e);
                 return null;
            }
        } 
        return null;
    });

    // Keep the original site holder logic separate for now if needed for preview
    const site_holder = computed(() => {
        if (!site_document_element.value) return null;
        const holder = document.createElement('div');
        holder.className = 'site-content-holder'; // Add class for potential styling
        holder.attachShadow({ mode: 'open' });
        // Clone the root to avoid modifying the computed source
        holder.shadowRoot!.appendChild(site_document_element.value.cloneNode(true));
        return holder;
    });

    // Compute the selected elements based on the parsed document
    const selections = computed(() => {
        if (!site_document_element.value) return [];
        try {
             // querySelectorAll needs to run on the parsed element
            return Array.from(site_document_element.value.querySelectorAll(selector.value));
        } catch (e) {
            console.error("Error running querySelectorAll:", e);
            return [];
        }
    });

    // Ref for the main site dock element
    const site_dock = ref<HTMLDivElement | null>(null);

    // Function to dock the main site preview (if used)
    function dockMainSite() {
         if (site_dock.value && site_holder.value) {
             console.log("Docking main site preview...");
             site_dock.value.innerHTML = ''; // Clear previous
             site_dock.value.appendChild(site_holder.value);
         } else if (site_dock.value) {
              site_dock.value.innerHTML = 'Loading site preview...'; // Placeholder
         }
    }

    // Watch for changes in the computed site_holder and dock it
    watch(site_holder, dockMainSite, { immediate: true });
    // Ensure docking happens after mount as well
    onMounted(dockMainSite);

    // No longer need selection_holders, selection_docks, dock_holders

</script>

<style scoped>
    /* Styles for the main site preview dock */
    .site-preview-dock {
        border: 1px solid #ccc;
        margin: 10px 0;
        height: 300px; /* Example fixed height */
        overflow: auto; /* Allow scrolling */
    }
    .site-content-holder {
        /* If you need to style the holder itself */
        width: 100%;
        height: 100%;
    }
    h2 {
        margin-top: 20px;
    }
</style>
