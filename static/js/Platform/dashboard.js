let chart, activeUsersChart, serviceUsageChart, ageDistributionChart;

//===================================서비스별 구독자 추이=======================================//

async function getServices() {
  try {
    const response = await axios.get('/dashboard/api/services');
    return response.data;
  } catch (error) {
    console.error('서비스 목록을 가져오는 데 실패했습니다:', error);
    return [];
  }
}

async function getSubscriptionData(serviceName, days = 30) {
  try {
    const response = await axios.get('/dashboard/api/subscription-data', {
      params: { serviceName, days }
    });
    return response.data;
  } catch (error) {
    console.error('구독 데이터를 가져오는 데 실패했습니다:', error);
    return [];
  }
}

function generateDateRange(days) {
  const dates = [];
  const endDate = new Date(); // 현재 날짜를 사용
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
}


function processChartData(data, days) {
  const dateRange = generateDateRange(days);
  return dateRange.map(date => {
    const dayData = data.find(item => item.date === date) || { active: 0, inactive: 0, canceled: 0 };
    return {
      date,
      active: dayData.active || 0,
      inactive: dayData.inactive || 0,
      canceled: dayData.canceled || 0
    };
  });
}

function drawChart(data, serviceName, days) {
  const ctx = document.getElementById('subscriptionTrendChart').getContext('2d');
  if (chart) {
      chart.destroy();
  }

  const processedData = processChartData(data, days);
  chart = new Chart(ctx, {
      type: 'line',
      data: {
          labels: processedData.map(item => item.date),
          datasets: [
              {
                  label: '활성화 후 구독 취소',
                  data: processedData.map(item => item.canceled),
                  backgroundColor: '#DF0101',
                  borderColor: '#DF0101',
                  fill: true,
                  tension: 0.1
              },
              {
                  label: '구독 비활성화',
                  data: processedData.map(item => item.inactive),
                  backgroundColor: '#6E6E6E',
                  borderColor: '#6E6E6E',
                  fill: true,
                  tension: 0.1
              },
              {
                  label: '구독 활성화',
                  data: processedData.map(item => item.active),
                  backgroundColor: '#F28B30',
                  borderColor: '#F28B30',
                  fill: true,
                  tension: 0.1
              }
          ]
      },
      options: {
          responsive: true,
          plugins: {
              title: {
                  display: true,
                  text: `${serviceName} 구독자 추이 (최근 ${days}일)`
              }
          },
          scales: {
              x: {
                  title: {
                      display: true,
                      text: '날짜'
                  }
              },
              y: {
                  title: {
                      display: true,
                      text: '구독자 수'
                  },
                  beginAtZero: true,
                  ticks: {
                      stepSize: 1,
                      precision: 0
                  }
              }
          }
      }
  });
}

setInterval(async () => {
  await updateChart();
}, 60000); // 1분마다 업데이트

//==========================일일 활성 사용자수 + 일일 활성 서비스 사용량===========================================//

async function getDailyActiveUsers() {
  try {
    const response = await axios.get('/dashboard/api/daily-active-users');
    return response.data;
  } catch (error) {
    console.error('일일 활성 사용자 데이터를 가져오는 데 실패했습니다:', error);
    return null;
  }
}

async function getDailyServiceUsage() {
  try {
    const response = await axios.get('/dashboard/api/daily-service-usage');
    return response.data;
  } catch (error) {
    console.error('일일 서비스 사용량 데이터를 가져오는 데 실패했습니다:', error);
    return [];
  }
}

function drawDailyActiveUsersGraph(data) {
  const ctx = document.getElementById('active-users-graph').getContext('2d');
  if (activeUsersChart) {
      activeUsersChart.destroy();
  }

  const activeUsers = data.active_user_ratio;
  const inactiveUsers = 1 - activeUsers;

  activeUsersChart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ['활성 사용자', '비활성 사용자'],
          datasets: [{
              data: [activeUsers, inactiveUsers],
              backgroundColor: [
                  "#F28B30",
                  "#6E6E6E",
              ],
          }]
      },
      options: {
          responsive: true,
          plugins: {
              title: {
                  display: true,
                  text: '일일 활성 사용자 비율'
              },
              tooltip: {
                  callbacks: {
                      label: function(context) {
                          const label = context.label || '';
                          const value = context.raw;
                          return `${label}: ${(value * 100).toFixed(2)}%`;
                      }
                  }
              }
          }
      }
  });
}

function drawDailyServiceUsageGraph(data) {
  console.log('Received data for daily service usage:', data);  // 로그 추가

  const ctx = document.getElementById('service-usage-graph').getContext('2d');
  if (serviceUsageChart) {
    serviceUsageChart.destroy();
  }

  // 데이터가 없거나 빈 배열인 경우 기본 데이터 사용
  if (!data || data.length === 0) {
    data = [{
      date: '데이터 없음',
      Robot: 0,
      SmartRoutine: 0,
      ProfileIMG: 0
    }];
  }

  const todayData = data[0];  // 오늘의 데이터만 사용

  serviceUsageChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['오늘의 서비스 사용량'],
      datasets: [
        {
          label: 'Robot',
          data: [todayData.Robot],
          backgroundColor: '#F28B30'
        },
        {
          label: 'SmartRoutine',
          data: [todayData.SmartRoutine],
          backgroundColor: '#C00000'
        },
        {
          label: 'ProfileIMG',
          data: [todayData.ProfileIMG],
          backgroundColor: '#4472C4'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '사용량'
          }
        },
        x: {
          title: {
            display: true,
            text: '서비스'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: `오늘(${todayData.date})의 서비스 사용량`
        },
        legend: {
          display: true
        }
      }
    }
  });

  console.log('Chart data:', serviceUsageChart.data);  // 로그 추가
}
//==========================================연령대별 사용자 분포=======================================//
function drawAgeDistributionChart(data) {
  const ctx = document.getElementById('ageDistributionChart').getContext('2d');
  if (ageDistributionChart) {
    ageDistributionChart.destroy();
  }

  // 데이터가 없거나 빈 배열인 경우 기본 데이터 사용
  if (!data || data.length === 0) {
    data = [
      { age_group: '데이터 없음', count: 0 }
    ];
  }

  ageDistributionChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.age_group),
      datasets: [{
        label: '사용자 수',
        data: data.map(item => item.count),
        backgroundColor: '#F28B30'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '사용자 수'
          },
          ticks: {
            stepSize: 1,
            precision: 0
          }
        },
        x: {
          title: {
            display: true,
            text: '연령대'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: '연령대별 사용자 분포'
        },
        legend: {
          display: false
        }
      }
    }
  });
}

function initAgeDistribution() {
  fetch('/dashboard/api/age-distribution')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data.message === "No data available") {
        console.log("No data available for age distribution");
        drawAgeDistributionChart([]); // 빈 데이터로 그래프 그리기
      } else if (Array.isArray(data)) {
        drawAgeDistributionChart(data);
      } else {
        drawAgeDistributionChart(data.distribution);
      }
    })
    .catch(error => {
      console.error('Error fetching age distribution data:', error);
      drawAgeDistributionChart([]); // 에러 발생 시 빈 데이터로 그래프 그리기
    });
}

//==========================================초기화 부분=============================================//

async function init() {
  const serviceSelect = document.getElementById('serviceSelect');
  const services = await getServices();
  services.forEach(service => {
    const option = document.createElement('option');
    option.value = service.ServiceID;
    option.textContent = service.ServiceName;
    serviceSelect.appendChild(option);
  });

  document.getElementById('updateChart').addEventListener('click', updateChart);

  if (services.length > 0) {
    serviceSelect.value = services[0].ServiceID;
    await updateChart();
  }

  await initDailyActiveUsersGraph();
  await initDailyServiceUsageGraph();
  await initAgeDistribution();
}

async function updateChart() {
  const serviceSelect = document.getElementById('serviceSelect');
  const serviceName = serviceSelect.options[serviceSelect.selectedIndex].text;
  const days = parseInt(document.getElementById('daysSelect').value);
  if (!serviceName) {
    alert('서비스를 선택해주세요.');
    return;
  }

  const data = await getSubscriptionData(serviceName, days);
  drawChart(data, serviceName, days);
}

async function initDailyActiveUsersGraph() {
  const data = await getDailyActiveUsers();
  if (data) {
    drawDailyActiveUsersGraph(data);
  } else {
    console.error('활성 사용자 데이터가 없습니다.');
  }
}

async function initDailyServiceUsageGraph() {
  try {
    const data = await getDailyServiceUsage();
    drawDailyServiceUsageGraph(data);  // 데이터의 유무와 관계없이 항상 그래프를 그립니다.
    
    if (data.length === 0) {
      console.warn('서비스 사용량 데이터가 없습니다. 빈 그래프가 표시됩니다.');
    }
  } catch (error) {
    console.error('서비스 사용량 그래프 초기화 중 오류 발생:', error);
    drawDailyServiceUsageGraph([]);  // 오류 발생 시에도 빈 데이터로 그래프를 그립니다.
  }
}

function initAgeDistribution() {
  fetch('/dashboard/api/age-distribution')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new TypeError("Oops, we haven't got JSON!");
      }
      return response.json();
    })
    .then(data => {
      if (data.message === "No data available") {
        console.log("No data available for age distribution");
      } else if (Array.isArray(data)) {
        drawAgeDistributionChart(data);
      } else {
        drawAgeDistributionChart(data.distribution);
      }
    })
    .catch(error => {
      console.error('Error fetching age distribution data:', error);
      const errorMessage = document.createElement('p');
      errorMessage.textContent = `Failed to load age distribution data: ${error.message}`;
      errorMessage.style.color = 'red';
      document.getElementById('ageDistributionChart').parentNode.appendChild(errorMessage);
    });
}

document.addEventListener('DOMContentLoaded', init);