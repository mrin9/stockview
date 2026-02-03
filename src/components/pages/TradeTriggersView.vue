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
    <Dialog v-model:visible="showCreateDialog" header="Create Trade Trigger" :style="{ width: '650px' }" modal class="p-fluid bg-slate-900 border-slate-800">
      <div class="flex flex-col gap-6 p-1">
        
        <!-- Criteria Builder -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Logic Builder</label>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-4 p-4 bg-slate-950/20 border border-slate-800 rounded-lg">
            
            <!-- Existing Logic Pills -->
            <template v-for="(item, index) in newTrigger.criteria" :key="index">
              <div v-if="index > 0" class="text-[10px] font-bold text-slate-600 uppercase px-1 font-mono">{{ newTrigger.criteria[index-1].joiner }}</div>
              
              <div class="relative bg-slate-800 border border-slate-700/50 rounded-md px-2.5 py-1.5 min-w-[80px] flex items-center justify-center group">
                <span class="text-xs text-slate-300 font-mono">{{ getFieldLabel(item.field) }} {{ item.operator }} {{ item.value }}</span>
                <button @click="removeCriteria(newTrigger, index)" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] border border-slate-900 hover:bg-red-600">
                  <i class="pi pi-minus"></i>
                </button>
              </div>
            </template>

            <!-- Active Builder Box -->
            <div class="flex flex-col gap-2 p-3 bg-slate-900 border border-dashed border-slate-700 rounded-md flex-1 min-w-[350px]">
              <div class="flex gap-2 items-center">
                <Select v-model="triggerBuilder.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" size="small" class="flex-1 min-w-[120px]"/>
                <Select v-model="triggerBuilder.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" size="small" class="w-16"/>
                <InputText v-model="triggerBuilder.value" placeholder="Value" size="small" class="flex-1 min-w-[80px]" @keyup.enter="commitTriggerBuilder(newTrigger)"/>
                
                <SelectButton v-model="triggerBuilder.joiner" :options="['AND', 'OR']" :allowEmpty="true" class="joiner-select-button" @change="commitTriggerBuilder(newTrigger)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Lifetime & Frequency -->
        <div class="grid grid-cols-2 gap-4">
          <InputGroup>
            <IftaLabel>
                <InputNumber id="create_frequency" v-model="newTrigger.frequency" placeholder="15" size="small" />
                <label for="create_frequency">Check Frequency</label>
            </IftaLabel>
            <InputGroupAddon>Minutes</InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <IftaLabel>
                <InputNumber id="create_lifetime" v-model="newTrigger.lifetime.value" placeholder="30" size="small" />
                <label for="create_lifetime">Lifetime</label>
            </IftaLabel>
            <InputGroupAddon>Days</InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" icon="pi pi-times" text @click="showCreateDialog = false" />
        <Button label="Save Trigger" icon="pi pi-check" @click="saveNewTrigger" />
      </template>
    </Dialog>

    <!-- Edit/View Drawer -->
    <Drawer v-model:visible="showEditDrawer" position="right" :style="{ width: '500px' }" class="p-fluid bg-slate-900 border-l border-slate-800">
      <template #header>
        <span class="text-lg font-bold text-white">Edit Trigger</span>
      </template>
      <div v-if="selectedTrigger" class="flex flex-col gap-6 py-4">
        <div class="text-xs text-slate-500 font-mono mb-2">ID: {{ selectedTrigger.triggerId }}</div>
        
        <!-- Criteria Builder (Edit Mode) -->
        <div class="flex flex-col gap-3">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Trigger Logic Builder</label>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-4 p-3 bg-slate-950/20 border border-slate-800 rounded-lg">
            
            <!-- Existing Logic Pills -->
            <template v-for="(item, index) in selectedTrigger.criteria" :key="index">
              <div v-if="index > 0" class="text-[10px] font-bold text-slate-600 uppercase px-1 font-mono">{{ selectedTrigger.criteria[index-1].joiner }}</div>
              
              <div class="relative bg-slate-800 border border-slate-700/50 rounded-md px-2.5 py-1.5 min-w-[80px] flex items-center justify-center group">
                <span class="text-xs text-slate-300 font-mono">{{ getFieldLabel(item.field) }} {{ item.operator }} {{ item.value }}</span>
                <button @click="removeCriteria(selectedTrigger, index)" class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] border border-slate-900 hover:bg-red-600">
                  <i class="pi pi-minus"></i>
                </button>
              </div>
            </template>

            <!-- Active Builder Box -->
            <div class="flex flex-col gap-2 p-3 bg-slate-900 border border-dashed border-slate-700 rounded-md flex-1 min-w-[350px]">
              <div class="flex gap-2 items-center">
                <Select v-model="triggerBuilder.field" :options="fieldOptions" optionLabel="label" optionValue="value" placeholder="Field" size="small" class="flex-1 min-w-[120px]"/>
                <Select v-model="triggerBuilder.operator" :options="['==', '>', '<', '>=', '<=', 'contains']" placeholder="Op" size="small" class="w-16"/>
                <InputText v-model="triggerBuilder.value" placeholder="Value" size="small" class="flex-1 min-w-[80px]" @keyup.enter="commitTriggerBuilder(selectedTrigger)"/>
                
                <SelectButton v-model="triggerBuilder.joiner" :options="['AND', 'OR']" :allowEmpty="true" class="joiner-select-button" @change="commitTriggerBuilder(selectedTrigger)" />
              </div>
            </div>
          </div>
        </div>

        <!-- Configuration -->
        <div class="flex flex-col gap-4">
           <InputGroup>
            <IftaLabel>
                <InputNumber id="edit_frequency" v-model="selectedTrigger.frequency" placeholder="15" size="small" />
                <label for="edit_frequency">Check Frequency</label>
            </IftaLabel>
            <InputGroupAddon>Minutes</InputGroupAddon>
          </InputGroup>

          <InputGroup>
            <IftaLabel>
                <InputNumber id="edit_lifetime" v-model="selectedTrigger.lifetime.value" placeholder="30" size="small" />
                <label for="edit_lifetime">Lifetime</label>
            </IftaLabel>
            <InputGroupAddon>Days</InputGroupAddon>
          </InputGroup>
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
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import IftaLabel from 'primevue/iftalabel';
import SelectButton from 'primevue/selectbutton';
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

const triggerBuilder = ref({ field: 'rsi', operator: '>', value: '', joiner: null });

const getInitialTrigger = () => ({
  criteria: [],
  lifetime: { value: 30, unit: 'DAYS' },
  frequency: 15
});

const newTrigger = ref(getInitialTrigger());

const fieldOptions = [
  { label: 'Symbol', value: 'symbol' },
  { label: 'RSI', value: 'rsi' },
  { label: 'MACD', value: 'macd_MACD' },
  { label: 'Close Price', value: 'close' },
  { label: 'Volume', value: 'volume' }
];

const getFieldLabel = (val) => {
    const opt = fieldOptions.find(o => o.value === val);
    return opt ? opt.label : val;
};

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

const commitTriggerBuilder = (target) => {
  if (!triggerBuilder.value.value || !triggerBuilder.value.joiner) {
    return;
  }
  target.criteria.push({ ...triggerBuilder.value });
  // Reset for next
  triggerBuilder.value.value = '';
  triggerBuilder.value.joiner = null; 
};

const removeCriteria = (target, index) => {
  target.criteria.splice(index, 1);
};

const saveNewTrigger = async () => {
  if (triggerBuilder.value.value) {
      commitTriggerBuilder(newTrigger.value);
  }
  
  if (newTrigger.value.criteria.length === 0) {
      toast.add({ severity: 'warn', summary: 'No Logic', detail: 'Add at least one criteria' });
      return;
  }

  try {
    const res = await fetch('/api/triggers.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTrigger.value)
    });
    if (res.ok) {
      toast.add({ severity: 'success', summary: 'Success', detail: 'Trigger created' });
      showCreateDialog.value = false;
      newTrigger.value = getInitialTrigger();
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
:deep(.joiner-select-button .p-button) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    font-weight: bold;
}
:deep(.joiner-select-button) {
    display: inline-flex;
}
</style>
