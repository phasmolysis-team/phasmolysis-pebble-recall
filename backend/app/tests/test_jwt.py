import datetime
from app.core.security.jwt_service import Claims, JwtService
from app.core.config import settings
from jwt import ExpiredSignatureError
import pytest


def test_jwt_expiry_expired():
    service = JwtService(secret=settings.AUTH.JWT_SECRET)
    claims = Claims(exp=0)
    token = service.sign(claims=claims)
    with pytest.raises(ExpiredSignatureError):
        service.verify(token)
    claims = Claims(exp=int(datetime.datetime.now(tz=datetime.UTC).timestamp()))
    token = service.sign(claims=claims)
    with pytest.raises(ExpiredSignatureError):
        service.verify(token)


def test_jwt_expiry_not_expired():
    service = JwtService(secret=settings.AUTH.JWT_SECRET)
    claims = Claims(exp=int(datetime.datetime.now(tz=datetime.UTC).timestamp()) + 5)
    token = service.sign(claims=claims)
    assert service.verify(token) == claims


def test_jwt_different_sub():
    service = JwtService(secret=settings.AUTH.JWT_SECRET)
    c1 = Claims(exp=int(datetime.datetime.now(tz=datetime.UTC).timestamp()) + 5)
    token = service.sign(claims=c1)
    assert service.verify(token) == c1
    c2 = Claims(
        exp=int(datetime.datetime.now(tz=datetime.UTC).timestamp()) + 5, sub="withsub"
    )
    token = service.sign(claims=c2)
    assert service.verify(token) == c2
    assert c1 != c2
