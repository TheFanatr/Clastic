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
        <div ref="site_dock" />
        <div v-for="[selection_identifier] in selection_holders" :key="selection_identifier" :ref="`${selection_identifier}_dock`" :data-holder="selection_identifier" />
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink } from '#components'

    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const link_to_load = computed(() => `${useRequestURL().origin}/api/site?link=${encodeURIComponent(link.value)}`) // useRequestURL() needed for SSR to work; /api/site as a reative route does not work on the server.
    const selector = ref('html>body>div>h1~p')
    const tree_builder_source = await useAsyncData('tree_builder_source', async () => {
        if (import.meta.env.SSR) {
            const { JSDOM } = await import('jsdom')
            return new JSDOM().window
        } else {
            return window
        }
    })
    const tree_builder = ref(new (tree_builder_source.data.value!.DOMParser)())
    let node_identifier = 0

    const site_text = useFetch(link_to_load)
    const site = computed(() => tree_builder.value.parseFromString(<string>site_text.data.value, 'text/html').documentElement)
    const site_holder = computed(() => {
        const holder = tree_builder_source.data.value!.document.createElement('div')
        holder.attachShadow({ mode: 'open' })
        holder.shadowRoot!.appendChild(site.value)
        return holder
    })
    const selections = computed(() => Array.from(site.value.querySelectorAll(selector.value)))
    const selection_holders = computed(() => (node_identifier = 0) || new Map(
        selections.value
            .map(selected => {
                const holder = tree_builder_source.data.value!.document.createElement('div')
                holder.attachShadow({ mode: 'open' })
                const clone = <HTMLElement>selected.cloneNode()
                Array.from(tree_builder_source.data.value!.getComputedStyle(selected)).forEach(([key, value]) => clone.style.setProperty(key, value))
                holder.shadowRoot!.appendChild(clone)
                return [holder.id = `selection_${node_identifier++}`, holder]
            })))
    const site_dock = useTemplateRef('site_dock')
    const selection_docks = computed(() => new Map(Array.from(selection_holders.value.entries()).map(([selection_identifier, holder]) => [selection_identifier, <Readonly<Ref<HTMLElement>>>useTemplateRef(`${selection_identifier}_dock`)])))
    onMounted(bind_holders)
    watch(site_holder, bind_holders)
    watch(selection_holders, bind_holders)
    function bind_holders() {
        site_dock.value!.appendChild(site_holder.value)
        Array.from(selection_docks.value.entries()).forEach(([selection_identifier, dock]) => dock.value!.appendChild(selection_holders.value.get(selection_identifier)!))
    }
</script>

<style scoped>
    .site {
        overflow-y: scroll;
        max-height: 20vh;
    }
</style>
