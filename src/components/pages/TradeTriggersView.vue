<template>
  <div class="flex flex-col gap-4 p-4">
    <Toast />
    <ConfirmDialog />

    <div class="flex justify-between items-center text-white">
      <div>
        <h2 class="text-lg font-bold uppercase tracking-tight">Trade Triggers</h2>
        <p class="text-slate-400 text-sm">Automate your trades based on technical criteria</p>
      </div>
      <Button label="Create New Trigger" icon="pi pi-plus" @click="showCreateDialog = true" size="small" raised />
    </div>

    <!-- Triggers Table -->
    <Card class="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
      <template #content>
        <DataTable :value="triggers" :loading="loading" stripedRows tableStyle="min-width: 50rem" class="p-datatable-sm">
          <Column field="triggerId" header="ID" class="text-xs text-slate-500 font-mono">
            <template #body="slotProps">
              {{ slotProps.data.triggerId.substring(0, 8) }}...
            </template>
          </Column>
          <Column field="createdAt" header="Created" sortable>
            <template #body="slotProps">
              {{ new Date(slotProps.data.createdAt).toLocaleString() }}
            </template>
          </Column>
          <Column field="username" header="Owner">
            <template #body="slotProps">
              <span class="text-orange-400 font-bold text-xs uppercase">{{ slotProps.data.username }}</span>
            </template>
          </Column>
          <Column header="Logic Summary">
            <template #body="slotProps">
              <div class="flex flex-wrap gap-1 text-xs">
                <span v-for="(c, i) in slotProps.data.criteria" :key="i" class="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 border border-slate-700">
                  {{ c.field }} {{ c.operator }} {{ c.value }}
                  <span v-if="i < slotProps.data.criteria.length - 1" class="text-orange-500 font-bold ml-1">{{ c.joiner }}</span>
                </span>
              </div>
            </template>
          </Column>
          <Column header="Settings" class="text-xs">
            <template #body="slotProps">
              <div class="flex flex-col gap-0.5">
                <span>Lifetime: {{ slotProps.data.lifetime.value }} {{ slotProps.data.lifetime.unit }}</span>
                <span>Every {{ slotProps.data.frequency }}m</span>
              </div>
            </template>
          </Column>
          <Column header="Actions" class="text-right">
            <template #body="slotProps">
              <div class="flex gap-1 justify-end">
                <Button icon="pi pi-pencil" severity="secondary" text rounded size="small" @click="editTrigger(slotProps.data)" />
                <Button icon="pi pi-trash" severity="danger" text rounded size="small" @click="confirmDelete(slotProps.data)" />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <!-- Create Modal -->
    <Dialog v-model:visible="showCreateDialog" header="Create Trade Trigger" :style="{ width: '50vw' }" modal class="p-fluid bg-slate-900 border-slate-800">
      <div class="flex flex-col gap-6 p-1">
        
        <!-- Criteria Builder -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Criteria</label>
          <div v-for="(item, index) in newTrigger.criteria" :key="index" class="flex flex-col bg-slate-800/40 p-3 rounded border border-slate-700/50 gap-2 relative group">
            <Button icon="pi pi-times" @click="removeCriteria(newTrigger, index)" severity="secondary" text rounded size="small" class="absolute top-1 right-1" v-if="newTrigger.criteria.length > 1" />
            <div class="flex gap-2 items-center">
              <Select v-model="item.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" size="small" class="flex-1"/>
              <Select v-model="item.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" size="small" class="w-24"/>
              <InputText v-model="item.value" placeholder="Value" size="small" class="flex-1"/>
            </div>
            <div v-if="index === newTrigger.criteria.length - 1" class="flex justify-end gap-2 mt-1">
              <Button label="+ AND" size="small" text @click="addCriteria(newTrigger, 'AND')" />
              <Button label="+ OR" size="small" text @click="addCriteria(newTrigger, 'OR')" />
            </div>
            <div v-else class="text-xs text-orange-500 font-bold uppercase text-right">{{ item.joiner }}</div>
          </div>
        </div>

        <!-- Lifetime & Frequency -->
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Lifetime</label>
            <div class="flex gap-2">
              <InputNumber v-model="newTrigger.lifetime.value" placeholder="Value" size="small" />
              <Select v-model="newTrigger.lifetime.unit" :options="['HOURS', 'DAYS']" size="small" class="w-28" />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Check Frequency (Mins)</label>
            <InputNumber v-model="newTrigger.frequency" placeholder="E.g. 5" size="small" />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showCreateDialog = false" />
        <Button label="Save Trigger" icon="pi pi-check" @click="saveNewTrigger" />
      </template>
    </Dialog>

    <!-- Edit/View Drawer -->
    <Drawer v-model:visible="showEditDrawer" position="right" :style="{ width: '400px' }" class="p-fluid bg-slate-900 border-l border-slate-800">
      <template #header>
        <span class="text-lg font-bold text-white">Edit Trigger</span>
      </template>
      <div v-if="selectedTrigger" class="flex flex-col gap-6 py-4">
        <div class="text-xs text-slate-500 font-mono mb-2">ID: {{ selectedTrigger.triggerId }}</div>
        
        <!-- Criteria Builder (Edit Mode) -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Criteria</label>
          <div v-for="(item, index) in selectedTrigger.criteria" :key="index" class="flex flex-col bg-slate-800/40 p-3 rounded border border-slate-700/50 gap-2 relative">
            <Button icon="pi pi-times" @click="removeCriteria(selectedTrigger, index)" severity="secondary" text rounded size="small" class="absolute top-1 right-1" v-if="selectedTrigger.criteria.length > 1" />
            <div class="flex gap-2 items-center">
              <Select v-model="item.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" size="small" class="flex-1"/>
              <Select v-model="item.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" size="small" class="w-16"/>
              <InputText v-model="item.value" placeholder="Value" size="small" class="flex-1"/>
            </div>
            <div v-if="index === selectedTrigger.criteria.length - 1" class="flex justify-end gap-2 mt-1">
              <Button label="+ AND" size="small" text @click="addCriteria(selectedTrigger, 'AND')" />
              <Button label="+ OR" size="small" text @click="addCriteria(selectedTrigger, 'OR')" />
            </div>
            <div v-else class="text-xs text-orange-500 font-bold uppercase text-right">{{ item.joiner }}</div>
          </div>
        </div>

        <!-- Configuration -->
        <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Lifetime</label>
            <div class="flex gap-2">
              <InputNumber v-model="selectedTrigger.lifetime.value" size="small" />
              <Select v-model="selectedTrigger.lifetime.unit" :options="['HOURS', 'DAYS']" size="small" class="w-28" />
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Check Frequency (Mins)</label>
            <InputNumber v-model="selectedTrigger.frequency" size="small" />
        </div>

        <div class="mt-8 flex gap-2">
            <Button label="Cancel" severity="secondary" text @click="showEditDrawer = false" class="flex-1"/>
            <Button label="Update" icon="pi pi-save" @click="updateTrigger" class="flex-1"/>
        </div>
      </div>
    </Drawer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Card from 'primevue/card';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import ConfirmDialog from 'primevue/confirmdialog';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();

const triggers = ref([]);
const loading = ref(false);
const showCreateDialog = ref(false);
const showEditDrawer = ref(false);
const selectedTrigger = ref(null);

const newTrigger = ref({
  criteria: [{ field: 'symbol', operator: '==', value: '', joiner: 'AND' }],
  lifetime: { value: 15, unit: 'DAYS' },
  frequency: 5
});

const fieldOptions = [
  { label: 'Symbol', value: 'symbol' },
  { label: 'RSI', value: 'rsi' },
  { label: 'MACD', value: 'macd_MACD' },
  { label: 'Close Price', value: 'close' },
  { label: 'Volume', value: 'volume' }
];

const loadTriggers = async () => {
  loading.value = true;
  try {
    const res = await fetch('/api/triggers.json');
    triggers.value = await res.json();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load triggers' });
  } finally {
    loading.value = false;
  }
};

const addCriteria = (target, joiner) => {
  const last = target.criteria[target.criteria.length - 1];
  last.joiner = joiner;
  target.criteria.push({ field: 'rsi', operator: '>', value: '', joiner: 'AND' });
};

const removeCriteria = (target, index) => {
  target.criteria.splice(index, 1);
};

const saveNewTrigger = async () => {
  try {
    const res = await fetch('/api/triggers.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrigger.value)
    });
    if (res.ok) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Trigger created' });
      showCreateDialog.value = false;
      // Reset form
      newTrigger.value = {
        criteria: [{ field: 'symbol', operator: '==', value: '', joiner: 'AND' }],
        lifetime: { value: 15, unit: 'DAYS' },
        frequency: 5
      };
      await loadTriggers();
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save trigger' });
  }
};

const editTrigger = (data) => {
  selectedTrigger.value = JSON.parse(JSON.stringify(data)); // Deep clone
  showEditDrawer.value = true;
};

const updateTrigger = async () => {
  try {
    const res = await fetch('/api/triggers.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectedTrigger.value)
    });
    if (res.ok) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Trigger updated' });
      showEditDrawer.value = false;
      await loadTriggers();
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update trigger' });
  }
};

const confirmDelete = (data) => {
  confirm.require({
    message: 'Are you sure you want to delete this trigger?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const res = await fetch(`/api/triggers.json?id=${data._id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.add({ severity: 'success', summary: 'Deleted', detail: 'Trigger removed', life: 3000 });
          await loadTriggers();
        }
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete trigger' });
      }
    }
  });
};

onMounted(loadTriggers);
</script>

<style scoped>
:deep(.p-datatable) {
  --p-datatable-header-background: transparent;
}
</style>
