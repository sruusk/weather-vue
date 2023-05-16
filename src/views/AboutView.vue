<template>
  <div class="about">
    <BackNavigation> {{ $t('routes.about') }} </BackNavigation>
    <h1>{{ $t('about.credits') }}</h1>
    <CreditsItem :title="$t('about.FMI')"
                 :content="$t('about.weatherData')"
    >
      <a href="https://www.ilmatieteenlaitos.fi/avoin-data" target="_blank">
        <FMIOpenDataIcon style="margin-top: -30px" />
      </a>
    </CreditsItem>
    <CreditsItem title="OpenWeather"
                 :content="$t('about.additionalData')"
    >
      <a href="https://openweathermap.org/" target="_blank">
        <img
          src="@/assets/OpenWeather-Negative-Logo.webp"
          alt="OpenWeather Logo"
          style="margin-top: -20px;"
        />
      </a>
    </CreditsItem>
    <CreditsItem :title="$t('about.icons')"
                 content=""
    >
      <a href="https://www.flaticon.com/free-icons/profile"
         title="profile icons"
         style="color: white;"
         target="_blank"
      >
        Profile icons created by Pixel perfect - Flaticon
      </a>
      <a href="https://www.flaticon.com/free-icons/bookmark"
         title="bookmark icons"
         style="color: white;"
         target="_blank"
      >
        Bookmark icons created by Icon mania - Flaticon
      </a>
    </CreditsItem>
    <CreditsItem :title="$t('about.weatherSymbols')"
                 content=""
    >
      <a href="https://github.com/basmilius/weather-icons"
         target="_blank"
         style="color: white;"
      >
        Bas Milius - Meteocons
      </a>
    </CreditsItem>
    <CreditsItem
      title="Vue.js"
      :content="$t('about.madeWithVue')"
    >
      <a href="https://vuejs.org/" target="_blank">
        <VueIcon style="height: 70px;" />
      </a>
    </CreditsItem>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BackNavigation from "@/components/BackNavigation.vue";
import CreditsItem from "@/components/settings/CreditsItem.vue";
import FMIOpenDataIcon from "@/components/icons/FMIOpenDataIcon.vue";
import VueIcon from "@/components/icons/VueIcon.vue";

export default defineComponent({
  name: "AboutView",
  components: {
      VueIcon,
      FMIOpenDataIcon,
    CreditsItem,
    BackNavigation,
  },
});
</script>

<style>
.about {
  min-width: 100%;
}
.about h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  padding: 0;
  text-align: center;
  color: white;
}
</style>
