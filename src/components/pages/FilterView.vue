<template>
  <div class="flex flex-col gap-6 p-6">
    <Toast />
    <div class="flex justify-between items-center text-white">
      <h2 class="text-2xl font-bold uppercase tracking-tight">Advanced Stock Filter</h2>
      <p class="text-slate-400 text-sm">Build complex queries with multi-step logic</p>
    </div>

    <Card class="bg-slate-900 border-slate-800 shadow-xl">
      <template #content>
        <div class="flex flex-col gap-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="(item, index) in criteria" :key="index" class="flex flex-col bg-slate-800/40 rounded-xl border border-slate-700/50 hover:border-orange-500/30 transition-colors relative group">
              
              <!-- Remove Button (Top Right) -->
              <Button icon="pi pi-times" 
                      @click="removeCriteria(index)" 
                      severity="secondary" 
                      text 
                      rounded
                      size="small" 
                      class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      v-if="criteria.length > 1" />

              <div class="p-4 flex flex-col gap-3">
                 <!-- Inputs Row -->
                 <div class="flex gap-2 items-center pr-6">
                   <Select v-model="item.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" class="flex-1 min-w-[140px]" @keyup.enter="search" />
                   <Select v-model="item.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" class="w-24" @keyup.enter="search" />
                   <InputText v-model="item.value" placeholder="Value" class="flex-1 min-w-[100px]" @keyup.enter="search" />
                 </div>

                 <!-- Action Row (SplitButton or Joiner Label) -->
                 <div class="flex justify-end items-center h-8">
                    <!-- If this is the LAST item, show SplitButton to ADD next -->
                    <div v-if="index === criteria.length - 1" class="flex gap-2">
                        <Button label="Clear" icon="pi pi-filter-slash" @click="clear" severity="secondary" text size="small" />
                        <Button label="Search" icon="pi pi-search" @click="search" :loading="loading" size="small" raised />
                        <SplitButton label="AND" :model="getSplitItems(index)" @click="addCriteria('AND')" size="small" severity="secondary" outlined class="ml-2" />
                    </div>
                    
                    <!-- If NOT the last item, show the joiner (AND/OR) that connects to the NEXT item -->
                    <div v-else class="flex items-center gap-2">
                         <span class="text-xs text-slate-500 font-bold uppercase tracking-widest">{{ item.joiner }}</span>
                         <div class="h-[1px] w-12 bg-slate-700"></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </Card>

    <Card v-if="results.length > 0" class="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
      <template #title><span class="text-white">Results ({{ results.length }})</span></template>
      <template #content>
        <DataTable :value="results" paginator :rows="100" scrollable scrollHeight="600px" tableStyle="min-width: 50rem" class="p-datatable-sm">
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
    
    <div v-else-if="!loading && searched" class="text-center p-12 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
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

const criteria = ref([
  { field: 'symbol', operator: '==', value: '', joiner: 'AND' }
]);

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

const getSplitItems = (index) => [
    {
        label: 'OR',
        command: () => {
             addCriteria('OR');
        }
    }
];

const addCriteria = (joiner = 'AND') => {
  if (criteria.value.length < 5) {
    // Set the joiner of the CURRENT last item
    const lastIdx = criteria.value.length - 1;
    if (lastIdx >= 0) {
        criteria.value[lastIdx].joiner = joiner;
    }
    // Add new blank item
    criteria.value.push({ field: 'close', operator: '>', value: '', joiner: 'AND' });
  }
};

const removeCriteria = (index) => {
  criteria.value.splice(index, 1);
};

const clear = () => {
  criteria.value = [{ field: 'symbol', operator: '==', value: '', joiner: 'AND' }];
  results.value = [];
  searched.value = false;
};

const error = ref(null);

const validate = () => {
    for (const c of criteria.value) {
        if (c.field === 'symbol' && c.value.length > 0 && c.value.length < 2) {
             toast.add({ severity: 'warn', summary: 'Invalid Input', detail: 'Symbol search must have at least 2 characters', life: 3000 });
             return false;
        }
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
