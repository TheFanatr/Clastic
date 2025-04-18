<template>
  <div ref="dock_point" class="selection-dock">
    <!-- Placeholder, content will be in shadow DOM -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{ 
  selectedElement: Element | null 
}>();

const dock_point = ref<HTMLDivElement | null>(null);

function setupShadowDOM() {
  if (!dock_point.value || !props.selectedElement || dock_point.value.shadowRoot) {
     // Don't run if element refs aren't ready, no element passed, or shadow root already exists
    return;
  }

  console.log('SelectionDisplay: Setting up shadow DOM for', props.selectedElement);
  const shadowRoot = dock_point.value.attachShadow({ mode: 'open' });
  const clone = props.selectedElement.cloneNode(true) as HTMLElement;

  // Apply computed styles (this runs client-side)
  try {
    const computedStyle = window.getComputedStyle(props.selectedElement);
    for (let i = 0; i < computedStyle.length; i++) {
      const key = computedStyle[i];
      const value = computedStyle.getPropertyValue(key);
      // Basic filtering: Avoid setting width/height directly maybe?
      // Or handle properties like 'all' which can cause issues
      if (key !== 'width' && key !== 'height' && key !== 'all') {
           clone.style.setProperty(key, value, computedStyle.getPropertyPriority(key));
      }
    }
    console.log('SelectionDisplay: Styles applied for', props.selectedElement);
  } catch (e) {
    console.error('SelectionDisplay: Error applying styles:', e);
  }

  shadowRoot.appendChild(clone);
}

// Run on mount
onMounted(() => {
  setupShadowDOM();
});

// Re-run if the selected element changes
watch(() => props.selectedElement, () => {
    // Clear existing shadow DOM if element changes?
    if (dock_point.value && dock_point.value.shadowRoot) {
        // dock_point.value.shadowRoot = null; // Can't directly nullify, might need to clear content
        dock_point.value.shadowRoot.innerHTML = ''; 
    }
    setupShadowDOM();
});

</script>

<style scoped>
.selection-dock {
  border: 1px dashed blue;
  margin-bottom: 5px;
  padding: 5px;
  /* Add styles for the dock itself if needed */
}
</style> 