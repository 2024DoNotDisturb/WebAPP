$(document).ready(function() {
    // 칭호 수정 버튼 클릭 시
    $('#edit-title-btn').click(function() {
        var $title1 = $('.list-group-item:nth-child(1) .text-secondary').text().trim();
        var $title2 = $('.list-group-item:nth-child(2) .text-secondary').text().trim();

        var $input1 = $('<input>').attr({
            type: 'text',
            class: 'form-control edit-title-input',
            value: $title1
        });

        var $input2 = $('<input>').attr({
            type: 'text',
            class: 'form-control edit-title-input',
            value: $title2
        });

        $('.list-group-item:nth-child(1) .text-secondary').replaceWith($input1);
        $('.list-group-item:nth-child(2) .text-secondary').replaceWith($input2);

        $(this).addClass('d-none');
        $('#save-title-btn').removeClass('d-none');
    });

    $('#save-title-btn').click(function() {
        var new_firstname = $('.list-group-item:nth-child(1) .edit-title-input').val();
        var new_lastname = $('.list-group-item:nth-child(2) .edit-title-input').val();

        $.ajax({
            method: 'POST',
            url: '/update_title',
            data: {
                newFirstName: new_firstname,
                newLastName: new_lastname
            },
            success: function(response) {
                alert('프로필이 성공적으로 업데이트되었습니다.');
                window.location.reload();
                
                $('#save-title-btn').addClass('d-none');
                $('#edit-title-btn').removeClass('d-none');
            },
            error: function(xhr, status, error) {
                console.error('Error saving titles:', error);
                alert('칭호 저장 중 오류가 발생했습니다. 나중에 다시 시도해주세요.');
            }
        });
    });

    // 프로필 정보 수정 버튼 클릭 시
    $('#edit-profile-btn').click(function() {
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

        // Ajax를 사용하여 서버로 데이터 전송 및 처리
        $.ajax({
            method: 'POST',
            url: '/save_profile_changes',
            data: {
                newUsername: newUsername,
                newEmail: newEmail,
                newPhone: newPhone,
                newAddress: newAddress,
                newStatus: newStatus
            },
            success: function(response) {
                alert('프로필이 성공적으로 업데이트되었습니다.');
                window.location.reload();

                // 입력 상태 초기화
                // $('#edit-username').addClass('d-none');
                // $('#edit-email').addClass('d-none');
                // $('#edit-phone').addClass('d-none');
                // $('#edit-address').addClass('d-none');
                // $('#save-changes-btn').addClass('d-none');
                // $('#username').removeClass('d-none');
                // $('#email').removeClass('d-none');
                // $('#phone').removeClass('d-none');
                // $('#address').removeClass('d-none');
                // $('#edit-status').prop('disabled', true);
                // $('#edit-profile-btn').removeClass('d-none');
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
            url: '/upload_profile_picture',
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
});
 