<template>
  <div class="app-container">
    <PlanTable :planType="2"/>
  </div>
</template>

<script>
import PlanTable from "./components/PlanTable.vue";
export default {
  components: { PlanTable }
};
</script>

<style>
</style>
