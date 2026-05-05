from app.schemas.cookies import decode_encrypted_cookie
from starlette.status import HTTP_401_UNAUTHORIZED
from app.core.database import get_session
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.security.jwt_service import get_jwt_service, JwtService
from typing import Annotated
from fastapi import Request, Depends, HTTPException


async def check_encrypted_cookie_auth(
    request: Request,
    session: Annotated[AsyncSession, Depends(get_session)],
    jwt_service: Annotated[JwtService, Depends(get_jwt_service)],
    session_cookie: Annotated[str, Depends(get_session_cookie)],
):
    if session_cookie is None:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)

    try:
        jwt_token = decode_encrypted_cookie(session_cookie)
        claims = jwt_service.verify(jwt_token)
        return claims

    except BaseException:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)


def get_session_cookie(
    request: Request,
):
    return request.cookies.get("session")


def check_if_logged_in(
    request: Request,
):
    return request.cookies.get("session") is not None
