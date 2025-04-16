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
        <div ref="selection_holder" class="site" />
        <div ref="site_holder" class="site" />
    </div>
</template>

<script setup lang="ts">
    import { NuxtLink } from '#components'

    const link = ref(<string>useRoute().query.site || 'https://www.example.com')
    const link_to_load = computed(() => `${useRequestURL().origin}/api/site?link=${encodeURIComponent(link.value)}`) // useRequestURL() needed for SSR to work; /api/site as a reative route does not work on the server.
    const selector = ref('html>body>div>h1~p~p')
    const site_holder = useTemplateRef('site_holder')
    const selection_holder = useTemplateRef('selection_holder')
    const site = await useAsyncData('site', async () => {
        const site_data = await fetch(link_to_load.value)
        return await site_data.text()
    }, { watch: [link_to_load] })
    onMounted(build_site_root)
    watch(link_to_load, build_site_root)
    watch(selector, select)
    function select() {
        if (!site_holder.value) return
        if (!site_holder.value.shadowRoot) return

        const selection = site_holder.value.shadowRoot.querySelector(selector.value)
        // console.log(site_holder.value.shadowRoot, selection)
        if (!selection) {
            selection_holder.value!.shadowRoot!.innerHTML = 'selector not found in site'
            return
        }
        selection_holder.value!.shadowRoot!.innerHTML = ''
        const selector_node = selection.cloneNode(true)
        selection_holder.value!.shadowRoot!.appendChild(selector_node);

    }

    function build_site_root() {
        for (const holder of [site_holder, selection_holder]) {
            if (!holder.value) return
            if (!holder.value.shadowRoot) holder.value.attachShadow({ mode: 'open' });
        }
        
        site_holder.value!.shadowRoot!.innerHTML = ''
        site_holder.value!.shadowRoot!.appendChild((new DOMParser().parseFromString(<string><any>site.error.value ?? site.data.value ?? 'no data', 'text/html')).documentElement);
        select()
    }
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
