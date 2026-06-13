from pydantic import BaseModel


class CustomerItem(BaseModel):
    id: str
    customer_id: str
    name: str
    email: str
    age: int
    gender: str
    tenure: int
    monthly_charges: float
    contract_type: str
    risk: str = "low"
    risk_level: str = "Low"
    prediction_probability: float = 0.0


class CustomersData(BaseModel):
    total: int
    limit: int
    offset: int
    customers: list[CustomerItem]
