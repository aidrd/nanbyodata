export function makeNumOfPatients(entryData) {
  const targetDiv = document.getElementById('temp-num-of-patients');
  const chartTypeSelect = document.getElementById('num-of-patients-graph');
  const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'line';

  if (targetDiv) {
    // Clear existing chart and script
    targetDiv.innerHTML = '';

    const chartSrc =
      selectedChartType === 'bar'
        ? 'https://togostanza.github.io/metastanza/barchart.js'
        : 'https://togostanza.github.io/metastanza-devel/linechart.js';

    const chartHtml = `
      <${
        selectedChartType === 'bar'
          ? 'togostanza-barchart'
          : 'togostanza-linechart'
      }
        data-url="https://dev-nanbyodata.dbcls.jp/sparqlist/api/takatsuki_test_20240322?nando_id=${
          entryData.nando_id
        }"
        ${
          selectedChartType === 'bar'
            ? `
            data-type="json"
            category="year"
            value="num_of_patients"
            category-title="Year"
            value-title="Num of Patients"
            chart-type="stacked"
            width="900"
            height="400"
            legend="true"
            xaxis-placement="bottom"
            yaxis-placement="left"
            xlabel-padding="10"
            ylabel-padding="5"
            xlabel-alignment="center"
            ylabel-alignment="right"
            padding-inner=".8"
            padding-outer=".5"
            bar-width="0.8"
            legend-title="Categories"
            xgrid="false"
            ygrid="true"
            xtick="false"
            ytick="true"
            xlabel-max-width="200"
            ylabel-max-width="200"
          `
            : `
            data-type="json"
            axis-x-key="year"
            axis-x-scale="ordinal"
            axis-x-placement="bottom"
            axis-x-title="Year"
            axis-x-title_padding="40"
            axis-x-ticks_label_angle="0"
            axis-y-key="num_of_patients"
            axis-y-scale="linear"
            axis-y-placement="left"
            axis-y-title="Num of Patients"
            axis-y-title_padding="50"
            axis-y-ticks_label_angle="0"
            point_size="10"
            legend-title="Year"
            tooltips-key="num_of_patients"
            grouping-key="group"
          `
        }
        style="
          --togostanza-series-0-color: #29697a;
          --togostanza-label-font-size: 14;
          ${
            selectedChartType === 'line'
              ? `
            --togostanza-canvas-height: 400;
            --togostanza-canvas-width: 1000;
            --togostanza-fonts-font_size_primary: 14;
            --togostanza-fonts-font_size_secondary: 14;
          `
              : ''
          }
      "></${
        selectedChartType === 'bar'
          ? 'togostanza-barchart'
          : 'togostanza-linechart'
      }>
    `;

    targetDiv.innerHTML = chartHtml;

    // Create and add the script dynamically
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    scriptElement.src = chartSrc;
    scriptElement.async = true;

    // Add the script to the targetDiv
    targetDiv.appendChild(scriptElement);
  }
}
