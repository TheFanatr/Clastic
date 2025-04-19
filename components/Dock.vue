<template>
    <div ref="dock" class="dock" />
</template>

<script setup lang="ts">
const { tree, styles } = defineProps<{ tree: HTMLElement, styles: CSSStyleDeclaration | null }>()
const dock = useTemplateRef<HTMLDivElement>('dock')
onMounted(dock_tree)
function dock_tree() {
    dock.value!.attachShadow({ mode: 'open' })
    dock.value!.shadowRoot!.innerHTML = ''
    dock.value!.shadowRoot!.appendChild(tree)
    if (!styles) return
    Array.from(styles).forEach(style => tree.style.setProperty(style, styles.getPropertyValue(style), styles.getPropertyPriority(style)))
}
</script>

<style scoped>
.dock {
    border: 1px dotted #000;
}
</style>
