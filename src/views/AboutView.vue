<template>
  <div class="about">
    <BackNavigation> {{ $t('routes.about') }}</BackNavigation>
    <h1>{{ $t('about.credits') }}</h1>
    <CreditsItem :content="$t('about.weatherData')"
                 :title="$t('about.FMI')"
    >
      <a href="https://www.ilmatieteenlaitos.fi/avoin-data" target="_blank">
        <FMIOpenDataIcon style="margin-top: -30px"/>
      </a>
    </CreditsItem>
    <CreditsItem :content="$t('about.additionalData')"
                 title="OpenWeather"
    >
      <a href="https://openweathermap.org/" target="_blank">
        <img
          alt="OpenWeather Logo"
          src="@/assets/OpenWeather-Negative-Logo.webp"
          style="margin-top: -20px;"
        />
      </a>
    </CreditsItem>
    <CreditsItem :title="$t('about.icons')"
                 content=""
    >
      <a href="https://www.flaticon.com/free-icons/profile"
         style="color: white;"
         target="_blank"
         title="profile icons"
      >
        Profile icons created by Pixel perfect - Flaticon
      </a>
      <a href="https://www.flaticon.com/free-icons/bookmark"
         style="color: white;"
         target="_blank"
         title="bookmark icons"
      >
        Bookmark icons created by Icon mania - Flaticon
      </a>
    </CreditsItem>
    <CreditsItem :title="$t('about.weatherSymbols')"
                 content=""
    >
      <a href="https://github.com/basmilius/weather-icons"
         style="color: white;"
         target="_blank"
      >
        Bas Milius - Meteocons
      </a>
    </CreditsItem>
    <CreditsItem :content="$t('about.madeWithVue')"
                 title="Vue.js"
    >
      <a href="https://vuejs.org/" target="_blank">
        <VueIcon style="height: 70px;"/>
      </a>
    </CreditsItem>
    <CreditsItem :title="$t('about.openSource')"
                 content=""
    >
      <router-link :to="{ name: 'licenses' }" style="color: white;">
        {{ $t('about.viewLicenses') }}
      </router-link>
    </CreditsItem>
  </div>
</template>

<script lang="ts">
import {defineComponent} from "vue";
import BackNavigation from "@/components/BackNavigation.vue";
import CreditsItem from "@/components/CreditsItem.vue";
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
