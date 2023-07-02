let controller = new AbortController()

function start () {
  listenForStop()
  const { signal } = controller
  download(signal)
  plot(signal)
  search(signal)
}

function listenForStop () {
  const stop = document.getElementById('Stop')
  stop.addEventListener('click', () => { controller.abort() })
}

async function download (signal) {
  const bar = document.getElementById('Download')
  let value = 0
  try {
    while (value < 100) {
      await sleepRandom(200, 600, signal)
      value += 0.5
      bar.value = value
    }
  } catch (error) {
    if (error.name !== 'AbortError') throw error
  }
  if (signal.aborted) {
    const caption = document.getElementById('DownloadCaption')
    caption.innerHTML =
      `(Canceled) <span class="fade">${caption.innerText}</span>`
  }
}

async function plot (signal) {
  const chart = new Chart(document.getElementById('Plot'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: '2020',
        data: []
      }, {
        label: '2021',
        data: []
      }, {
        label: '2022',
        data: []
      }]
    },
    options: {
      responsive: true
    }
  })
  let total = 0
  try {
    while (total < 1000) {
      await sleepRandom(200, 600, signal)
      const count = random(1, 5)
      const points = new Array(count)
      for (let i = 0; i < count; i++) {
        const point = {
          x: weightedRandom() / 100,
          y: weightedRandom() / 100
        }
        points[i] = point
      }
      const dataset = chart.data.datasets[random(0, 2)]
      dataset.data.push(...points)
      total += count
      chart.update()
    }
  } catch (error) {
    if (error.name !== 'AbortError') throw error
  }
  if (signal.aborted) {
    const caption = document.getElementById('PlotCaption')
    caption.innerHTML =
      `(Canceled) <span class="fade">${caption.innerText}</span>`
  }
}

const documents = [
  'DetailedReport2020.xlsx',
  'DetailedReport2021.xlsx',
  'DetailedReport2022.xlsx',
  'ExecutiveSummary2020.pdf',
  'ExecutiveSummary2021.pdf',
  'ExecutiveSummary2022.pdf'
]

async function search (signal) {
  const results = document.getElementById('SearchResults')
  try {
    while (documents.length) {
      await sleepRandom(200, 600, signal)
      const found = random(1, 5)
      if (found !== 1) continue
      const index = random(0, documents.length - 1)
      const name = documents[index]
      documents.splice(index, 1)
      const item = document.createElement('div')
      item.innerText = name
      results.appendChild(item)
    }
  } catch (error) {
    if (error.name !== 'AbortError') throw error
  }
  const spinner = document.getElementById('SearchSpinner')
  spinner.style.display = 'none'
  if (signal.aborted) {
    const caption = document.getElementById('SearchCaption')
    caption.innerHTML =
      `(Canceled) <span class="fade">${caption.innerText}</span>`
  }
}

function sleep (milliseconds, signal) {
  return new Promise((resolve, reject) => {
    function aborted (event) {
      // The rest of my app doesn't need this, stop the event for efficiency
      event.stopImmediatePropagation()
      reject(signal.reason)
    }
    signal.addEventListener('abort', aborted)
    setTimeout(() => {
      signal.removeEventListener('abort', aborted)
      resolve()
    }, milliseconds)
  })
}

function sleepRandom (lower, upper, signal) {
  const milliseconds = random(lower, upper)
  return sleep(milliseconds, signal)
}

function random (lower, upper) {
  return Math.floor(Math.random() * (upper - lower + 1)) + lower
}

const values = new Array(50)
for (let i = 0; i < values.length; i++) values[i] = i * 2
const weights = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  5, 5, 5, 5, 5, 5, 50, 50, 50, 5,
  5, 5, 5, 20, 20, 20, 20, 10, 10, 10,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1
]
const totalWeight = weights.reduce((a, b) => a + b, 0)

function weightedRandom () {
  let random = Math.random() * totalWeight
  return values.find((_, i) => (random -= weights[i]) <= 0)
}

function weightedRandom2 (lower, upper) {
  return Math.round(upper / (Math.random() * upper + lower))
}

document.addEventListener('DOMContentLoaded', start)
