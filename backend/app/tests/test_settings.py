from app.core.config import settings

def test_jwt_secret_value():
    assert('on0Jzka9UHySf4MKpME5QBpEZYhwQ5/MqHSaWotwQOo=' == settings.AUTH.JWT_SECRET)
    assert('on0Jzka9UHySf4MKpME5QBpEZYhwQ5/MqHSaWotwQOo=' != settings.AUTH.COOKIE_SECRET)
    assert(8080 == settings.PORT)
