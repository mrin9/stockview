<template>
  <div class="p-6 space-y-6 animate-fade-in" v-if="stockData">
    <!-- Header Section -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-bold text-white tracking-tight">{{ stockData.profile.symbol }}</h1>
          <span class="px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">NSE</span>
        </div>
        <p class="text-slate-400 text-sm max-w-2xl">{{ stockData.profile.description }}</p>
        <a :href="stockData.profile.website" target="_blank" class="text-orange-500 text-xs hover:underline mt-1 block">Visit Website</a>
      </div>
      <div class="text-right">
        <div class="text-3xl font-bold font-mono text-white">
          ₹{{ currentPrice }}
        </div>
        <div class="flex items-center justify-end gap-2 text-sm font-bold" :class="priceChange >= 0 ? 'text-green-400' : 'text-red-400'">
            <i :class="priceChange >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
            <span>{{ Math.abs(priceChange).toFixed(2) }} ({{ Math.abs(percentChange).toFixed(2) }}%)</span>
        </div>
        <div class="text-xs text-slate-500 mt-1">As of {{ lastUpdated }}</div>
      </div>
    </div>

    <!-- Top Grid: Essentials & Analysis -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Essentials Card -->
      <div class="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Company Essentials</h3>
        <div class="grid grid-cols-2 gap-y-4 gap-x-2">
            <div class="flex flex-col">
                <span class="text-xs text-slate-500">Market Cap</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.marketCap }} Cr</span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-slate-500">P/E Ratio</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.pe }}</span>
            </div>
             <div class="flex flex-col">
                <span class="text-xs text-slate-500">P/B Ratio</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.pb }}</span>
            </div>
             <div class="flex flex-col">
                <span class="text-xs text-slate-500">ROE</span>
                <span class="font-medium text-green-400">{{ stockData.fundamentals.roe }}</span>
            </div>
             <div class="flex flex-col">
                <span class="text-xs text-slate-500">Book Value</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.bookValue }}</span>
            </div>
            <div class="flex flex-col">
                <span class="text-xs text-slate-500">Div. Yield</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.divYield }}</span>
            </div>
             <div class="flex flex-col">
                <span class="text-xs text-slate-500">Debt to Eq</span>
                <span class="font-medium text-red-300">{{ stockData.fundamentals.debtToEquity }}</span>
            </div>
             <div class="flex flex-col">
                <span class="text-xs text-slate-500">Face Value</span>
                <span class="font-medium text-slate-200">{{ stockData.fundamentals.faceValue }}</span>
            </div>
        </div>
      </div>

       <!-- Chart Section using ChartJS -->
       <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-0 overflow-hidden flex flex-col shadow-sm">
         <div class="p-4 border-b border-slate-800 flex justify-between items-center">
             <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Price & Volume (1D)</h3>
             <div class="flex gap-2">
                 <button class="px-2 py-1 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">1D</button>
             </div>
         </div>
         <div class="flex-1 min-h-[300px] p-4 relative">
             <Line v-if="chartData" :data="chartData" :options="chartOptions" />
         </div>
       </div>
    </div>

    <!-- PE & PB Charts Row (Proxy Charts for now) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
             <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">P/E Trends (5Y Estimate)</h3>
             <div class="h-64 relative">
                 <Line v-if="peChartData" :data="peChartData" :options="peChartOptions" />
             </div>
        </div>
         <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
             <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">P/B Trends (5Y Estimate)</h3>
             <div class="h-64 relative">
                 <Line v-if="pbChartData" :data="pbChartData" :options="peChartOptions" />
             </div>
        </div>
    </div>

    <!-- Pros & Cons -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <!-- Pros -->
         <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
             <h3 class="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                 <i class="pi pi-thumbs-up"></i> Pros
             </h3>
             <ul class="space-y-2">
                 <li v-for="(pro, i) in stockData.fundamentals.pros" :key="i" class="text-sm text-slate-300 flex items-start gap-2">
                     <i class="pi pi-check text-green-500 text-xs mt-1"></i> {{ pro }}
                 </li>
             </ul>
         </div>
         <!-- Cons -->
         <div class="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
             <h3 class="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2 flex items-center gap-2">
                 <i class="pi pi-thumbs-down"></i> Cons
             </h3>
             <ul class="space-y-2">
                 <li v-for="(con, i) in stockData.fundamentals.cons" :key="i" class="text-sm text-slate-300 flex items-start gap-2">
                     <i class="pi pi-times text-red-500 text-xs mt-1"></i> {{ con }}
                 </li>
             </ul>
         </div>
    </div>

    <!-- Peer Comparison -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
         <h3 class="text-lg font-bold text-white mb-4">Peer Comparison</h3>
         <DataTable :value="stockData.peers" tableStyle="min-width: 50rem">
            <Column field="symbol" header="Name">
                <template #body="slotProps">
                    <span class="font-bold text-orange-400">{{ slotProps.data.symbol }}</span>
                </template>
            </Column>
            <Column field="cmp" header="Price (₹)">
                 <template #body="slotProps">₹{{ slotProps.data.cmp }}</template>
            </Column>
             <Column field="pe" header="P/E"></Column>
             <Column field="marCap" header="Market Cap (Cr)"></Column>
             <Column field="divYield" header="Div Yield"></Column>
             <Column field="roe" header="ROE"></Column>
         </DataTable>
    </div>

    <!-- Financial Tables Tab View -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div class="flex border-b border-slate-800">
             <button 
                v-for="tab in tabs" 
                :key="tab"
                @click="activeTab = tab"
                class="px-6 py-4 text-sm font-medium transition-all relative"
                :class="activeTab === tab ? 'text-orange-500 bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'"
             >
                {{ tab }}
                <div v-if="activeTab === tab" class="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></div>
             </button>
        </div>
        
        <div class="p-6 overflow-x-auto">
             <!-- Quarterly Results -->
             <DataTable v-if="activeTab === 'Quarterly Results'" :value="stockData.financials.quarterly" stripedRows class="text-sm">
                <Column field="period" header="Period" frozen></Column>
                <Column field="sales" header="Sales"></Column>
                <Column field="expenses" header="Expenses"></Column>
                <Column field="operatingProfit" header="Op. Profit"></Column>
                <Column field="opm" header="OPM %"></Column>
                <Column field="otherIncome" header="Other Inc."></Column>
                <Column field="interest" header="Interest"></Column>
                <Column field="depreciation" header="Deprec."></Column>
                <Column field="pbt" header="PBT"></Column>
                <Column field="tax" header="Tax %"></Column>
                <Column field="netProfit" header="Net Profit">
                    <template #body="slotProps">
                        <span class="font-bold text-white">{{ slotProps.data.netProfit }}</span>
                    </template>
                </Column>
                <Column field="eps" header="EPS"></Column>
             </DataTable>

             <!-- Profit & Loss -->
             <DataTable v-if="activeTab === 'Profit & Loss'" :value="stockData.financials.pnl" stripedRows class="text-sm">
                <Column field="year" header="Year" frozen></Column>
                <Column field="sales" header="Sales"></Column>
                <Column field="operatingProfit" header="Op. Profit"></Column>
                <Column field="opm" header="OPM %"></Column>
                <Column field="netProfit" header="Net Profit">
                     <template #body="slotProps">
                        <span class="font-bold text-white">{{ slotProps.data.netProfit }}</span>
                    </template>
                </Column>
                <Column field="eps" header="EPS"></Column>
                <Column field="divPayout" header="Div Payout %"></Column>
             </DataTable>

              <!-- Balance Sheet -->
             <DataTable v-if="activeTab === 'Balance Sheet'" :value="stockData.financials.balanceSheet" stripedRows class="text-sm">
                <Column field="year" header="Year" frozen></Column>
                <Column field="shareCapital" header="Eq. Capital"></Column>
                <Column field="reserves" header="Reserves"></Column>
                <Column field="borrowings" header="Borrowings"></Column>
                <Column field="totalLiabilities" header="Total Liab.">
                     <template #body="slotProps">
                        <span class="font-bold text-white">{{ slotProps.data.totalLiabilities }}</span>
                    </template>
                </Column>
                <Column field="totalAssets" header="Total Assets">
                     <template #body="slotProps">
                        <span class="font-bold text-white">{{ slotProps.data.totalAssets }}</span>
                    </template>
                </Column>
             </DataTable>

             <!-- Cash Flows -->
             <DataTable v-if="activeTab === 'Cash Flows'" :value="stockData.financials.cashFlow" stripedRows class="text-sm">
                <Column field="year" header="Year" frozen></Column>
                <Column field="cashFromOperating" header="Operating"></Column>
                <Column field="cashFromInvesting" header="Investing"></Column>
                <Column field="cashFromFinancing" header="Financing"></Column>
                <Column field="netCashFlow" header="Net Cash Flow">
                     <template #body="slotProps">
                        <span :class="parseFloat(slotProps.data.netCashFlow) > 0 ? 'text-green-400' : 'text-red-400'" class="font-bold">
                            {{ slotProps.data.netCashFlow }}
                        </span>
                    </template>
                </Column>
             </DataTable>

             <!-- Ratios -->
             <DataTable v-if="activeTab === 'Ratios'" :value="stockData.financials.ratios" stripedRows class="text-sm">
                 <Column field="year" header="Year" frozen></Column>
                 <Column field="roce" header="ROCE %"></Column>
                 <Column field="roe" header="ROE %"></Column>
                 <Column field="debtToEquity" header="Debt/Eq"></Column>
                 <Column field="inventoryTurnover" header="Inv Turn"></Column>
                 <Column field="debtorDays" header="Debtor Days"></Column>
                 <Column field="interestCoverage" header="Int. Cov"></Column>
             </DataTable>
        </div>
    </div>

    <!-- Shareholding Pattern -->
    <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
         <h3 class="text-lg font-bold text-white mb-4">Shareholding Pattern</h3>
         <DataTable :value="stockData.shareholdings" stripedRows class="text-sm">
             <Column field="period" header="Period"></Column>
             <Column field="promoters" header="Promoters %"></Column>
             <Column field="fii" header="FIIs %"></Column>
             <Column field="dii" header="DIIs %"></Column>
             <Column field="public" header="Public %"></Column>
         </DataTable>
    </div>
    
  </div>
  <div v-else-if="loading" class="flex items-center justify-center p-20">
      <i class="pi pi-spin pi-spinner text-4xl text-orange-500"></i>
  </div>
  <div v-else class="p-10 text-center text-slate-500">
      Select a stock to view details
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const props = defineProps({
    symbol: {
        type: String,
        required: true
    }
});

const stockData = ref(null);
const loading = ref(true);
const activeTab = ref('Quarterly Results');
const tabs = ['Quarterly Results', 'Profit & Loss', 'Balance Sheet', 'Cash Flows', 'Ratios'];

const currentPrice = computed(() => {
    if (!stockData.value?.history?.length) return 0;
    return stockData.value.history[stockData.value.history.length - 1].close;
});

const priceChange = computed(() => {
     if (!stockData.value?.history?.length || stockData.value.history.length < 2) return 0;
     const curr = stockData.value.history[stockData.value.history.length - 1].close;
     const prev = stockData.value.history[stockData.value.history.length - 2].close;
     return curr - prev;
});

const percentChange = computed(() => {
     if (!stockData.value?.history?.length || stockData.value.history.length < 2) return 0;
     const prev = stockData.value.history[stockData.value.history.length - 2].close;
     return (priceChange.value / prev) * 100;
})

const lastUpdated = computed(() => {
     if (!stockData.value?.history?.length) return '';
     return new Date(stockData.value.history[stockData.value.history.length - 1].timestamp).toLocaleString();
});

// Charts
const chartData = computed(() => {
    if (!stockData.value?.history) return null;
    const history = stockData.value.history;
    // Downsample for simpler view (take last 200 points)
    const subHistory = history.slice(-200); 

    return {
        labels: subHistory.map(d => new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})),
        datasets: [{
            label: 'Price',
            data: subHistory.map(d => d.close),
            borderColor: '#f97316',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            fill: true,
            tension: 0.1,
            pointRadius: 0
        }]
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { 
            mode: 'index', 
            intersect: false,
            backgroundColor: '#1e293b',
            titleColor: '#e2e8f0',
            bodyColor: '#e2e8f0',
            borderColor: '#334155',
            borderWidth: 1
        }
    },
    scales: {
        x: { display: false },
        y: { 
            grid: { color: '#334155' },
            ticks: { color: '#94a3b8' } 
        }
    },
    interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
    }
};

const peChartData = computed(() => ({
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
        label: 'P/E',
        data: [20, 25, 22, 30, 28],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
    }]
}));

const pbChartData = computed(() => ({
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
        label: 'P/B',
        data: [3.5, 4.0, 3.8, 4.5, 4.2],
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        fill: true,
        tension: 0.4
    }]
}));

const peChartOptions = {
    ...chartOptions,
    scales: {
         x: { 
             display: true, 
             grid: { display: false },
             ticks: { color: '#64748b' } 
        },
        y: { 
            display: true,
            grid: { color: '#1e293b' },
            ticks: { color: '#64748b' } 
        }
    }
}


async function fetchData(sym) {
    if (!sym) return;
    loading.value = true;
    stockData.value = null;
    try {
        const res = await fetch(`/api/stock/${sym}.json`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        stockData.value = data;
    } catch (e) {
        console.error(e);
    } finally {
        loading.value = false;
    }
}

watch(() => props.symbol, (newSymbol) => {
    fetchData(newSymbol);
}, { immediate: true });

</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
