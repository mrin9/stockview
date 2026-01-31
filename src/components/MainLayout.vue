<template>
  <div class="avalon-layout min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">A</div>
        <h1 class="text-xl font-bold tracking-tight text-white uppercase italic">Avalon</h1>
      </div>

      <nav class="flex-1 px-4 py-4 space-y-1">
        <div class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">Dashboards</div>
        <a 
          v-for="item in menuItems" 
          :key="item.id"
          @click="changeView(item.id)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
          :class="isActive(item.id) ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
        >
          <i :class="[item.icon, 'text-lg']"></i>
          <span class="font-medium">{{ item.label }}</span>
        </a>
      </nav>

      <div class="p-4 mt-auto">
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700">
          <div class="text-xs text-orange-400 font-bold mb-1">PRO PLAN</div>
          <div class="text-sm text-slate-300">Upgrade for more indicators</div>
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="h-16 bg-slate-900/50 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6 z-10">
        <div class="flex items-center gap-4 flex-1">
          <Button icon="pi pi-bars" text severity="secondary" class="lg:hidden" />
          <div class="relative w-full max-w-md group">
             <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
             <AutoComplete 
                v-model="selectedSearchItem" 
                :suggestions="filteredSymbols" 
                @complete="searchSymbols" 
                placeholder="Search stocks..."
                @item-select="onStockSelect"
                class="w-full custom-autocomplete"
                inputClass="w-full !bg-slate-800 !border-none !rounded-lg !pl-10 !pr-4 !py-2 !text-sm !text-slate-200 focus:!ring-1 focus:!ring-orange-500 !shadow-none"
             >
                <template #option="slotProps">
                    <div class="flex items-center gap-2">
                        <span class="font-bold text-slate-200">{{ slotProps.option }}</span>
                    </div>
                </template>
             </AutoComplete>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button icon="pi pi-bell" text severity="secondary" rounded />
          <Button icon="pi pi-cog" text severity="secondary" rounded />
          <div class="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div class="text-right">
              <div class="text-xs font-bold text-white leading-tight">M. Rin</div>
              <div class="text-xs text-slate-500 uppercase font-bold">Analyst</div>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 p-[1px]">
               <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                  <i class="pi pi-user text-slate-400"></i>
               </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Body -->
      <main class="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar relative">
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" v-bind="componentProps" />
        </transition>
      </main>

      <!-- Footer -->
      <footer class="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500">
        <div>© 2026 Avalon Stock Analytics. NSE Data.</div>
        <div class="flex gap-4">
          <a href="#" class="hover:text-slate-300">Terms</a>
          <a href="#" class="hover:text-slate-300">Privacy</a>
          <a href="#" class="hover:text-slate-300">Support</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Button from 'primevue/button';
import AutoComplete from 'primevue/autocomplete';
import TimelineView from './pages/TimelineView.vue';
import FilterView from './pages/FilterView.vue';
import MarketPulseView from './pages/MarketPulseView.vue';
import StockDetailView from './pages/StockDetailView.vue';

const currentView = ref('timeline');
const selectedSymbol = ref(null);
const selectedSearchItem = ref(null);
const allSymbols = ref([]);
const filteredSymbols = ref([]);

const menuItems = [
  { id: 'timeline', label: 'Timeline View', icon: 'pi pi-chart-line' },
  { id: 'search', label: 'Advanced Search', icon: 'pi pi-filter' },
  { id: 'settings', label: 'Market Pulse', icon: 'pi pi-bolt' },
  { id: 'tasks', label: 'Analysis Tasks', icon: 'pi pi-list' }
];

onMounted(async () => {
    try {
        const res = await fetch('/api/symbols.json');
        if (res.ok) {
            allSymbols.value = await res.json();
        }
    } catch (e) {
        console.error('Failed to load symbols for search', e);
    }
});

function searchSymbols(event) {
    if (!event.query.trim()) {
        filteredSymbols.value = [];
        return;
    }
    const query = event.query.toUpperCase();
    filteredSymbols.value = allSymbols.value.filter(s => s.includes(query)).slice(0, 10);
}

function onStockSelect(event) {
    const symbol = event.value;
    if (symbol) {
        selectedSymbol.value = symbol;
        currentView.value = 'stock-detail';
        selectedSearchItem.value = ''; // Clear search
    }
}

function changeView(id) {
    currentView.value = id;
    if (id !== 'stock-detail') {
        selectedSymbol.value = null; 
    }
}

function isActive(id) {
    if (id === 'stock-detail') return false; 
    return currentView.value === id;
}

const activeComponent = computed(() => {
  switch (currentView.value) {
    case 'timeline': return TimelineView;
    case 'search': return FilterView;
    case 'settings': return MarketPulseView;
    case 'stock-detail': return StockDetailView;
    default: return TimelineView;
  }
});

const componentProps = computed(() => {
    if (currentView.value === 'stock-detail') {
        return { symbol: selectedSymbol.value };
    }
    return {};
});
</script>

<style>
.avalon-layout {
  --sidebar-width: 16rem;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Force PrimeVue into Dark Mode Style Override */
.p-card {
  --p-card-background: #0f172a !important; /* slate-900 */
  --p-card-color: #f1f5f9 !important;
  border: 1px solid #1e293b !important; /* slate-800 */
}

.p-datatable {
  --p-datatable-header-background: transparent !important;
  --p-datatable-row-background: transparent !important;
  --p-datatable-row-hover-background: #1e293b !important;
  --p-datatable-text-color: #cbd5e1 !important;
}
.p-datatable .p-column-header-content {
    color: #94a3b8 !important;   
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
.p-datatable .p-datatable-tbody > tr > td {
    border-color: #1e293b !important;
}

.p-autocomplete {
    width: 100%;
}
.p-autocomplete-panel {
    background: #1e293b !important;
    border: 1px solid #334155 !important;
    color: #e2e8f0 !important;
}
.p-autocomplete-option {
    color: #e2e8f0 !important;
}
.p-autocomplete-option:hover, .p-autocomplete-option[data-p-focused="true"] {
    background: #334155 !important;
    color: #f8fafc !important;
}
</style>
