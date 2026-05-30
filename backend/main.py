from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import networkx as nx
import numpy as np
from sklearn.linear_model import LinearRegression
import uuid
import json
import os
from google import genai
from dotenv import load_dotenv

# Explicitly load .env from the backend directory and the root directory relative to this file
load_dotenv(override=True)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=True)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), override=True)

# configure genai
api_key = os.environ.get("GEMINI_API_KEY", "")
print("DEBUG - LOADED GEMINI_API_KEY:", api_key)
if api_key:
    client = genai.Client(api_key=api_key)
else:
    client = None

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------
# DATA MODELS
# -----------------
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class CycleRun(BaseModel):
    course: Optional[str] = None
    enrollment_change: Optional[float] = None
    new_program: Optional[bool] = None
    faculty_change: Optional[float] = None
    simulation: Optional[bool] = None

class Feedback(BaseModel):
    proposal_id: str
    action: str
    modifications: Optional[Dict[str, Any]] = None

# -----------------
# STATE
# -----------------
# We'll use some generated historical data to drive our "real" models
class State:
    def __init__(self):
        self.historical_enrollment = {
            "CS401": [1100, 1150, 1180, 1200, 1210],
            "MBA702": [750, 780, 800, 810, 820]
        }
        self.conflicts = [
            ("MBA702", "CS301") # Prof. Sharma is double booked
        ]
        self.proposals = []
        self.alerts = []

state = State()

# -----------------
# MODELS & LOGIC
# -----------------
def generate_forecasts():
    forecasts = []
    base_date = datetime.date(2026, 3, 1)
    
    for course, history in state.historical_enrollment.items():
        X = np.array(range(len(history))).reshape(-1, 1)
        y = np.array(history)
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Forecast next 6 months
        for i in range(6):
            future_x = len(history) + i
            pred = model.predict([[future_x]])[0]
            
            # Add some variance for intervals
            std_dev = np.std(history) if len(history) > 1 else 50
            
            forecast_date = (base_date + datetime.timedelta(days=30*i)).replace(day=1)
            forecasts.append({
                "ds": forecast_date.isoformat(),
                "yhat": int(pred),
                "yhat_lower": int(pred - std_dev),
                "yhat_upper": int(pred + std_dev),
                "course": course
            })
    return forecasts

def resolve_conflicts_dsatur():
    # DSatur algorithm using networkx
    G = nx.Graph()
    # Add nodes (courses)
    courses = ["CS401", "MBA702", "CS301", "AI-501"]
    G.add_nodes_from(courses)
    
    # Add edges for conflicts
    for c1, c2 in state.conflicts:
        G.add_edge(c1, c2)
        
    # Apply DSatur (networkx uses greedy_color which can use DSatur heuristic)
    coloring = nx.coloring.greedy_color(G, strategy='DSATUR')
    
    # Generate proposals based on coloring
    proposals = []
    
    if "MBA702" in coloring and "CS301" in coloring and coloring["MBA702"] != coloring["CS301"]:
        proposals.append({
            "id": f"PROP-{uuid.uuid4().hex[:6].upper()}",
            "rank": 2,
            "resource": "Faculty Reallocation",
            "summary": "Reassign time slots to resolve MBA702 and CS301 conflict based on DSATUR.",
            "tradeoff": "Requires schedule adjustment but eliminates double-booking.",
            "predicted_impact": {
                "utilisation_delta": 0.05,
                "conflict_reduction": 1,
                "cost_change": 0.0
            },
            "status": "pending"
        })
        
    return proposals

def detect_anomalies():
    alerts = []
    # Simple logic to detect overflow
    for course, history in state.historical_enrollment.items():
        if history[-1] > 1200:
            alerts.append({
                "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
                "type": "capacity_overflow",
                "severity": "high",
                "message": f"{course} projected to exceed room capacity based on recent trends.",
                "course": course,
                "timestamp": datetime.datetime.now().isoformat() + "Z",
                "details": {
                    "current_enrollment": history[-1],
                    "room_capacity": 1000,
                    "agent": "ORACLE",
                    "confidence": 0.92
                }
            })
            
    if state.conflicts:
        c1, c2 = state.conflicts[0]
        alerts.append({
            "id": f"ALT-{uuid.uuid4().hex[:6].upper()}",
            "type": "faculty_conflict",
            "severity": "medium",
            "message": f"Conflict detected between {c1} and {c2}",
            "course": c1,
            "timestamp": datetime.datetime.now().isoformat() + "Z",
            "details": {
                "conflicting_courses": [c1, c2],
                "agent": "ARBITER"
            }
        })
        
    return alerts

# -----------------
# API ROUTES
# -----------------
@app.get("/api/dashboard")
def get_dashboard():
    alerts = detect_anomalies()
    forecasts = generate_forecasts()
    proposals = resolve_conflicts_dsatur()
    
    # Add a default proposal if empty
    if not proposals:
        proposals.append({
            "id": "PROP-DEFAULT",
            "rank": 1,
            "resource": "Classroom CR-302",
            "summary": "Upgrade CS401 to CR-302 (capacity 120) and add one additional section",
            "tradeoff": "Higher room cost (+12%) but eliminates capacity overflow.",
            "predicted_impact": {
                "utilisation_delta": 0.22,
                "conflict_reduction": 2,
                "cost_change": 0.12
            },
            "status": "pending"
        })
        
    metrics = {
        "active_alerts": len(alerts),
        "high_severity_alerts": len([a for a in alerts if a["severity"] == "high"]),
        "forecasted_demand_change": 18.4,
        "conflict_resolution_rate": 0.87,
        "recommendation_acceptance_rate": 0.74
    }
    
    state.proposals = proposals
    
    return {
        "alerts": alerts,
        "forecasts": forecasts,
        "proposals": proposals,
        "metrics": metrics
    }

@app.post("/api/chat")
def chat(payload: ChatMessage):
    global client
    if not client:
        load_dotenv(override=True)
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"), override=True)
        load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), override=True)
        api_key = os.environ.get("GEMINI_API_KEY", "")
        if api_key:
            client = genai.Client(api_key=api_key)

    if client:
        try:
            prompt = f"You are HERMES, an AI academic resource allocation assistant. Respond professionally and concisely to this user query: {payload.message}"
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            return {
                "response": response.text,
                "session_id": payload.session_id or str(uuid.uuid4()),
                "confidence": 0.95
            }
        except Exception as e:
            return {
                "response": f"[REAL MODEL ERROR]: {str(e)}",
                "session_id": payload.session_id or str(uuid.uuid4())
            }
    
    # Mock implementation if no API key
    return {
        "response": f"[MOCK MODEL - PLEASE SET GEMINI_API_KEY to use real model] I analyzed your request regarding '{payload.message}'. Based on the current models, we recommend following the generated proposals.",
        "session_id": payload.session_id or str(uuid.uuid4())
    }

@app.post("/api/run-cycle")
def run_cycle(payload: CycleRun):
    # Modify state to simulate running a cycle with new params
    if payload.enrollment_change:
        for course in state.historical_enrollment:
            state.historical_enrollment[course][-1] += int(payload.enrollment_change)
            
    mock_before = {"forecast": 1240, "conflicts": 4, "utilisation": 0.62}
    enrollment = payload.enrollment_change or 0
    factor = 1 + enrollment / 100.0
    
    return {
        "status": "success", 
        "message": "Cycle completed successfully.",
        "forecast_shift": enrollment,
        "conflict_change": 2 if payload.new_program else -1,
        "utilisation_delta": enrollment * 0.005,
        "before": mock_before,
        "after": {
            "forecast": int(mock_before["forecast"] * factor),
            "conflicts": max(0, mock_before["conflicts"] + (2 if payload.new_program else -1)),
            "utilisation": min(1.0, mock_before["utilisation"] + enrollment * 0.005)
        }
    }

@app.post("/api/feedback")
def submit_feedback(payload: Feedback):
    for p in state.proposals:
        if p["id"] == payload.proposal_id:
            p["status"] = payload.action
            return {"status": "success", "proposal": p}
            
    return {"status": "error", "message": "Proposal not found"}
