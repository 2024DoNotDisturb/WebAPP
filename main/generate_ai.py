from flask import Blueprint, request, jsonify
import flask_login
from model.model_platform import User, db, AIServices, ServiceUsage
import boto3
import json
from config import Config
from datetime import datetime
import base64
import re

generate = Blueprint('generate', __name__)

@generate.route('/request_generate_image', methods=['POST'])
def handle_lambda_request():
    try:
        prompt = request.form.get('prompt')
        negative_prompt = request.form.get('negative_prompt')

        result = connect_lambda(prompt, negative_prompt)
        
        current_user = flask_login.current_user
        user = db.session.query(User).filter_by(ID=current_user.ID).first()

        service = AIServices.query.filter_by(ServiceName='ProfileIMG').first()
        if not service:
            raise ValueError("ProfileIMG 서비스를 찾을 수 없습니다.")
        
        user_profile = user.user_profile[0]
        user_profile.ProfileURL = result

        print(result)

        new_usage = ServiceUsage(
            UserID = user.UserID,
            ServiceID = service.ServiceID,
            UsageDate = datetime.now(),
            UsageDetail = f"Generated image with prompt: {prompt}, negative prompt: {negative_prompt}",
            UsageAmount = 1
        )
        db.session.add(new_usage)
        db.session.commit()

        return jsonify({'success': True, 'message': '생성 요청을 성공했습니다.'})
    except Exception as e:
        return jsonify({'success': False, 'message': '생성 요청을 실패했습니다: ' + str(e)})

def connect_lambda(prompt, negative_prompt):
    num_images_per_prompt = 1
    user = 'user1'
    category = 't2i'
    
    lambda_client = boto3.client('lambda', aws_access_key_id=Config.gernerate_access_key, aws_secret_access_key=Config.gernerate_secret_access_key, region_name=Config.gernerate_region)
    payload = {
        "inputs": prompt,
        "negative_prompt": negative_prompt,
        "num_images_per_prompt": num_images_per_prompt,
        "user": user,
        "category": category
    }
    response = lambda_client.invoke(FunctionName=Config.gernerate_lambda_function_name, InvocationType='RequestResponse', Payload=json.dumps(payload))
    result = json.loads(response["Payload"].read().decode('utf-8'))
    return result

@generate.route('/request_show_image', methods=['POST'])
def show_image():
    try:
        current_user = flask_login.current_user
        user_profile = current_user.user_profile[0]

        image_data = get_output(user_profile.ProfileURL)

        return jsonify({'success': True, 'image_data': image_data})

    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({'success': False, 'message': 'AI 생성 이미지 가져오기 실패: ' + str(e)})

def get_output(ProfileURL):
    bucket, key = extract_bucket_and_key(ProfileURL)
    s3_client = boto3.client(
        's3',
        aws_access_key_id=Config.gernerate_access_key,
        aws_secret_access_key=Config.gernerate_secret_access_key,
        region_name=Config.gernerate_region
    )

    response = s3_client.get_object(Bucket=bucket, Key=key)
    result = json.loads(response["Body"].read())

    generated_images = result.get('generated_images', [])

    if generated_images:
        return generated_images[0]  # 첫 번째 이미지를 가져온다고 가정
    else:
        raise ValueError('생성된 이미지를 찾을 수 없습니다')

def extract_bucket_and_key(profile_url):
    pattern = r's3://([^/]+)/(.+)'

    match = re.match(pattern, profile_url)
    if match:
        bucket = match.group(1)
        key = match.group(2)
        return bucket, key
    else:
        raise ValueError('잘못된 S3 프로필 URL 형식입니다')

@generate.route('/request_chage_generate_image', methods=['POST'])
def change_image():
    try:
        current_user = flask_login.current_user
        user_profile = current_user.user_profile[0]
        user = User.query.filter_by(ID=current_user.ID).first()

        image_data = get_output(user_profile.ProfileURL)

        if user:
            user_profile = user.user_profile[0]
            if user_profile:
                image_blob = base64.b64decode(image_data)
                user_profile.ProfilePicture = image_blob

        db.session.commit()
        return jsonify({'success': True, 'message': '프로필 이미지 변경 성공'})

    except Exception as e:
        print(f"Exception occurred: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({'success': False, 'message': 'AI 생성 이미지 가져오기 실패: ' + str(e)})
