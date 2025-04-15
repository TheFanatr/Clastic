<template>
    <div>
        <h1>Clastic</h1>
        <NuxtLink to="/test-page">Test Page</NuxtLink>
        <br/>
        <label for="link">Link</label>
        <input type="text" id="link" name="link" v-model="link"/>
        <button>Load Site</button>
        <br/>
        <label for="selector">Selector</label>
        <input type="text" id="selector" name="selector" v-model="selector"/>
        <button>Select Element</button>
        <br/>
        <div ref="selection_holder" class="site"/>
        <div ref="site_holder" class="site"/>
    </div>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'

const link = ref(<string>useRoute().query.site || 'https://www.example.com')
const link_to_load = computed(() => `https://api.cors.lol/?url=${encodeURIComponent(link.value)}`)
const selector = ref('body>div>h1 ~ p ~ p')
const site = await useAsyncData('site', async () => {
    const site_data = await fetch(link_to_load.value)
    return await site_data.text()
}, { watch: [link_to_load] })
const site_holder = useTemplateRef('site_holder')
onMounted(async () => {
    if (site.error.value) {
        console.error('Error fetching site data via API:', site.error.value)
        return
    }
    
    if (!site_holder.value) return
    site_holder.value.attachShadow({ mode: 'open' });
    
    if (!site_holder.value.shadowRoot) return
    site_holder.value.shadowRoot.innerHTML = site.data.value ?? 'no data';
})
</script>

<style scoped>
.site {
    border: 8px solid rgba(245, 245, 245, 0.8);
    /* border-image: linear-gradient(to bottom, #f5f5f5, #e0e0e0) 1; */
    border-radius: 16px;
    padding: 1rem;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.7) inset;
}

.site::before {
    content: "";
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    z-index: -1;
    filter: blur(8px);
    background: rgba(245, 245, 245, 0.8);
    pointer-events: none;
}
</style>
