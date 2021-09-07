<template>
  <div class="home">
    <input
      class="input-search"
      type="search"
      placeholder="Search by Name, Region, Capital"
      @input="onInput($event.target.value)"
    />
    <button
      class="clear-btn"
      @click="clearSelected()"
      v-if="selectedCountries.length > 0"
    >
      <CloseThick style="margin-top: 2px"></CloseThick> Clear selected countries
    </button>
    <div class="main-content">
      <div class="col-table col-content">
        <table class="center" :style="{ width: tableWidth }">
          <tr>
            <th>
              <!-- <input type="checkbox" v-model="selectAll" @click="select()" /> -->
            </th>
            <th style="width: 10%">No</th>
            <th
              style="width: 30%; cursor: pointer"
              v-if="sortName"
              @click="countries.sort(sortTable('name'))"
            >
              Name <SortAlphabeticalAscending></SortAlphabeticalAscending>
            </th>
            <th
              style="width: 30%; cursor: pointer"
              v-else
              @click="countries.sort(sortTable('name'))"
            >
              Name <SortAlphabeticalDescending></SortAlphabeticalDescending>
            </th>
            <th
              style="width: 20%; cursor: pointer"
              v-if="sortRegion"
              @click="countries.sort(sortTable('region'))"
            >
              Region <SortAlphabeticalAscending></SortAlphabeticalAscending>
            </th>
            <th
              style="width: 20%; cursor: pointer"
              v-else
              @click="countries.sort(sortTable('region'))"
            >
              Region <SortAlphabeticalDescending></SortAlphabeticalDescending>
            </th>
            <th
              style="width: 20%; cursor: pointer"
              v-if="sortCapital"
              @click="countries.sort(sortTable('capital'))"
            >
              Capital (city)
              <SortAlphabeticalAscending></SortAlphabeticalAscending>
            </th>
            <th
              style="width: 20%; cursor: pointer"
              v-else
              @click="countries.sort(sortTable('capital'))"
            >
              Capital (city)
              <SortAlphabeticalDescending></SortAlphabeticalDescending>
            </th>
            <th style="width: 30%">Flag</th>
          </tr>
          <tr v-for="(country, index) in filteredRows" :key="country">
            <td>
              <label class="form-checkbox">
                <input
                  type="checkbox"
                  :value="country"
                  v-model="selectedCountries"
                />
                <i class="form-icon"></i>
              </label>
            </td>
            <td>{{ index + 1 }}</td>
            <td v-html="stringHighlight(country.name)"></td>
            <td v-html="stringHighlight(country.region)"></td>
            <td v-html="stringHighlight(country.capital)"></td>
            <td>
              <img
                style="width: 100px"
                :src="country.flag"
                :alt="country.name"
              />
            </td>
          </tr>
        </table>
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
import axios from "axios";
import { computed, defineComponent, onMounted, ref, watch } from "vue";
import {
  SortAlphabeticalAscending,
  SortAlphabeticalDescending,
  CloseThick,
} from "mdue";

export default defineComponent({
  name: "Home",
  components: {
    SortAlphabeticalAscending,
    SortAlphabeticalDescending,
    CloseThick,
  },

  setup() {
    /* ------------------------------ 1. Fetch Data ----------------------------- */
    const countries = ref([]);
    const getTutorial = async () => {
      try {
        const response = await axios.get("rest/v2/all");
        countries.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    /* -------------------------------- 2. Table -------------------------------- */
    const tableWidth = computed(() => {
      return selectedCountries.value.length > 0 ? "100%" : "70%";
    });

    /* ------------------------------- 3. Sorting ------------------------------- */
    let sortName = ref(true);
    let sortRegion = ref(true);
    let sortCapital = ref(true);
    let filter = ref("");
    const sortTable = (key: string) => {
      let asc: boolean;
      if (key === "name") {
        asc = sortName.value = !sortName.value;
      } else if (key === "region") {
        asc = sortRegion.value = !sortRegion.value;
      } else {
        asc = sortCapital.value = !sortCapital.value;
      }
      return function innerSort(
        a: { [x: string]: string },
        b: { [x: string]: string }
      ) {
        const varA = a[key].toUpperCase();
        const varB = b[key].toUpperCase();
        let comparison = 0;
        if (varA > varB) {
          comparison = 1;
        } else if (varA < varB) {
          comparison = -1;
        }
        return asc ? comparison : comparison * -1;
      };
    };

    /* ------------------------------ 5. Filtering ------------------------------ */
    const debounce = (fn: (arg0: never) => void, delay: number | undefined) => {
      let timeout: number | undefined;
      return (args: never) => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          fn(args);
        }, delay);
      };
    };

    const onInput = debounce((search) => {
      filter.value = search;
    }, 500);
    const filteredRows = computed(() => {
      return countries.value.filter(
        (row: { name: string; region: string; capital: string }) => {
          const name = row.name.toLowerCase();
          const region = row.region.toLowerCase();
          const capital = row.capital.toLowerCase();

          const searchTerm = filter.value.toLowerCase();

          return (
            name.includes(searchTerm) ||
            region.includes(searchTerm) ||
            capital.includes(searchTerm)
          );
        }
      );
    });

    /* ---------------------------- 6. Row Selection ---------------------------- */
    const selectedCountries = ref([]);
    const selectAll = ref(false);
    const select = () => {
      selectedCountries.value = [];
      if (!selectAll.value) {
        selectedCountries.value = countries.value;
      }
    };
    const clearSelected = () => {
      selectedCountries.value = [];
      selectAll.value = false;
    };

    /* --------------------------- 7. String Higlight --------------------------- */
    const stringHighlight = (text: string) => {
      const matchExists = text
        .toLowerCase()
        .includes(filter.value.toLowerCase());
      if (!matchExists) return text;
      const re = new RegExp(filter.value, "ig");
      return text.replace(
        re,
        (matchedText: string) =>
          `<span style='background-color:#42b983'>${matchedText}</span>`
      );
    };

    /* -------------------------- 8. Storage mechanisms ------------------------- */
    onMounted(() => {
      console.log("Component is mounted!");
      getTutorial();
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
      return a.map((e: { name: string }) => e.name);
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

    return {
      countries,
      sortTable,
      sortName,
      sortRegion,
      sortCapital,
      onInput,
      filter,
      filteredRows,
      stringHighlight,
      selectedCountries,
      selectAll,
      select,
      option,
      tableWidth,
      clearSelected,
    };
  },
});
</script>

<style scoped>
.center {
  margin-left: auto;
  margin-right: auto;
}
.main-content {
  display: flex;
  margin: 50px;
  height: 550px;
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

.clear-btn:hover {
  opacity: 0.7;
}
</style>
