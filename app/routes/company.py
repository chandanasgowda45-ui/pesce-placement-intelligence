from fastapi import APIRouter
from pydantic import BaseModel

from app.services.graph_service import (
    run_company_graph
)

router = APIRouter()


class CompanyRequest(BaseModel):
    company_name: str
    country: str | None = None


@router.post(
    "/v1/company-intelligence/generate"
)
async def generate_company_intelligence(
    request: CompanyRequest
):

    result = await run_company_graph(
        company_name=request.company_name,
        country=request.country
    )

    return result