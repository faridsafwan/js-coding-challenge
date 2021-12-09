<template>
  <div class="home">
    <input
      class="input-search"
      type="search"
      placeholder="Search by Name, Region, Capital"
      @input="onInput($event.target.value)"
    />
    <button class="show-btn" @click="getSelectedRows()">
      <CloseThick style="margin-top: 2px"></CloseThick> Show Chart
    </button>
    <button
      class="clear-btn"
      @click="clearSelected()"
      v-if="selectedCountries.length > 0"
    >
      <CloseThick style="margin-top: 2px"></CloseThick> Clear selected countries
    </button>
    <div class="main-content">
      <div class="col-table col-content">
        <ag-grid-vue
          :style="{ width: tableWidth }"
          style="height: 600px"
          class="ag-theme-alpine center"
          :columnDefs="columnDefs"
          :rowData="rowData"
          rowSelection="multiple"
          @grid-ready="onGridReady"
          :pagination="true"
        >
        </ag-grid-vue>
      </div>
      <v-chart
        v-if="selectedCountries.length > 0"
        class="col-content"
        :option="option"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { AgGridVue } from "ag-grid-vue3";
import axios from "axios";
import { computed, defineComponent, onMounted, ref, watch } from "vue";

export default defineComponent({
  name: "Home",
  components: {
    AgGridVue,
  },

  setup() {
    /* ------------------------------ 1. Fetch Data ----------------------------- */
    const countries = ref([]);
    const getCountries = async () => {
      try {
        const response = await axios.get(
          "all?fields=name,capital,flags,region,population"
        );
        rowData.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    /* -------------------------------- 2. Table -------------------------------- */
    const tableWidth = computed(() => {
      return selectedCountries.value.length > 0 ? "100%" : "70%";
    });

    const selectedCountries = ref([]);
    const clearSelected = () => {
      selectedCountries.value = [];
      gridApi.value.deselectAll();
    };

    /* -------------------------- 8. Storage mechanisms ------------------------- */
    onMounted(() => {
      console.log("Component is mounted!");
      getCountries();
      if (localStorage.favorites) {
        selectedCountries.value = JSON.parse(
          localStorage.getItem("favorites") || "{}"
        );
      }
    });

    watch(selectedCountries, () => {
      localStorage.setItem(
        "favorites",
        JSON.stringify(selectedCountries.value)
      );
    });

    /* ------------------------------ 9. Bonus Task ----------------------------- */
    const countriesName = computed(() => {
      let a = [];
      if (selectedCountries.value.length > 0) {
        a = JSON.parse(JSON.stringify(selectedCountries.value));
      }
      return a.map((e: { name: { common: string } }) => e.name.common);
    });

    const countriesPopulation = computed(() => {
      let a = [];
      if (selectedCountries.value.length > 0) {
        a = JSON.parse(JSON.stringify(selectedCountries.value));
      }
      return a.map((e: { population: string }) => e.population);
    });

    const option = ref({
      title: {
        text: "World Total Population",
        left: "center",
      },
      color: ["#42b983"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: ["Population"],
        top: "5%",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
        boundaryGap: [0, 0.01],
      },
      yAxis: {
        type: "category",
        data: countriesName,
      },
      series: [
        {
          name: "Population",
          type: "bar",
          data: countriesPopulation,
        },
      ],
    });

    /* -------------------------------- AG Table -------------------------------- */
    const gridApi = ref();
    const columnApi = ref();
    const rowData = ref([]);

    const flagCellRenderer = (params: { data: { flags: { svg: string } } }) => {
      var flag =
        '<img border="0" width="25" height="20" src="' +
        params.data.flags.svg +
        '">';
      return '<span style="cursor: default;">' + flag + "</span>";
    };
    const columnDefs = [
      {
        field: "",
        filter: true,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        suppressMenu: true,
        maxWidth: 70,
      },
      {
        field: "No",
        filter: true,
        suppressMenu: true,
        maxWidth: 70,
        cellStyle: { textAlign: "left" },
        valueGetter: "node.rowIndex + 1",
      },
      {
        headerName: "Name",
        field: "name.common",
        sortable: true,
        filter: true,
        minWidth: 120,
        cellStyle: { textAlign: "left" },
      },
      {
        field: "region",
        sortable: true,
        filter: true,
        cellStyle: { textAlign: "left" },
      },
      {
        field: "capital",
        sortable: true,
        filter: true,
        cellStyle: { textAlign: "left" },
      },
      {
        headerName: "Flag",
        field: "flags",
        cellRenderer: flagCellRenderer,
        cellStyle: { textAlign: "left" },
      },
    ];

    const onGridReady = (params: { api: never; columnApi: never }) => {
      gridApi.value = params.api;
      columnApi.value = params.columnApi;
      gridApi.value.sizeColumnsToFit();
    };
    const onInput = (search: string) => {
      gridApi.value.setQuickFilter(search);
    };
    const getSelectedRows = () => {
      const selectedNodes = gridApi.value.getSelectedNodes();
      const selectedData = selectedNodes.map(
        (node: { data: never }) => node.data
      );
      selectedCountries.value = selectedData;
    };

    return {
      columnDefs,
      rowData,
      gridApi: null,
      columnApi: null,
      onGridReady,
      getSelectedRows,
      countries,
      onInput,
      selectedCountries,
      option,
      tableWidth,
      clearSelected,
    };
  },
});
</script>

<style lang="scss" scoped>
@import "../../node_modules/ag-grid-community/dist/styles/ag-grid.css";
@import "../../node_modules/ag-grid-community/dist/styles/ag-theme-alpine.css";

.center {
  margin-left: auto;
  margin-right: auto;
}
.main-content {
  display: flex;
  margin: 20px 50px;
  height: 600px;
}
.col-content {
  flex: 1;
}
.col-table {
  overflow: auto;
}
input[type="search"] {
  width: 20%;
  height: 40px;
  -webkit-transition: width 0.4s ease-in-out;
  transition: width 0.4s ease-in-out;
}

/* When the input field gets focus, change its width to 25% */
input[type="search"]:focus {
  width: 25%;
}

.clear-btn {
  background-color: red;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
  margin-left: 20px;
}

.show-btn {
  background-color: #42b983;
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 16px;
  margin-left: 20px;
}

.clear-btn:hover,
.show-btn:hover {
  opacity: 0.7;
}
</style>
