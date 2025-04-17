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
        {{ site_holder }} 
        <template v-for="holder in selection_holders" :key="holder.id">{{ holder }}</template>
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink } from '#components'
    
    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const link_to_load = computed(() => `${useRequestURL().origin}/api/site?link=${encodeURIComponent(link.value)}`) // useRequestURL() needed for SSR to work; /api/site as a reative route does not work on the server.
    const selector = ref('html>body>div>h1~p')
    
    const tree_builder = ref(new DOMParser())
    let node_identifier = 0

    const site_text = useFetch(link_to_load)
    const site = computed(() => tree_builder.value.parseFromString(<string>site_text.data.value, 'text/html').documentElement)
    const site_holder = computed(() => {
        const holder = document.createElement('div')
        holder.attachShadow({ mode: 'open' })
        holder.shadowRoot!.appendChild(site.value)
        return holder
    })
    const selections = computed(() => Array.from(site.value.querySelectorAll(selector.value)))
    const selection_holders = computed(() =>
        selections.value
            .map(selected => {
                const holder = document.createElement('div')
                holder.attachShadow({ mode: 'open' })
                const clone = <HTMLElement>selected.cloneNode()
                selected.computedStyleMap().forEach((value, key) => clone.style.setProperty(key, value[0].toString()))
                holder.shadowRoot!.appendChild(clone)
                holder.id = `selection-${node_identifier++}`
                return holder
            }))
</script>

<style scoped>
    .site {
        overflow-y: scroll;
        max-height: 20vh;
    }
</style>
