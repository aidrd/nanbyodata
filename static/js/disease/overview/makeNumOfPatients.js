export function makeNumOfPatients(entryData) {
  const targetDiv = document.getElementById('temp-num-of-patients');
  const chartTypeSelect = document.getElementById('num-of-patients-graph');
  const selectedChartType = chartTypeSelect ? chartTypeSelect.value : 'line';

  if (targetDiv) {
    targetDiv.innerHTML = ''; // Clear existing chart

    let chartElement;
    if (selectedChartType === 'bar') {
      // Create Bar Chart
      chartElement = document.createElement('togostanza-barchart');
      chartElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/takatsuki_test_20240322?nando_id=${entryData.nando_id}`
      );
      chartElement.setAttribute('data-type', 'json');
      chartElement.setAttribute('category', 'year');
      chartElement.setAttribute('value', 'num_of_patients');
      chartElement.setAttribute('category-title', 'Year');
      chartElement.setAttribute('value-title', 'Num of Patients');
      chartElement.setAttribute('chart-type', 'stacked');
      chartElement.setAttribute('width', '900');
      chartElement.setAttribute('height', '600');
      chartElement.setAttribute('legend', 'true');
      chartElement.setAttribute('xaxis-placement', 'bottom');
      chartElement.setAttribute('yaxis-placement', 'left');
      chartElement.setAttribute('xlabel-padding', '10');
      chartElement.setAttribute('ylabel-padding', '5');
      chartElement.setAttribute('xlabel-alignment', 'center');
      chartElement.setAttribute('ylabel-alignment', 'right');

      chartElement.setAttribute('padding-inner', '.8');
      chartElement.setAttribute('padding-outer', '.5');
      chartElement.setAttribute('bar-width', '0.8');
      chartElement.setAttribute('legend-title', 'Categories');
      chartElement.setAttribute('xgrid', 'false');
      chartElement.setAttribute('ygrid', 'true');
      chartElement.setAttribute('xtick', 'false');
      chartElement.setAttribute('ytick', 'true');
      chartElement.setAttribute('xlabel-max-width', '200');
      chartElement.setAttribute('ylabel-max-width', '200');
      chartElement.setAttribute('xlabel-alignment', 'center');
      chartElement.setAttribute('ylabel-alignment', 'right');
      // Apply custom styles
      chartElement.style.setProperty('--togostanza-series-0-color', '#29697a');
      chartElement.style.setProperty('--togostanza-label-font-size', '14');
    } else {
      // Create Line Chart
      chartElement = document.createElement('togostanza-linechart');
      chartElement.setAttribute(
        'data-url',
        `https://dev-nanbyodata.dbcls.jp/sparqlist/api/takatsuki_test_20240322?nando_id=${entryData.nando_id}`
      );
      chartElement.setAttribute('data-type', 'json');
      chartElement.setAttribute('axis-x-key', 'year');
      chartElement.setAttribute('axis-x-scale', 'ordinal');
      chartElement.setAttribute('axis-x-placement', 'bottom');
      chartElement.setAttribute('axis-x-title', 'Year');
      chartElement.setAttribute('axis-x-title_padding', '40');
      chartElement.setAttribute('axis-x-ticks_label_angle', '0');
      chartElement.setAttribute('axis-y-key', 'num_of_patients');
      chartElement.setAttribute('axis-y-scale', 'linear');
      chartElement.setAttribute('axis-y-placement', 'left');
      chartElement.setAttribute('axis-y-title', 'Num of Patients');
      chartElement.setAttribute('axis-y-title_padding', '50');
      chartElement.setAttribute('axis-y-ticks_label_angle', '0');
      chartElement.setAttribute('point_size', '10');
      chartElement.setAttribute('legend-title', 'Year');
      chartElement.setAttribute('tooltips-key', 'num_of_patients');
      chartElement.setAttribute('grouping-key', 'group');
      chartElement.style.setProperty(
        '--togostanza-theme-series_0_color',
        '#29697a'
      );
      chartElement.style.setProperty(
        '-togostanza-fonts-font_size_primary',
        '14'
      );
      chartElement.style.setProperty(
        '--togostanza-fonts-font_size_secondary',
        '14'
      );

      // Apply custom styles for line chart
      chartElement.style.setProperty('--togostanza-canvas-height', '600');
      chartElement.style.setProperty('--togostanza-canvas-width', '1000');
    }

    // Create and add the script dynamically
    const scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    if (selectedChartType === 'bar') {
      scriptElement.src = `https://togostanza.github.io/metastanza/barchart.js`;
    } else {
      scriptElement.src = `https://togostanza.github.io/metastanza-devel/linechart.js`;
    }
    scriptElement.async = true;

    // Add chart and script to targetDiv
    targetDiv.appendChild(chartElement);
    targetDiv.appendChild(scriptElement);
  }
}
