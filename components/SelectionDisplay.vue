<template>
  <div ref="dock_point" class="selection-dock">
    <!-- Content will be injected into shadow DOM -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

// Define props for HTML string and styles object
const props = defineProps<{ 
  html: string | null // HTML content as a string
  styles: Record<string, string> | null // Styles object
}>();

const dock_point = ref<HTMLDivElement | null>(null);

function setupShadowDOM() {
  // Check if refs are ready and props are available
  if (!dock_point.value || !props.html || !props.styles || dock_point.value.shadowRoot) {
    return; 
  }

  console.log('SelectionDisplay: Setting up shadow DOM...');
  const shadowRoot = dock_point.value.attachShadow({ mode: 'open' });
  
  // Inject the HTML string
  shadowRoot.innerHTML = props.html;

  // Get the newly created element within the shadow DOM
  const elementToStyle = shadowRoot.firstChild as HTMLElement | null;

  if (elementToStyle) {
      console.log('SelectionDisplay: Applying styles...');
      try {
          // Apply styles directly from the props object
          for (const key in props.styles) {
              if (Object.prototype.hasOwnProperty.call(props.styles, key)) {
                  // Use setProperty to handle potential CSS variables and priorities if needed
                  // For basic styles, direct assignment might also work: elementToStyle.style[key] = props.styles[key];
                  elementToStyle.style.setProperty(key, props.styles[key]);
              }
          }
          console.log('SelectionDisplay: Styles applied.');
      } catch (e) {
          console.error('SelectionDisplay: Error applying styles:', e);
      }
  } else {
       console.warn('SelectionDisplay: No element found in shadow DOM after setting innerHTML.');
  }
}

// Run on mount
onMounted(() => {
  setupShadowDOM();
});

// Re-run if the html or styles props change
watch([() => props.html, () => props.styles], () => {
    if (dock_point.value && dock_point.value.shadowRoot) {
        // Clear existing shadow DOM content before re-setup
        dock_point.value.shadowRoot.innerHTML = ''; 
    }
    // We need to potentially remove the old shadow root if attachShadow fails on re-run,
    // but attachShadow should fail if one exists. Clearing content might be enough.
    setupShadowDOM();
}, { deep: true }); // Use deep watch for the styles object

</script>

<style scoped>
.selection-dock {
  border: 1px dashed green; /* Changed border for visibility */
  margin-bottom: 5px;
  padding: 5px;
  /* Add styles for the dock itself if needed */
  overflow: hidden; /* Hide potential overflow */
  background-color: #f8f8f8; /* Light background for the dock */
}
</style> 