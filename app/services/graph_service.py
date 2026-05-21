import httpx
import logging
import time
import uuid

logger = logging.getLogger(__name__)


async def run_company_graph(
    company_name: str,
    country: str | None = None
) -> dict:
    """
    Invokes the LangGraph orchestration layer for company analysis.
    """

    url = "http://localhost:2024/runs/wait"
    request_id = str(uuid.uuid4())
    start_time = time.time()

    logger.info(f"[REQ_ID: {request_id}] Starting company graph execution for: {company_name}")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                json={
                    "assistant_id": "srm_company_assistant",
                    "input": {
                        "company_name": company_name,
                        "country": country,
                        "metadata": {
                            "request_id": request_id
                        }
                    }
                }
            )

            response.raise_for_status()
            data = response.json()
            
            duration = time.time() - start_time
            logger.info(f"[REQ_ID: {request_id}] Graph execution completed successfully in {duration:.2f}s")

            return {
    "success": True,
    "company_name": company_name,
    "country": country,
    "golden_record": data.get("golden_record", {})
}

    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        duration = time.time() - start_time
        logger.error(f"[REQ_ID: {request_id}] LangGraph invocation error after {duration:.2f}s: {str(exc)}")

        return {
            "success": False,
            "company_name": company_name,
            "country": country,
            "response": str(exc)
        }

    except Exception as exc:
        duration = time.time() - start_time
        logger.error(f"[REQ_ID: {request_id}] Unexpected error in graph_service after {duration:.2f}s: {str(exc)}")

        return {
            "success": False,
            "company_name": company_name,
            "country": country,
            "response": str(exc)
        }