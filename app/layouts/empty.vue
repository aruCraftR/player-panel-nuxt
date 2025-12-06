<script setup lang="ts">
const route = useRoute()
useHead({
    meta: [{ property: 'og:title', content: `aruCraftR - ${route.meta.title}` }],
})
</script>

<template>
    <div class="min-h-screen">
        <slot />
    </div>
</template>
