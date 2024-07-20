function fetchContent(url, elementId) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(elementId).textContent = data;
      });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('show-register').addEventListener('click', function() {
        console.log('click')
        fetchContent('/auth/get_terms_of_use', 'termsOfUseContent');
        fetchContent('/auth/get_personal_information', 'personalInformationContent');
        const modal = document.getElementById('termsOfUseModal');
        modal.style.display = 'block';
        modal.classList.remove('hide');
        modal.classList.add('show');
    });

    document.getElementById('show-login').addEventListener('click', function() {
        document.querySelector('.login-form').style.display = 'flex';
        document.querySelector('.register-form').style.display = 'none';
    });
    
    document.querySelector('.close_modal').addEventListener('click', function() {
        const modal = document.getElementById('termsOfUseModal');
        modal.classList.remove('show');
        modal.classList.add('hide');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    });
    
    document.querySelector('.submit_modal').addEventListener('click', function() {
        document.querySelector('.login-form').style.display = 'none';
        const modal = document.getElementById('termsOfUseModal');
        modal.classList.remove('show');
        modal.classList.add('hide');
        setTimeout(() => {
            document.querySelector('.register-form').style.display = 'flex';
            modal.style.display = 'none';
        }, 500);
    });

    document.querySelector('.check-id-btn').addEventListener('click', function(){
        const joinId = document.getElementById('register-id-input').value;
        const joinIdInput = document.getElementById('register-id-input');
        const spanElement = document.querySelector('.input-with-button span');
        console.log(joinId);
      
        fetch(`/auth/check_id?join_id=${joinId}`)
          .then(response => response.json())
          .then(data => {
            if (data.exists) {
              alert('아이디 중복');
              spanElement.classList.add('input-error');
            } else {
              const idPattern = /^[a-zA-Z0-9]{6,}$/;
              if (!idPattern.test(joinId)) {
                  alert('아이디 규칙 위반');
                  spanElement.classList.add('input-error');
              }else {
                  spanElement.classList.remove('input-error');
                  joinIdInput.disabled = true;
              }
            }
          })
          .catch(error => {
            console.error('Error checking ID:', error);
          });
    })
    
    document.getElementById('join_pwd').addEventListener('input', function() {
        const joinPwd = document.getElementById('join_pwd').value;
        const spanElement = document.querySelector('.pwd-span');
    
        const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
    
        if (!pwdPattern.test(joinPwd)) {
            spanElement.classList.add('input-error');
        } else {
            spanElement.classList.remove('input-error');
        }
    });
    
    document.getElementById('confirm_pwd').addEventListener('input', function() {
        const Pwd = document.getElementById('join_pwd').value;
        const confirmPwd = document.getElementById('confirm_pwd').value;
        const spanElement = document.querySelector('.confirm-pwd-span');
    
        if (Pwd !== confirmPwd) {
            spanElement.classList.add('input-error');
        } else {
            spanElement.classList.remove('input-error');
        }
    });
    
    document.querySelector('.register-form').addEventListener('submit', function(event) {
        const joinIdInput = document.getElementById('register-id-input');
        const joinId = document.getElementById('register-id-input').value;
        const joinPwd = document.getElementById('join_pwd').value;
        const confirmPwd = document.getElementById('confirm_pwd').value;
        const idSpanElement = document.querySelector('.input-with-button span');
        const pwdSpanElement = document.querySelector('.pwd-span');
        const confirmPwdSpanElement = document.querySelector('.confirm-pwd-span');
    
        let valid = true;
    
        // Check if ID is valid
        if (!joinIdInput.disabled) {
            alert('아이디 중복확인을 하세요.')
        }
    
        // Check if password is valid
        const pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;
        if (!pwdPattern.test(joinPwd)) {
            alert('비밀번호 규칙 위반');
            pwdSpanElement.classList.add('input-error');
            valid = false;
        } else {
            pwdSpanElement.classList.remove('input-error');
        }
    
        // Check if passwords match
        if (joinPwd !== confirmPwd) {
            alert('비밀번호가 일치하지 않습니다.');
            confirmPwdSpanElement.classList.add('input-error');
            valid = false;
        } else {
            confirmPwdSpanElement.classList.remove('input-error');
        }
    
        // Check if any input is empty
        const inputs = document.querySelectorAll('.register-form .input');
        inputs.forEach(input => {
            if (input.value.trim() === '') {
                input.nextElementSibling.classList.add('input-error');
                valid = false;
            } else {
                input.nextElementSibling.classList.remove('input-error');
            }
        });
    
        if (!valid) {
            event.preventDefault();
        }
        joinIdInput.disabled = false;
    });

    document.querySelector('.login-form').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(this);
        
        fetch('/auth/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log('Login successful');
                if (typeof window.onLogin === 'function') {
                    console.log('Calling onLogin function');
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
});
