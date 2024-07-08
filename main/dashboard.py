from flask import Blueprint, jsonify, request, current_app
from model.model_platform import db, AIServices, UserServices, ServiceUsage, User
from sqlalchemy import func, case
from datetime import datetime, timedelta
from sqlalchemy import func

dashboard = Blueprint('dashboard', __name__)

@dashboard.route('/api/services')
def get_services():
    services = AIServices.query.all()
    return jsonify([{'ServiceID': s.ServiceID, 'ServiceName': s.ServiceName} for s in services])

@dashboard.route('/api/subscription-data')
def get_subscription_data():
    service_name = request.args.get('serviceName')
    days = request.args.get('days', default=30, type=int)

    if not service_name:
        return jsonify({'error': 'Missing service name'}), 400

    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days)

    query = db.session.query(
        func.date(UserServices.SubscriptionDate).label('date'),
        func.sum(case((UserServices.Status == 'active', 1), else_=0)).label('active'),
        func.sum(case((UserServices.Status == 'inactive', 1), else_=0)).label('inactive'),
        func.sum(case((UserServices.Status == 'canceled', 1), else_=0)).label('canceled')
    ).join(AIServices
    ).filter(
        AIServices.ServiceName == service_name,
        UserServices.SubscriptionDate.between(start_date, end_date)
    ).group_by(
        func.date(UserServices.SubscriptionDate)
    ).order_by(
        func.date(UserServices.SubscriptionDate)
    )

    results = query.all()

    return jsonify([{
        'date': result.date.strftime('%Y-%m-%d'),
        'active': result.active,
        'inactive': result.inactive,
        'canceled': result.canceled
    } for result in results])

@dashboard.route('/api/daily-active-users')
def get_daily_active_users():
    today = datetime.now().date()
    
    active_users = db.session.query(func.count(func.distinct(ServiceUsage.UserID))).filter(
        func.date(ServiceUsage.UsageDate) == today
    ).scalar()

    total_users = db.session.query(func.count(User.UserID)).scalar()

    active_user_ratio = (active_users / total_users) if total_users > 0 else 0

    return {
        'date': today.isoformat(),
        'active_users': active_users,
        'total_users': total_users,
        'active_user_ratio': active_user_ratio
    }

@dashboard.route('/api/daily-service-usage')
def get_daily_service_usage():
    # 오늘 날짜 계산
    today = datetime.now().date()
    
    # 로봇, 루틴, ProfileIMG 서비스의 ID 가져오기
    services = AIServices.query.filter(AIServices.ServiceName.in_(['Robot', 'SmartRoutine', 'ProfileIMG'])).all()
    if len(services) != 3:
        return jsonify({'error': 'One or more services not found'}), 404

    # 오늘의 서비스별 사용량 쿼리
    usage_data = db.session.query(
        AIServices.ServiceName,
        func.sum(ServiceUsage.UsageAmount).label('total_usage')
    ).join(AIServices).filter(
        func.date(ServiceUsage.UsageDate) == today,
        AIServices.ServiceID.in_([s.ServiceID for s in services])
    ).group_by(
        AIServices.ServiceName
    ).all()

    # 결과를 딕셔너리로 변환
    result = {
        'date': today.isoformat(),
        'Robot': 0,
        'SmartRoutine': 0,
        'ProfileIMG': 0
    }
    for usage in usage_data:
        result[usage.ServiceName] = usage.total_usage

    return jsonify([result])



@dashboard.route('/api/age-distribution')
def get_age_distribution():
    try:
        current_date = datetime.now().date()
        age_groups = [
            (0, 18), (19, 24), (25, 34), (35, 44),
            (45, 54), (55, 64), (65, float('inf'))
        ]
        
        distribution = []
        total_count = 0

        for start, end in age_groups:
            count = db.session.query(func.count(User.UserID)).filter(
                User.DateOfBirth.isnot(None),
                func.year(func.current_date()) - func.year(User.DateOfBirth) >= start,
                func.year(func.current_date()) - func.year(User.DateOfBirth) <= (end if end != float('inf') else 200)
            ).scalar()
            
            label = f"{start}-{end if end != float('inf') else '+'}"
            distribution.append({"age_group": label, "count": count})
            total_count += count

        if total_count == 0:
            return jsonify({
                "message": "No data available",
                "distribution": [{"age_group": label, "count": 0} for start, end in age_groups for label in [f"{start}-{end if end != float('inf') else '+'}"]]
            }), 204
        else:
            return jsonify(distribution)

    except Exception as e:
        dashboard.logger.error(f"Error in get_age_distribution: {str(e)}")
        return jsonify({"error": str(e)}), 500