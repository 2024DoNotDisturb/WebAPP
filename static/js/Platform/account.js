$(document).ready(function() {
    var pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

    // 프로필 정보 수정 버튼 클릭 시
    $('#edit-profile-btn').click(function() {
        $('#change-password-btn').removeAttr('disabled');
        $('#edit-profile-btn').addClass('d-none');
        $('#username').addClass('d-none');
        $('#edit-username').removeClass('d-none').val($('#username').text().trim());
        $('#email').addClass('d-none');
        $('#edit-email').removeClass('d-none').val($('#email').text().trim());
        $('#phone').addClass('d-none');
        $('#edit-phone').removeClass('d-none').val($('#phone').text().trim());
        $('#address').addClass('d-none');
        $('#edit-address').removeClass('d-none').val($('#address').text().trim());
        $('#edit-status').prop('disabled', false);
        $('#save-changes-btn').removeClass('d-none');
    });

    $('#save-changes-btn').click(function() {
        var newUsername = $('#edit-username').val();
        var newEmail = $('#edit-email').val();
        var newPhone = $('#edit-phone').val();
        var newAddress = $('#edit-address').val();
        var newStatus = $('#edit-status').val();
        var newPassword = $('#new-password').val();

        if (newPassword && !pwdPattern.test(newPassword)) {
            alert('비밀번호는 8-20자 이내, 문자, 숫자, 특수문자를 포함해야 합니다.');
            return;
        }
        if (newPassword && !$('#password-match-icon').children('i').hasClass('bi-check2')) {
            alert('현재 비밀번호 일치 확인을 해야합니다.');
            return;
        }

        // Ajax를 사용하여 서버로 데이터 전송 및 처리
        $.ajax({
            method: 'POST',
            url: '/profile/save_profile_changes',
            data: {
                newUsername: newUsername,
                newEmail: newEmail,
                newPhone: newPhone,
                newAddress: newAddress,
                newStatus: newStatus,
                newPassword: newPassword
            },
            success: function(response) {
                alert('프로필이 성공적으로 업데이트되었습니다.');
                window.location.reload();
            },
            error: function(xhr, status, error) {
                console.error(error);
            }
        });
    });

    //사진 업로드 input 변경 시 (프로필 사진 업로드)
    $('#fileInput').on('change', function() {
        var file = this.files[0];
        var formData = new FormData();
        formData.append('file', file);
    
        // Ajax를 사용하여 파일 업로드
        $.ajax({
            url: '/profile/upload_profile_picture',
            method: 'POST',
            data: formData,
            contentType: false,
            processData: false,
            success: function(response) {
                if (response.success) {
                    alert('프로필 사진이 성공적으로 업로드되었습니다.');
                    window.location.reload(); // 페이지 새로고침
                } else {
                    alert('프로필 사진 업로드에 실패했습니다: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('서버 오류로 인해 프로필 사진 업로드에 실패했습니다: ' + error);
            }
        });
    });

    // 비밀번호 변경 버튼 클릭 시
    $('#change-password-btn').click(function() {
        $('#password').addClass('d-none');
        $('#edit-password').removeClass('d-none');
        $('#change-password-btn').addClass('d-none');
        $('#cancel-password-btn').removeClass('d-none');
        $('#check-password-btn').removeClass('d-none');
        $('#change-password-section').toggle(); // 비밀번호 변경 섹션을 보이거나 숨깁니다.
    });
    $('#check-password-btn').click(function() {
        var Password = $('#edit-password').val();

        // Ajax를 사용하여 서버로 비밀번호 일치 여부 확인 요청
        $.ajax({
            method: 'POST',
            url: '/profile/check_password_match',
            data: {
                Password: Password
            },
            success: function(response) {
                if (response.match) {
                    $('#password-match-icon').html('<i class="bi bi-check2 text-success"></i>');
                } else {
                    $('#password-match-icon').html('<i class="bi bi-x text-danger"></i>');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error checking password match:', error);
                // 예외 처리: 오류 발생 시 메시지 출력 등
            }
        });
    });

    $('#cancel-password-btn').click(function() {
        // 비밀번호 변경 입력 상자를 숨기고, 텍스트로 보여줍니다.
        $('#edit-password').addClass('d-none');
        $('#password').removeClass('d-none');
    
        // 기존의 비밀번호 변경 관련 버튼을 보이거나 숨깁니다.
        $('#cancel-password-btn').addClass('d-none');
        $('#check-password-btn').addClass('d-none');
        $('#change-password-btn').removeClass('d-none');
    
        // 비밀번호 일치 아이콘을 초기화합니다.
        $('#password-match-icon').html('');
    
        // 비밀번호 변경 섹션을 숨깁니다.
        $('#change-password-section').toggle(); 
        $('#edit-password').val('');
        $('#new-password').val('');
        var pwdFeedback = $('.pwdFeedbackNew'); 
        pwdFeedback.text('');

    });    

    $('#new-password').on('input', function() {
        var newPassword = $(this).val();
        var pwdFeedback = $('.pwdFeedbackNew'); // 수정: 클래스 선택자 수정

        var pwdPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

        if (!pwdPattern.test(newPassword)) {
            pwdFeedback.text('비밀번호는 8-20자 이내, 문자, 숫자, 특수문자를 포함해야 합니다.');
            pwdFeedback.css('color', 'red');
        } else {
            pwdFeedback.text('');
        }
    });
    
    $('#generate-image-btn').click(function() {
        $('#generateImageModal').modal('show');
    });

    $('#confirmGenerateBtn').click(function() {
        var prompt = $('#prompt').val();
        var n_prompt = $('#n_prompt').val();

        // 여기서 필요한 작업을 수행 (예: 이미지 처리 등)

        $('#generateImageModal').modal('hide');
    });

});
 