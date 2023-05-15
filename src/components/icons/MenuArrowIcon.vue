<!--suppress ALL -->
<template>
  <svg
      width="8px"
      height="13px"
      viewBox="0 0 8 13"
      version="1.1"
      id="svg4201"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:svg="http://www.w3.org/2000/svg">
    <g
        stroke="none"
        stroke-width="1"
        fill="none"
        fill-rule="evenodd"
        stroke-linecap="round"
        stroke-linejoin="round"
        id="g4199"
        transform="matrix(0.9380071,0,0,1.0023502,0.04766278,-0.01605235)"
        style="stroke-width:0.97973992;stroke-dasharray:none">
      <g
          transform="translate(-336,-323)"
          stroke="#3559b9"
          id="g4197"
          :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`">
        <g
            id="g4195"
            :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`">
          <g
              transform="translate(15,297)"
              id="g4193"
              :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`">
            <path
                d="m 322,26 6,6.5 -6,6.5"
                id="path4191"
                :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`" />
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MenuArrowIcon",
  props: {
    color: {
      type: String,
      default: "var(--backgroundLightest)",
    },
  },
});
</script>
