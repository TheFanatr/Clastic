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
        <button v-if="!render_site" @click="render_site = true">Render</button>
        <Dock v-if="render_selection" v-for="[selection_identifier, { selection, styles }] in selections" :tree="selection" :styles="styles" :key="selection_identifier" />
        <Dock v-if="render_site" :tree="site" :styles="null" @vue:mounted="render_selection = true" />
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink, Dock } from '#components'
    
    const render_selection = ref(false)
    const render_site = ref(false)
    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const link_to_load = computed(() => `${useRequestURL().origin}/api/site?link=${encodeURIComponent(link.value)}`) // useRequestURL() needed for SSR to work; /api/site as a reative route does not work on the server.
    const selector = ref('html>body>div>h1')
    const tree_builder = ref(new DOMParser())

    const site_text = useFetch(link_to_load)
    const site = computed(() => tree_builder.value.parseFromString(<string>site_text.data.value, 'text/html').documentElement)
        
    let selection_count = 0
    const selections = computed(() => site.value && (selection_count = 0) || new Map(Array.from(site.value.querySelectorAll(selector.value)).map(selection => [`selection_${++selection_count}`, { selection: <HTMLElement>selection.cloneNode(true), styles: window.getComputedStyle(selection) }])))
    watch(selections, () => {
        render_selection.value = false
        render_site.value = false
    })
</script>

<style scoped>
</style>
