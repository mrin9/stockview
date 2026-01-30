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
          @click="currentView = item.id"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200"
          :class="currentView === item.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
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
          <div class="relative w-full max-w-md">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Search stocks..." 
              class="w-full bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button icon="pi pi-bell" text severity="secondary" rounded />
          <Button icon="pi pi-cog" text severity="secondary" rounded />
          <div class="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div class="text-right">
              <div class="text-xs font-bold text-white leading-tight">M. Rin</div>
              <div class="text-[10px] text-slate-500 uppercase font-bold">Analyst</div>
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
      <main class="flex-1 overflow-y-auto bg-slate-950 custom-scrollbar">
        <transition name="fade" mode="out-in">
          <component :is="activeComponent" />
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
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import TimelineView from './pages/TimelineView.vue';
import FilterView from './pages/FilterView.vue';
import MarketPulseView from './pages/MarketPulseView.vue';

const currentView = ref('timeline');

const menuItems = [
  { id: 'timeline', label: 'Timeline View', icon: 'pi pi-chart-line' },
  { id: 'search', label: 'Advanced Search', icon: 'pi pi-filter' },
  { id: 'settings', label: 'Market Pulse', icon: 'pi pi-bolt' },
  { id: 'tasks', label: 'Analysis Tasks', icon: 'pi pi-list' }
];

const activeComponent = computed(() => {
  switch (currentView.value) {
    case 'timeline': return TimelineView;
    case 'search': return FilterView;
    case 'settings': return MarketPulseView;
    default: return TimelineView;
  }
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

.p-select, .p-inputtext, .p-selectbutton {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.p-select:hover, .p-inputtext:hover {
  border-color: #f97316 !important; /* orange-500 */
}
</style>
