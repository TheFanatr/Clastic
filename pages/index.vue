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
        <!-- Add a button to manually refresh if needed -->
        <button @click="refresh()" :disabled="pending">Apply Selector</button>
        <br />
        <!-- Remove the old site dock -->
        <!-- <div ref="site_dock" class="site-preview-dock"></div> --> 
        <hr />
        <h2>Selections:</h2>
        <!-- Pass the html and styles to the component -->
        <SelectionDisplay 
            v-for="(selection, index) in selections" 
            :key="`${apiUrl}-${index}`" 
            :html="selection.html"
            :styles="selection.styles"
        />
         <p v-if="pending">Loading selections...</p>
         <p v-if="!pending && selections?.length === 0 && !error">No elements found for selector: {{ selector }}</p>
         <p v-if="error">Error loading site: {{ error.message }}</p>
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink } from '#components'
    // SelectionDisplay component is auto-imported by Nuxt
    import { ref, computed, watch, onMounted } from 'vue' 

    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const selector = ref('html>body>div>h1') // Example selector

    // Computed property for the API URL, now including the selector
    const apiUrl = computed(() => 
        `/api/site?link=${encodeURIComponent(link.value)}&selector=${encodeURIComponent(selector.value)}`
    )

    // Define the expected data structure from the API
    interface SelectionData {
        html: string;
        styles: Record<string, string>;
    }

    // Fetch data using the combined API URL
    const { data: selectionsData, pending, error, refresh } = useFetch<SelectionData[]>(apiUrl, {
         immediate: true,
         // Default value is needed for v-for during initial load/pending
         default: () => [], 
         // watch: false // If you want to trigger refresh manually, e.g., on button click
    })

    // Computed property for the selections, now directly using the fetched data
    const selections = computed(() => selectionsData.value || []);

    // --- Remove or adapt the old site_document_element and site_holder logic ---
    // const tree_builder = new DOMParser(); 
    // const site_document_element = computed(() => { ... });
    // const site_holder = computed(() => { ... }); 
    // const site_dock = ref<HTMLDivElement | null>(null);
    // function dockMainSite() { ... }
    // watch(site_holder, dockMainSite, { immediate: true });
    // onMounted(dockMainSite);
    // -------------------------------------------------------------------------

</script>

<style scoped>
    /* Remove or adapt old styles */
    h2 {
        margin-top: 20px;
    }
    button {
        margin-left: 10px;
    }
</style>
