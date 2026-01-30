<template>
  <div class="flex flex-col h-full bg-slate-950 p-6 gap-6">
    <div class="flex justify-between items-center">
      <div class="flex flex-col">
        <h2 class="text-2xl font-bold text-white uppercase tracking-tight">Market Pulse</h2>
        <p class="text-slate-400 text-sm">Lightweight charting with local MongoDB data</p>
      </div>
      <div class="flex gap-3 items-center">
        <Select v-model="selectedSymbol" :options="symbols" placeholder="Select Stock" class="w-48" @change="loadData" />
        
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

        <Button icon="pi pi-refresh" @click="loadData" :loading="loading" severity="secondary" rounded />
      </div>
    </div>

    <!-- Chart Container -->
    <div class="flex-1 min-h-0 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col">
      <div class="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div class="flex items-center gap-6">
          <div v-for="stat in stats" :key="stat.label" class="flex flex-col">
            <span class="text-[10px] text-slate-500 font-bold uppercase">{{ stat.label }}</span>
            <span class="text-sm font-mono" :class="stat.class">{{ stat.value }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
           <span class="text-xs text-slate-500 font-bold mr-2 uppercase">Indicators:</span>
           <div class="flex gap-1">
             <Button 
                v-for="ind in indicators" 
                :key="ind.id" 
                :label="ind.label" 
                size="small" 
                :severity="ind.active ? 'warning' : 'secondary'" 
                text 
                raised
                @click="toggleIndicator(ind)"
             />
           </div>
        </div>
      </div>
      <div ref="chartContainer" class="flex-1 w-full bg-[#0f172a]"></div>
      <!-- Volume/Indicator Pane -->
      <div ref="indicatorContainer" class="h-32 w-full border-t border-slate-800 bg-[#0f172a]" v-show="showBottomPane"></div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue';
import { createChart, CandlestickSeries, LineSeries, HistogramSeries } from 'lightweight-charts';
import Button from 'primevue/button';
import Select from 'primevue/select';
import SelectButton from 'primevue/selectbutton';

const chartContainer = ref(null);
const indicatorContainer = ref(null);
const selectedSymbol = ref('RELIANCE');
const loading = ref(false);
const symbols = ref([]);

const timeframes = [
    { label: '1H', value: '1h' },
    { label: '1D', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '1M', value: '1M' },
    { label: '5M', value: '5M' },
    { label: '1Y', value: '1y' }
];

const selectedTF = ref(timeframes[0]); // Default 1H

const indicators = ref([
  { id: 'sma20', label: 'SMA 20', active: false, color: '#3b82f6', type: 'overlay' },
  { id: 'ema20', label: 'EMA 20', active: false, color: '#10b981', type: 'overlay' },
  { id: 'bb', label: 'Null', active: false, color: '#ec4899', type: 'overlay', name: 'Bollinger Bands' },
  { id: 'rsi', label: 'RSI', active: true, color: '#8b5cf6', type: 'pane' },
  { id: 'macd', label: 'MACD', active: false, color: '#f59e0b', type: 'pane' },
  { id: 'obv', label: 'OBV', active: false, color: '#06b6d4', type: 'pane' }
]);

const stats = ref([
  { label: 'Open', value: '0.00' },
  { label: 'High', value: '0.00' },
  { label: 'Low', value: '0.00' },
  { label: 'Close', value: '0.00', class: 'text-orange-400' },
  { label: 'Vol', value: '0' }
]);

const showBottomPane = ref(true);

let chart, candlestickSeries, indicatorChart;
let overlaySeries = {}; // Store overlay series instances
let paneSeries = {};    // Store bottom pane series instances

const initCharts = () => {
    if (!chartContainer.value) return;

    chart = createChart(chartContainer.value, {
        layout: {
            background: { color: '#0f172a' },
            textColor: '#94a3b8',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
            mode: 1, // Magnet
        },
        timeScale: {
            borderColor: '#1e293b',
            timeVisible: true,
            secondsVisible: false,
        },
    });

    candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
    });

    // Handle Crosshair
    chart.subscribeCrosshairMove(param => {
        if (!param.time || param.point.x < 0 || param.point.y < 0) {
            return;
        }
        const data = param.seriesData.get(candlestickSeries);
        if (data) {
            stats.value[0].value = data.open.toFixed(2);
            stats.value[1].value = data.high.toFixed(2);
            stats.value[2].value = data.low.toFixed(2);
            stats.value[3].value = data.close.toFixed(2);
        }
    });

    // Bottom Pane (Indicator) Chart
    if (indicatorContainer.value) {
        indicatorChart = createChart(indicatorContainer.value, {
            layout: {
                background: { color: '#0f172a' },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { visible: false },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
            },
            timeScale: { visible: false },
            rightPriceScale: {
                scaleMargins: { top: 0.1, bottom: 0.1 },
            }
        });

        // Sync scales
        chart.timeScale().subscribeVisibleTimeRangeChange(() => {
            if (indicatorChart) {
                indicatorChart.timeScale().setVisibleRange(chart.timeScale().getVisibleRange());
            }
        });
    }
};

const setTimeframe = (tf) => {
    selectedTF.value = tf;
    loadData();
};

const loadData = async () => {
  if (loading.value || !candlestickSeries) return;
  loading.value = true;
  try {
    // Calculate From Timestamp based on TF
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

    const res = await fetch(`/api/stocks.json?symbol=${selectedSymbol.value}&from=${fromTime.getTime()}`);
    const rawData = await res.json();
    
    if (!rawData || !Array.isArray(rawData)) {
        console.warn('No data returned for', selectedSymbol.value);
        return;
    }

    const data = rawData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Process unique times and format for Lightweight Charts (seconds timestamp)
    const uniqueTimes = new Set();
    const cdata = [];
    
    for (const d of data) {
        const t = Math.floor(new Date(d.timestamp).getTime() / 1000);
        if (!uniqueTimes.has(t)) {
            uniqueTimes.add(t);
            cdata.push({
                time: t,
                open: d.open,
                high: d.high,
                low: d.low,
                close: d.close,
            });
        }
    }

    if (candlestickSeries) {
        candlestickSeries.setData(cdata);
    }
    
    // Clear existing overlay series
    Object.values(overlaySeries).forEach(s => chart.removeSeries(s));
    overlaySeries = {};
    
    // Clear existing pane series
    Object.values(paneSeries).forEach(s => indicatorChart.removeSeries(s));
    paneSeries = {};

    // Helper to map data
    const mapData = (key) => {
        return data
            .filter(d => d[key] !== undefined)
            .map(d => ({
                time: Math.floor(new Date(d.timestamp).getTime() / 1000),
                value: d[key]
            }));
    };

    // Render Active Indicators
    for (const ind of indicators.value) {
        if (!ind.active) continue;

        if (ind.type === 'overlay') {
            if (ind.id === 'bb') {
                // Bollinger Bands (3 Lines)
                const upper = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 1, title: 'BB Upper' });
                const lower = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 1, title: 'BB Lower' });
                const middle = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 1, lineStyle: 2, title: 'BB Middle' });
                
                upper.setData(mapData('bb_upper'));
                lower.setData(mapData('bb_lower'));
                middle.setData(mapData('bb_middle'));
                
                overlaySeries['bb_upper'] = upper;
                overlaySeries['bb_lower'] = lower;
                overlaySeries['bb_middle'] = middle;
            } else {
                // Simple Overlay (SMA/EMA)
                const series = chart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, title: ind.label });
                series.setData(mapData(ind.id));
                overlaySeries[ind.id] = series;
            }
        } 
        else if (ind.type === 'pane') {
            showBottomPane.value = true;
            
            if (ind.id === 'rsi') {
                const series = indicatorChart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, title: 'RSI' });
                series.setData(mapData('rsi'));
                
                // Add 70/30 lines
                const highLine = indicatorChart.addSeries(LineSeries, { color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1, lineStyle: 2, priceScaleId: 'right' });
                highLine.setData(cdata.map(d => ({ time: d.time, value: 70 })));
                const lowLine = indicatorChart.addSeries(LineSeries, { color: 'rgba(255, 255, 255, 0.3)', lineWidth: 1, lineStyle: 2, priceScaleId: 'right' });
                lowLine.setData(cdata.map(d => ({ time: d.time, value: 30 })));
                
                paneSeries['rsi'] = series;
                paneSeries['rsi_70'] = highLine;
                paneSeries['rsi_30'] = lowLine;
            } 
            else if (ind.id === 'macd') {
                const macdSeries = indicatorChart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 2, title: 'MACD' });
                const signalSeries = indicatorChart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 2, title: 'Signal' });
                const histSeries = indicatorChart.addSeries(HistogramSeries, { color: '#10b981', title: 'Hist' });
                
                macdSeries.setData(mapData('macd_MACD'));
                signalSeries.setData(mapData('macd_signal'));
                histSeries.setData(mapData('macd_histogram'));
                
                paneSeries['macd'] = macdSeries;
                paneSeries['macd_sig'] = signalSeries;
                paneSeries['macd_hist'] = histSeries;
            }
            else if (ind.id === 'obv') {
                const series = indicatorChart.addSeries(LineSeries, { color: ind.color, lineWidth: 2, title: 'OBV' });
                series.setData(mapData('obv'));
                paneSeries['obv'] = series;
            }
        }
    }

    chart.timeScale().fitContent();
    if (indicatorChart) indicatorChart.timeScale().fitContent();

    // Stats init
    if (cdata.length > 0) {
        const last = cdata[cdata.length - 1];
        stats.value[0].value = last.open.toFixed(2);
        stats.value[1].value = last.high.toFixed(2);
        stats.value[2].value = last.low.toFixed(2);
        stats.value[3].value = last.close.toFixed(2);
    }

  } catch (err) {
    console.error('Failed to load chart data:', err);
  } finally {
    loading.value = false;
  }
};

const toggleIndicator = (ind) => {
    // Enforce mutually exclusive bottom pane
    if (ind.type === 'pane') {
        indicators.value.forEach(i => {
            if (i.type === 'pane' && i.id !== ind.id) i.active = false;
        });
        showBottomPane.value = true;
    }
    
    const wasActive = ind.active;
    ind.active = !wasActive;
    
    // If turning off last pane indicator, hide pane
    if (ind.type === 'pane' && !ind.active) {
         showBottomPane.value = false;
    }

    loadData();
};

const fetchSymbols = async () => {
    try {
        const res = await fetch('/api/symbols.json');
        symbols.value = await res.json();
    } catch (err) {
        console.error(err);
    }
};

const handleResize = () => {
    if (chart && chartContainer.value) {
        chart.applyOptions({ width: chartContainer.value.clientWidth, height: chartContainer.value.clientHeight });
        if (indicatorChart && indicatorContainer.value) {
            indicatorChart.applyOptions({ width: indicatorContainer.value.clientWidth, height: indicatorContainer.value.clientHeight });
        }
    }
};

onMounted(async () => {
    try {
        await fetchSymbols();
        await nextTick();
        initCharts();
        window.addEventListener('resize', handleResize);
        if (selectedSymbol.value) {
            await loadData();
        }
    } catch (err) {
        console.error('Error during Market Pulse initialization:', err);
    }
});

onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    if (chart) chart.remove();
    if (indicatorChart) indicatorChart.remove();
});
</script>

<style scoped>
.tradingview-widget-container {
    height: 100%;
}
</style>
