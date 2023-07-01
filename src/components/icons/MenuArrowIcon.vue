<!--suppress ALL -->
<template>
  <svg
    id="svg4201"
    height="13px"
    version="1.1"
    viewBox="0 0 8 13"
    width="8px"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:svg="http://www.w3.org/2000/svg">
    <g
      id="g4199"
      fill="none"
      fill-rule="evenodd"
      stroke="none"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1"
      style="stroke-width:0.97973992;stroke-dasharray:none"
      transform="matrix(0.9380071,0,0,1.0023502,0.04766278,-0.01605235)">
      <g
        id="g4197"
        :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`"
        stroke="#3559b9"
        transform="translate(-336,-323)">
        <g
          id="g4195"
          :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`">
          <g
            id="g4193"
            :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`"
            transform="translate(15,297)">
            <path
              id="path4191"
              :style="`stroke-width:0.97973992;stroke-dasharray:none;stroke:${color};stroke-opacity:1`"
              d="m 322,26 6,6.5 -6,6.5"/>
          </g>
        </g>
      </g>
    </g>
  </svg>
</template>
<script lang="ts">
import {defineComponent} from "vue";

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
