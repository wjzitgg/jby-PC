<template>
  <div class="app-container">
    <PlanTable :planType="0"/>
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
