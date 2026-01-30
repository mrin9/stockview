<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">Stock Timeline</h2>
      <div class="flex gap-4">
        <Select v-model="selectedStock" :options="symbols" placeholder="Select Stock" class="w-64" @change="loadData" />
        <SelectButton v-model="selectedRes" :options="['1m', '1h']" @change="loadData" />
        <Button icon="pi pi-refresh" @click="loadData" :loading="loading" severity="secondary" />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <Card class="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
        <template #content>
          <div id="chart-timeline" class="h-[600px] w-full">
            <apexchart
              type="candlestick"
              height="550"
              :options="chartOptions"
              :series="series"
            ></apexchart>
          </div>
        </template>
      </Card>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label" class="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <div class="text-slate-400 text-sm mb-1">{{ stat.label }}</div>
          <div class="text-xl font-mono text-white">{{ stat.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';
import Button from 'primevue/button';
import Card from 'primevue/card';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;

const symbols = ref([]);
const selectedStock = ref('RELIANCE');
const selectedRes = ref('1m');
const loading = ref(false);
const ticks = ref([]);

const series = computed(() => {
  return [{
    data: ticks.value.map(t => ({
      x: new Date(t.timestamp),
      y: [t.open, t.high, t.low, t.close]
    }))
  }];
});

const chartOptions = computed(() => ({
  chart: {
    type: 'candlestick',
    height: 550,
    background: 'transparent',
    theme: 'dark',
    toolbar: {
      show: true,
      autoSelected: 'zoom'
    }
  },
  title: {
    text: `${selectedStock.value} - ${selectedRes.value} Timeline`,
    align: 'left',
    style: { color: '#fff' }
  },
  xaxis: {
    type: 'datetime',
    labels: { style: { colors: '#94a3b8' } }
  },
  yaxis: {
    tooltip: { enabled: true },
    labels: { style: { colors: '#94a3b8' } }
  },
  grid: {
    borderColor: '#334155',
    strokeDashArray: 4
  },
  theme: {
    mode: 'dark'
  },
  plotOptions: {
    candlestick: {
      colors: {
        upward: '#22c55e',
        downward: '#ef4444'
      }
    }
  }
}));

const stats = computed(() => {
  const latest = ticks.value[0];
  if (!latest) return [];
  return [
    { label: 'Current Price', value: latest.close },
    { label: 'RSI (14)', value: latest.rsi?.toFixed(2) || 'N/A' },
    { label: 'EMA 20', value: latest.ema20?.toFixed(2) || 'N/A' },
    { label: 'ATR', value: latest.atr?.toFixed(2) || 'N/A' }
  ];
});

const loadSymbols = async () => {
  const res = await fetch('/api/symbols.json');
  symbols.value = await res.json();
};

const loadData = async () => {
  loading.value = true;
  const res = await fetch(`/api/stocks.json?symbol=${selectedStock.value}&resolution=${selectedRes.value}&limit=100`);
  ticks.value = await res.json();
  loading.value = false;
};

onMounted(() => {
  loadSymbols();
  loadData();
});
</script>

<style scoped>
:deep(.apexcharts-canvas) {
  margin: 0 auto;
}
</style>
