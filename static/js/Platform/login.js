const closemodal = document.querySelector(".close_modal");
const submitmodal = document.querySelector(".submit_modal");
const openModal = document.querySelector(".btn-open-modal");
const signInBtn = document.getElementById("signIn");
const container = document.querySelector(".container");
const modal = document.querySelector('.modal');
const termsOfUseModal = document.getElementById('termsOfUseModal');

// 이용약관 텍스트 불러오기
function fetchContent(url, elementId) {
  fetch(url)
    .then(response => response.text())
    .then(data => {
      document.getElementById(elementId).textContent = data;
    });
}

openModal.addEventListener("click", () => {
  fetchContent('/auth/get_terms_of_use', 'termsOfUseContent');
  fetchContent('/auth/get_personal_information', 'personalInformationContent');
  termsOfUseModal.style.display = "flex";
});
closemodal.addEventListener("click", () => {
  modal.style.display = "none";
});
submitmodal.addEventListener("click", () => {
  modal.style.display = "none";
  container.classList.add("right-panel-active");
});
signInBtn.addEventListener("click", () => {
  document.querySelector('input[name="name"]').value = "";
  document.querySelector('input[name="name"]').value = "";
  document.querySelector('input[name="join_id"]').value = "";
  document.querySelector('input[name="join_pwd"]').value = "";
  document.querySelector('input[name="phone"]').value = "";
  document.querySelector('input[name="email"]').value = "";
  document.querySelector('input[name="birth"]').value = "";

  document.getElementById('idCheckIcon').textContent = '';
  document.getElementById('idFeedback').textContent = '';
  document.getElementById('pwdFeedback').textContent = '';

  container.classList.remove("right-panel-active");
});
openModal.addEventListener("click", () => {
  modal.style.display = "flex";
});

// 전화번호 하이픈
const hypenTel = (target) => {
  target.value = target.value
    .replace(/[^0-9]/g, '')
    .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`);
}

// 생일 날짜 확인
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById("birthDate").setAttribute('max', today);
});

// 회원가입 버튼 이벤트
document.querySelector('.sign-up-container form').addEventListener('submit', function(event) {
  const id = document.querySelector('input[name="join_id"]').value;
  const password = document.querySelector('input[name="join_pwd"]').value;
  const email = document.querySelector('input[name="email"]').value;
  
  const idPattern = /^[A-Za-z0-9]{6,}$/; // 특수문자 제외, 6자 이상
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/; // 8-20자, 문자, 숫자, 특수문자 포함
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;

  if (!idPattern.test(id)) {
    alert('아이디는 특수문자를 제외하고 6자 이상이어야 합니다.');
    event.preventDefault();
  } else if (!passwordPattern.test(password)) {
    alert('비밀번호는 8-20자 이내의 문자, 숫자, 특수문자를 포함해야 합니다.');
    event.preventDefault();
  }else if (!emailPattern.test(email)) {
    alert('올바른 이메일 형식이 아닙니다.');
    event.preventDefault();
  }
});

// 아이디 중복 버튼 및 규칙 확인
document.getElementById('checkIdBtn').addEventListener('click', function() {
  const joinId = document.getElementById('join_id').value;
  const idCheckIcon = document.getElementById('idCheckIcon');
  const idFeedback = document.getElementById('idFeedback');

  fetch(`/auth/check_id?join_id=${joinId}`)
    .then(response => response.json())
    .then(data => {
      if (data.exists) {
        idCheckIcon.textContent = 'cancel';
        idCheckIcon.style.color = 'red';
        idFeedback.style.color = 'red';
      } else {
        const idPattern = /^[a-zA-Z0-9]{6,}$/;
        if (!idPattern.test(joinId)) {
          idFeedback.textContent = '아이디는 특수문자 제외, 6자 이상이어야 합니다.';
          idFeedback.style.color = 'red';
          idCheckIcon.textContent = 'cancel';
          idCheckIcon.style.color = 'red';
        } else {
          idFeedback.textContent = '';
          idCheckIcon.textContent = 'check_circle';
          idCheckIcon.style.color = 'green';
        }
      }
      idCheckIcon.style.display = 'inline';
    })
    .catch(error => {
      console.error('Error checking ID:', error);
    });
});

document.getElementById('join_id').addEventListener('input', function() {
  const joinId = document.getElementById('join_id').value;
  const idFeedback = document.getElementById('idFeedback');
  const idCheckIcon = document.getElementById('idCheckIcon');

  const idPattern = /^[a-zA-Z0-9]{6,}$/;

  if (!idPattern.test(joinId)) {
    idFeedback.textContent = '아이디는 특수문자 제외, 6자 이상이어야 합니다.';
    idFeedback.style.color = 'red';
    idCheckIcon.style.display = 'none';
  } else {
    idFeedback.textContent = '';
  }
});

document.getElementById('join_pwd').addEventListener('input', function() {
  const joinPwd = document.getElementById('join_pwd').value;
  const pwdFeedback = document.getElementById('pwdFeedback');

  const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

  if (!pwdPattern.test(joinPwd)) {
    pwdFeedback.textContent = '비밀번호는 8-20자 이내, 문자, 숫자, 특수문자를 포함해야 합니다.';
    pwdFeedback.style.color = 'red';
  } else {
    pwdFeedback.textContent = '';
  }
});

document.querySelector('.sign-in-container form').addEventListener('submit', function(event) {
  event.preventDefault();
  
  const formData = new FormData(this);
  
  fetch('/auth/login', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (typeof window.onLogin === 'function') {
        window.onLogin();
      } else {
        console.error('onLogin function is not defined');
      }
      // 리다이렉션 전에 잠시 대기
      setTimeout(() => {
        window.location.href = data.redirect;
      }, 1000);
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('로그인 중 오류가 발생했습니다.');
  });
});