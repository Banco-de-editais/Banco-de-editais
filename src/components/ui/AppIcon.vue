<template>
  <svg
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.7"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path v-if="name === 'search'" stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
    <path v-else-if="name === 'plus'" stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    <path v-else-if="name === 'menu'" stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    <path v-else-if="name === 'close'" stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
    <path v-else-if="name === 'sun'" stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    <path v-else-if="name === 'moon'" stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    <path v-else-if="name === 'logout'" stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3-6 3 3m0 0-3 3m3-3H9" />
    <path v-else-if="name === 'consultation'" stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Z" />
    <path v-else-if="name === 'users'" stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.74-.479 3 3 0 0 0-4.682-2.72m.942 3.198v.003c0 .22-.012.437-.035.65A11.944 11.944 0 0 1 12 21c-2.17 0-4.205-.576-5.965-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.942-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 9.094 9.094 0 0 0 3.74.477m.94-3.197a5.995 5.995 0 0 0-.941 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    <path v-else-if="name === 'institution'" stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    <path v-else-if="name === 'journal'" stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5A2.25 2.25 0 0 1 6 2.25h12A2.25 2.25 0 0 1 20.25 4.5v15.75A1.5 1.5 0 0 1 18.75 21H5.25a1.5 1.5 0 0 1-1.5-1.5v-15Zm4.5 2.25h7.5m-7.5 3h7.5m-7.5 3h4.5" />
    <path v-else-if="name === 'indexer'" stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V5.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 4.252a1.125 1.125 0 0 0-1.006 0L3.622 6.689A1.125 1.125 0 0 0 3 7.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
    <path v-else-if="name === 'edict'" stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m0 12.75h7.5m-7.5 3h4.5m-1.5-15.75H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.625a9.375 9.375 0 0 0-9.375-9.375Z" />
    <path v-else-if="name === 'edit'" stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931ZM19.5 7.125 16.875 4.5M18 14.25v4.125c0 1.036-.84 1.875-1.875 1.875H5.625A1.875 1.875 0 0 1 3.75 18.375V7.875C3.75 6.84 4.59 6 5.625 6H9.75" />
    <path v-else-if="name === 'trash'" stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.35 9m-4.78 0L9.26 9m9.97-3.21c.35.05.7.1 1.04.16m-1.04-.16L18.16 19.67A2.25 2.25 0 0 1 15.92 21H8.08a2.25 2.25 0 0 1-2.24-2.33L4.77 5.79m14.46 0a48.1 48.1 0 0 0-3.48-.4m-10.98.4c-.35.05-.7.1-1.04.16m1.04-.16a48.1 48.1 0 0 1 3.48-.4m7.5 0V4.47c0-1.18-.91-2.17-2.09-2.2a52.1 52.1 0 0 0-3.32 0c-1.18.03-2.09 1.02-2.09 2.2v.92m7.5 0a48.67 48.67 0 0 0-7.5 0" />
    <path v-else-if="name === 'check'" stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    <path v-else-if="name === 'chevron-down'" stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    <path v-else-if="name === 'external'" stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-6-7.5h9m0 0v9m0-9L10.5 13.5" />
    <path v-else-if="name === 'calendar'" stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 9.75h16.5M5.25 5.25h13.5A1.5 1.5 0 0 1 20.25 6.75v12A1.5 1.5 0 0 1 18.75 20.25H5.25a1.5 1.5 0 0 1-1.5-1.5v-12a1.5 1.5 0 0 1 1.5-1.5Z" />
    <path v-else-if="name === 'filter'" stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.012L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    <path v-else-if="name === 'info'" stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25 12 10.5m0 0 .75.75M12 10.5v4.125m9-2.625a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    <path v-else-if="name === 'warning'" stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.949 3.374H4.646c-1.732 0-2.815-1.874-1.949-3.374L10.05 3.374c.866-1.5 3.034-1.5 3.9 0l7.353 12.752ZM12 15.75h.008v.008H12v-.008Z" />
    <path v-else stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
</template>

<script setup>
defineProps({ name: { type: String, required: true } })
</script>
