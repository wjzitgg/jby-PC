<template>
  <div class="app-container">
    <PlanTable :planType="1"/>
  </div>
</template>

<script>
import PlanTable from "./components/PlanTable";
export default {
  components: { PlanTable }
};
</script>

<style>
</style>
