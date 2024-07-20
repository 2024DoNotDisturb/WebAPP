function sendCommand(cmd) {
  console.log('sendCommand: ' + cmd);
  fetch(`/smarthome/command?cmd=${cmd}`, {
      method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
      console.log('return:', data);
      if (cmd === 'C_Kit_HT') {
          const resultKit = document.getElementById('result_kit');
          alert(`부엌 온도 : ${data.temperature}°C, 습도 : ${data.humidity}%`);
          document.querySelector('.kit_temp').checked = false; 
          resultKit.style.display = 'none'; 
      } else if (cmd === 'C_Toi_HT') {
          const resultBath = document.getElementById('result_bath');
          alert(`화장실 온도 : ${data.temperature}°C, 습도 : ${data.humidity}%`);
          document.querySelector('.bath_temp').checked = false; 
          resultBath.style.display = 'none';
      } else if (cmd === 'All_on' || cmd === 'All_off') {
        document.querySelector('.green').checked = false; 
        document.querySelector('.red').checked = false; 
        document.querySelector('.yellow').checked = true; 
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Attach event listeners to checkbox inputs
  const checkboxes = document.querySelectorAll('.switch_container input[type="checkbox"], .radio-input input[type="radio"]');
  checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
          sendCommand(event.target.getAttribute('onclick').match(/'([^']+)'/)[1]);
          // 이벤트가 발생한 후에 라디오 버튼 체크 상태를 해제
          if (event.target.type === 'radio') {
              setTimeout(() => {
                  event.target.checked = false;
              }, 200);
          }
      });
  });
});
