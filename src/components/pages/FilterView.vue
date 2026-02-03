<template>
  <div class="flex flex-col gap-4 p-4">
    <Toast />
    <div class="flex justify-between items-center text-white">
      <h2 class="text-lg font-bold uppercase tracking-tight">Advanced Stock Filter</h2>
      <p class="text-slate-400 text-sm">Build complex queries with multi-step logic</p>
    </div>

    <Card class="bg-slate-900 border-slate-800 shadow-xl">
      <template #title>
        <div class="text-sm font-semibold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-800">Filter Builder</div>
      </template>
      <template #content>
        <div class="flex flex-col gap-6 pt-2">
          <!-- Criteria Flow (Chips) -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-6">
            <template v-for="(item, index) in criteria" :key="index">
              <!-- Joiner Text (Except before first item) -->
              <div v-if="index > 0" class="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
                {{ criteria[index - 1].joiner }}
              </div>

              <!-- Filter Chip -->
              <div class="relative bg-slate-800/60 border border-slate-700/50 rounded-lg px-6 py-4 min-w-[180px] flex items-center justify-center hover:border-slate-500 transition-colors group">
                <div class="text-sm text-slate-200 font-medium">
                  {{ getFieldLabel(item.field) }} {{ item.operator }} {{ item.value }}
                </div>
                <!-- Remove Button (Top Right) -->
                <button @click="removeCriteria(index)" class="absolute -top-2.5 -right-2.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white border-2 border-slate-900 hover:bg-red-600 shadow-lg transition-transform hover:scale-110">
                  <i class="pi pi-minus text-[10px] font-bold"></i>
                </button>
              </div>
            </template>

            <!-- Active Builder Area -->
            <div class="flex flex-col gap-3 p-4 bg-slate-950/40 border border-dashed border-slate-800 rounded-lg min-w-[400px]">
              <div class="flex gap-2 items-center">
                <Select v-model="builder.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" size="small" class="flex-1"/>
                <Select v-model="builder.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" size="small" class="w-20"/>
                <InputText v-model="builder.value" placeholder="Value" size="small" class="flex-1" @keyup.enter="commitBuilder('AND')"/>
                
                <!-- AND/OR Toggle Buttons -->
                <div class="flex border border-slate-700 rounded-md overflow-hidden bg-slate-900 ml-1">
                  <button @click="commitBuilder('AND')" class="px-3 py-1.5 text-[10px] font-bold tracking-wider hover:bg-slate-800 border-r border-slate-700 text-slate-400 hover:text-white transition-colors">AND</button>
                  <button @click="commitBuilder('OR')" class="px-3 py-1.5 text-[10px] font-bold tracking-wider hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">OR</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Row -->
          <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-800/50">
            <Button label="Clear All" icon="pi pi-filter-slash" @click="clear" severity="secondary" text size="small" />
            <Button label="Search Stocks" icon="pi pi-search" @click="search" :loading="loading" size="small" raised />
          </div>
        </div>
      </template>
    </Card>


    <Card v-if="results.length > 0" class="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
      <template #title><span class="text-white">Results ({{ results.length }})</span></template>
      <template #content>
        <DataTable :value="results" paginator :rows="100" scrollable scrollHeight="600px" tableStyle="min-width: 50rem; font-size: 0.85rem;" class="p-datatable-sm">
          <Column field="symbol" header="Symbol" sortable frozen class="font-bold text-orange-400"></Column>
          <Column field="timestamp" header="Time" sortable>
            <template #body="slotProps">
              {{ new Date(slotProps.data.timestamp).toLocaleString() }}
            </template>
          </Column>
          <Column field="close" header="Close" sortable></Column>
          <Column field="rsi" header="RSI">
            <template #body="slotProps">
              {{ slotProps.data.rsi?.toFixed(2) }}
            </template>
          </Column>
          <Column field="macd_MACD" header="MACD">
            <template #body="slotProps">
              {{ slotProps.data.macd_MACD?.toFixed(4) }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
    
    <div v-else-if="!loading && searched" class="text-center p-12 flex flex-col items-center justify-center bg-slate-900/50 rounded-sm border border-dashed border-slate-800">
      <div class="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
        <i class="pi pi-search text-2xl text-slate-500"></i>
      </div>
      <h3 class="text-slate-400 font-medium text-lg">No stocks found</h3>
      <p class="text-slate-600 text-sm mt-1">Try adjusting your filters or operators</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Card from 'primevue/card';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import SplitButton from 'primevue/splitbutton';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const loading = ref(false);
const searched = ref(false);
const results = ref([]);

const criteria = ref([]);
const builder = ref({ field: 'close', operator: '>', value: '', joiner: 'AND' });

const fieldOptions = [
  { label: 'Symbol', value: 'symbol' },
  { label: 'Resolution', value: 'resolution' },
  { label: 'Close Price', value: 'close' },
  { label: 'High Price', value: 'high' },
  { label: 'Low Price', value: 'low' },
  { label: 'Volume', value: 'volume' },
  { label: '--- Indicators ---', value: 'disabled', disabled: true },
  { label: 'RSI', value: 'rsi' },
  { label: 'SMA 10', value: 'sma10' },
  { label: 'SMA 20', value: 'sma20' },
  { label: 'SMA 50', value: 'sma50' },
  { label: 'SMA 200', value: 'sma200' },
  { label: 'EMA 10', value: 'ema10' },
  { label: 'EMA 20', value: 'ema20' },
  { label: 'EMA 50', value: 'ema50' },
  { label: 'EMA 200', value: 'ema200' },
  { label: 'MACD', value: 'macd_MACD' },
  { label: 'MACD Signal', value: 'macd_signal' },
  { label: 'MACD Hist', value: 'macd_histogram' },
  { label: 'BB Upper', value: 'bb_upper' },
  { label: 'BB Middle', value: 'bb_middle' },
  { label: 'BB Lower', value: 'bb_lower' },
  { label: 'ATR', value: 'atr' },
  { label: 'Stoch K', value: 'stoch_k' },
  { label: 'Stoch D', value: 'stoch_d' },
  { label: 'ADX', value: 'adx_adx' },
  { label: 'ADX +DI', value: 'adx_pdi' },
  { label: 'ADX -DI', value: 'adx_mdi' },
  { label: 'CCI', value: 'cci' },
  { label: 'Williams %R', value: 'wpr' },
  { label: 'OBV', value: 'obv' },
  { label: 'PSAR', value: 'psar' },
  { label: 'MFI', value: 'mfi' },
  { label: 'ROC', value: 'roc' },
  { label: 'TRIX', value: 'trix' },
  { label: 'WMA', value: 'wma' }
];

const getFieldLabel = (val) => {
    const opt = fieldOptions.find(o => o.value === val);
    return opt ? opt.label : val;
};

const commitBuilder = (joiner) => {
    if (!builder.value.value) {
        toast.add({ severity: 'warn', summary: 'Missing Value', detail: 'Please enter a value for the filter', life: 2000 });
        return;
    }
    criteria.value.push({ ...builder.value, joiner });
    // Keep the field but clear the value
    builder.value.value = '';
};

const removeCriteria = (index) => {
  criteria.value.splice(index, 1);
};

const clear = () => {
  criteria.value = [];
  builder.value = { field: 'close', operator: '>', value: '', joiner: 'AND' };
  results.value = [];
  searched.value = false;
};

const error = ref(null);

const validate = () => {
    if (criteria.value.length === 0 && builder.value.value) {
        commitBuilder('AND');
    }
    if (criteria.value.length === 0) {
        toast.add({ severity: 'warn', summary: 'Empty Filter', detail: 'Add at least one criteria to search', life: 3000 });
        return false;
    }
    return true;
};

const search = async () => {
  if (!validate()) return;
  
  loading.value = true;
  searched.value = true;
  error.value = null;
  try {
    const res = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ criteria: criteria.value })
    });
    const data = await res.json();
    if (data.error) {
      error.value = data.error;
      results.value = [];
      toast.add({ severity: 'error', summary: 'Error', detail: data.error, life: 3000 });
    } else {
      results.value = data;
      if (data.length === 0) {
          toast.add({ severity: 'info', summary: 'No Results', detail: 'No stocks matched your criteria', life: 3000 });
      }
    }
  } catch (err) {
    console.error(err);
    error.value = err.message;
    toast.add({ severity: 'error', summary: 'System Error', detail: err.message, life: 3000 });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
:deep(.p-datatable) {
  --p-datatable-header-background: transparent;
}
:deep(.p-splitbutton-button) {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.1);
}
</style>
