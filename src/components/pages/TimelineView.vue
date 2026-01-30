<template>
  <div class="flex flex-col gap-6 p-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-white">Stock Timeline</h2>
      <div class="flex gap-4 items-center">
        <Select v-model="selectedStock" :options="symbols" placeholder="Select Stock" class="w-64" @change="loadData" />
        
        <!-- Timeframe Buttons -->
        <div class="flex bg-slate-800 rounded p-1 gap-1">
            <Button 
                v-for="tf in timeframes" 
                :key="tf.label" 
                :label="tf.label" 
                size="small"
                @click="setTimeframe(tf)"
                :severity="selectedTF.label === tf.label ? 'primary' : 'secondary'"
                :text="selectedTF.label !== tf.label"
            />
        </div>

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
const loading = ref(false);
const ticks = ref([]);

const timeframes = [
    { label: '1H', value: '1h' },
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '1M', value: '1M' },
    { label: '5M', value: '5M' },
    { label: '1Y', value: '1y' }
];

const selectedTF = ref(timeframes[0]); // Default 1H

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
    text: `${selectedStock.value} - ${selectedTF.value.label} Timeline`,
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

const setTimeframe = (tf) => {
    selectedTF.value = tf;
    loadData();
};

const loadData = async () => {
  loading.value = true;
  
  // Calculate From Timestamp
  const now = new Date();
  let fromTime = new Date();
  
  switch(selectedTF.value.value) {
      case '1h': fromTime.setHours(now.getHours() - 1); break;
      case '1d': fromTime.setDate(now.getDate() - 1); break;
      case '7d': fromTime.setDate(now.getDate() - 7); break;
      case '1M': fromTime.setMonth(now.getMonth() - 1); break;
      case '5M': fromTime.setMonth(now.getMonth() - 5); break;
      case '1y': fromTime.setFullYear(now.getFullYear() - 1); break;
      default: fromTime.setHours(now.getHours() - 1);
  }
  
  try {
    const res = await fetch(`/api/stocks.json?symbol=${selectedStock.value}&from=${fromTime.getTime()}`);
    ticks.value = await res.json();
  } catch (e) {
      console.error(e);
  } finally {
      loading.value = false;
  }
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
