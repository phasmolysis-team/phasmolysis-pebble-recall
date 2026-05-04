from app.schemas.cookies import (
    set_default_cookie_params,
    decode_encrypted_cookie,
)
from starlette.status import (
    HTTP_409_CONFLICT,
    HTTP_401_UNAUTHORIZED,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
    HTTP_205_RESET_CONTENT,
)
from app.core.security.jwt_service import Claims, JwtService, get_jwt_service
from cryptography.hazmat.primitives.kdf.argon2 import Argon2id
from datetime import UTC
import datetime
from sqlmodel import select, or_
from app.core.database import get_session
from app.core.security.kdf_pass import get_kdf
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Annotated
from app.models.users import Users, UpdateUser, UserWithoutPassword
from app.middlewares.auth import check_encrypted_cookie_auth
from fastapi import APIRouter, Form, Depends, HTTPException, Response, Request

router = APIRouter()

CurrentClaims = Annotated[Claims, Depends(check_encrypted_cookie_auth)]


@router.get("/users")
async def get_current_user(
    claims: CurrentClaims, session: Annotated[AsyncSession, Depends(get_session)]
) -> Users | None:
    statement = select(Users).where(
        or_(Users.username == claims.sub, Users.email == claims.sub)
    )
    result = await session.exec(statement)
    return result.one_or_none()


@router.delete("/users/{id}", response_model=UserWithoutPassword)
async def delete_user(
    current_user: Annotated[Users, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    id: int,
):
    if id != current_user.id:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not allowed to delete another user",
        )
    statement = select(Users).where(Users.id == id)
    result = await session.exec(statement)
    user_to_delete = result.one_or_none()
    if user_to_delete is None:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND)

    await session.delete(user_to_delete)
    await session.commit()
    user_dict = user_to_delete.model_dump()
    del user_dict["password"]
    return UserWithoutPassword(**user_dict)


@router.patch(
    "/users/{id}",
    responses={
        200: {"model": UserWithoutPassword},
        205: {
            "description": "**Warning**: Updates in sensitive fields such as email or username leads to a logout"
        },
    },
)
async def update_user(
    request: Request,
    response: Response,
    jwt_service: Annotated[JwtService, Depends(get_jwt_service)],
    current_user: Annotated[Users, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    kdf: Annotated[Argon2id, Depends(get_kdf)],
    id: int,
    payload: Annotated[UpdateUser, Form()],
):
    to_delete_login = False
    if id != current_user.id:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED,
            detail="Not allowed to update another user",
        )
    statement = select(Users).where(Users.id == id)
    result = await session.exec(statement)
    user = result.one()
    existing_users_statement = select(Users).where(
        or_(Users.username == payload.username, Users.email == payload.email)
    )
    result_existing_users = await session.exec(existing_users_statement)
    existing_users = result_existing_users.all()
    if len(existing_users) > 1:
        raise HTTPException(
            status_code=HTTP_409_CONFLICT,
            detail="One or more users have the same email address or username. Ensure you have a unique email address or username.",
        )
    if payload.username is not None:
        user.username = payload.username
        to_delete_login = True
    if payload.email is not None:
        user.email = payload.email
        to_delete_login = True
    if payload.contact_number is not None:
        user.contact_number = payload.contact_number
    if payload.professional_license_id is not None:
        user.professional_license_id = payload.professional_license_id
    if payload.password is not None:
        user.password = kdf.derive_phc_encoded(payload.password.encode())

    user.updated_at = datetime.datetime.now(tz=UTC)
    session.add(user)
    await session.commit()
    await session.refresh(user)
    if to_delete_login:
        session_cookie = request.cookies.get("session")
        if session_cookie is None:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED)

        jwt_token = decode_encrypted_cookie(session_cookie)
        if jwt_service.verify(jwt_token) is not None:
            cookie_params = set_default_cookie_params(name="session")
            # NOTE: `delete_cookie` does not have the following params
            # - value
            # - expires
            del cookie_params["value"]
            del cookie_params["expires"]
            response.delete_cookie(**cookie_params)
            response.status_code = HTTP_205_RESET_CONTENT
            return
        raise HTTPException(status_code=HTTP_500_INTERNAL_SERVER_ERROR)
    user_dict = user.model_dump()
    del user_dict["password"]
    model_response = UserWithoutPassword(**user_dict)
    return model_response
