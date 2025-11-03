"""
Phase 4: Analytics & Attribution Tracking
Tracks QR codes, conversion funnels, campaign metrics, and attribution modeling.
"""
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import json
from collections import defaultdict


class TrackingEventType(Enum):
    """Event types for tracking"""
    QR_SCANNED = "qr_scanned"
    PAGE_VISIT = "page_visit"
    LEAD_CREATED = "lead_created"
    BOOKING_STARTED = "booking_started"
    PAYMENT_INITIATED = "payment_initiated"
    BOOKING_COMPLETED = "booking_completed"
    WHATSAPP_MESSAGE = "whatsapp_message"
    EMAIL_CLICKED = "email_clicked"
    REVIEW_SUBMITTED = "review_submitted"
    REFERRAL_COMPLETED = "referral_completed"


class AttributionModel(Enum):
    """Attribution models for multi-touch attribution"""
    FIRST_TOUCH = "first_touch"
    LAST_TOUCH = "last_touch"
    LINEAR = "linear"
    TIME_DECAY = "time_decay"
    POSITION_BASED = "position_based"


class Campaign:
    """Campaign definition"""
    def __init__(
        self,
        campaign_id: str,
        campaign_name: str,
        start_date: datetime,
        end_date: datetime,
        channel: str,
        budget: Optional[float] = None,
        target_audience: Optional[Dict] = None
    ):
        self.campaign_id = campaign_id
        self.campaign_name = campaign_name
        self.start_date = start_date
        self.end_date = end_date
        self.channel = channel  # "qr", "email", "whatsapp", "social"
        self.budget = budget
        self.target_audience = target_audience or {}
        self.created_at = timezone.now()


class AnalyticsEngine:
    """Main analytics and tracking engine"""
    
    def __init__(self):
        self.events = []  # All tracked events
        self.campaigns = {}  # Campaign data
        self.qr_codes = {}  # QR code tracking
        self.user_journeys = defaultdict(list)  # Journey tracking per user
        self.conversion_funnels = {}  # Funnel definitions
        self.attribution_data = defaultdict(dict)  # Attribution calculations
        
    def create_qr_campaign(
        self,
        campaign_id: str,
        campaign_name: str,
        trip_id: str,
        qr_data: Dict,
        start_date: datetime,
        end_date: datetime,
        budget: Optional[float] = None
    ) -> Dict:
        """
        Create a QR code tracking campaign
        
        Args:
            campaign_id: Unique campaign ID
            campaign_name: Human-readable name
            trip_id: Associated trek/stay ID
            qr_data: QR code metadata
            start_date: Campaign start
            end_date: Campaign end
            budget: Campaign budget
        
        Returns:
            Campaign configuration
        """
        campaign = Campaign(
            campaign_id=campaign_id,
            campaign_name=campaign_name,
            start_date=start_date,
            end_date=end_date,
            channel="qr",
            budget=budget,
            target_audience={"trip_id": trip_id}
        )
        
        self.campaigns[campaign_id] = {
            "campaign": campaign,
            "trip_id": trip_id,
            "qr_data": qr_data,
            "metrics": {
                "scans": 0,
                "unique_devices": set(),
                "leads_created": 0,
                "bookings_completed": 0,
                "revenue_generated": 0.0,
                "conversion_rate": 0.0,
                "cost_per_acquisition": 0.0
            }
        }
        
        return {
            "success": True,
            "campaign_id": campaign_id,
            "message": f"QR campaign '{campaign_name}' created"
        }
    
    def track_event(
        self,
        event_type: TrackingEventType,
        user_id: Optional[str] = None,
        phone: Optional[str] = None,
        campaign_id: Optional[str] = None,
        trip_id: Optional[str] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Track a user interaction event
        
        Args:
            event_type: Type of event
            user_id: User identifier
            phone: Phone number for WhatsApp tracking
            campaign_id: Associated campaign
            trip_id: Associated trip
            metadata: Additional event data
        
        Returns:
            Event tracking confirmation
        """
        event = {
            "event_id": f"evt_{int(timezone.now().timestamp())}",
            "event_type": event_type.value,
            "user_id": user_id,
            "phone": phone,
            "campaign_id": campaign_id,
            "trip_id": trip_id,
            "timestamp": timezone.now().isoformat(),
            "metadata": metadata or {}
        }
        
        self.events.append(event)
        
        # Track in campaign metrics
        if campaign_id and campaign_id in self.campaigns:
            self._update_campaign_metrics(campaign_id, event)
        
        # Track user journey
        journey_key = user_id or phone
        if journey_key:
            self.user_journeys[journey_key].append(event)
        
        return {
            "event_id": event["event_id"],
            "tracked": True,
            "timestamp": event["timestamp"]
        }
    
    def _update_campaign_metrics(self, campaign_id: str, event: Dict):
        """Update campaign metrics based on event"""
        campaign_data = self.campaigns[campaign_id]
        metrics = campaign_data["metrics"]
        
        if event["event_type"] == TrackingEventType.QR_SCANNED.value:
            metrics["scans"] += 1
            metrics["unique_devices"].add(event.get("device_id", "unknown"))
        
        elif event["event_type"] == TrackingEventType.LEAD_CREATED.value:
            metrics["leads_created"] += 1
        
        elif event["event_type"] == TrackingEventType.BOOKING_COMPLETED.value:
            metrics["bookings_completed"] += 1
            if "amount" in event.get("metadata", {}):
                metrics["revenue_generated"] += event["metadata"]["amount"]
        
        # Calculate conversion rate
        if metrics["scans"] > 0:
            metrics["conversion_rate"] = (
                metrics["bookings_completed"] / metrics["scans"]
            ) * 100
        
        # Calculate CPA
        if metrics["bookings_completed"] > 0:
            campaign_obj = campaign_data["campaign"]
            if campaign_obj.budget:
                metrics["cost_per_acquisition"] = (
                    campaign_obj.budget / metrics["bookings_completed"]
                )
    
    def get_qr_campaign_metrics(self, campaign_id: str) -> Dict:
        """Get detailed metrics for a QR campaign"""
        if campaign_id not in self.campaigns:
            return {"error": "Campaign not found"}
        
        campaign_data = self.campaigns[campaign_id]
        metrics = campaign_data["metrics"]
        
        return {
            "campaign_id": campaign_id,
            "campaign_name": campaign_data["campaign"].campaign_name,
            "total_scans": metrics["scans"],
            "unique_devices": len(metrics["unique_devices"]),
            "leads_generated": metrics["leads_created"],
            "bookings_completed": metrics["bookings_completed"],
            "revenue_generated": metrics["revenue_generated"],
            "conversion_rate": f"{metrics['conversion_rate']:.2f}%",
            "cost_per_acquisition": f"₹{metrics['cost_per_acquisition']:.2f}",
            "roi": self._calculate_roi(campaign_data) if campaign_data["campaign"].budget else None
        }
    
    def _calculate_roi(self, campaign_data: Dict) -> str:
        """Calculate ROI for campaign"""
        budget = campaign_data["campaign"].budget
        revenue = campaign_data["metrics"]["revenue_generated"]
        if budget > 0:
            roi = ((revenue - budget) / budget) * 100
            return f"{roi:.2f}%"
        return "N/A"
    
    def define_conversion_funnel(
        self,
        funnel_name: str,
        steps: List[TrackingEventType],
        time_window_hours: int = 72
    ) -> Dict:
        """
        Define a conversion funnel
        
        Args:
            funnel_name: Name of funnel (e.g., "booking_funnel")
            steps: Ordered list of conversion steps
            time_window_hours: Time window for completing funnel
        
        Returns:
            Funnel definition
        """
        self.conversion_funnels[funnel_name] = {
            "steps": [step.value for step in steps],
            "time_window_hours": time_window_hours,
            "created_at": timezone.now().isoformat()
        }
        
        return {
            "success": True,
            "funnel_name": funnel_name,
            "steps": len(steps),
            "time_window": f"{time_window_hours} hours"
        }
    
    def analyze_conversion_funnel(self, funnel_name: str) -> Dict:
        """
        Analyze conversion funnel performance
        
        Args:
            funnel_name: Name of funnel to analyze
        
        Returns:
            Funnel analysis with drop-off rates
        """
        if funnel_name not in self.conversion_funnels:
            return {"error": "Funnel not found"}
        
        funnel = self.conversion_funnels[funnel_name]
        steps = funnel["steps"]
        time_window = timedelta(hours=funnel["time_window_hours"])
        
        # Count users at each step
        step_counts = {step: 0 for step in steps}
        completed_funnel = 0
        
        for user_journey in self.user_journeys.values():
            journey_events = {e["event_type"]: e for e in user_journey}
            
            # Check if user completed steps in order within time window
            last_event_time = None
            step_completed = 0
            
            for step in steps:
                if step in journey_events:
                    event = journey_events[step]
                    event_time = datetime.fromisoformat(event["timestamp"])
                    
                    if last_event_time is None or (event_time - last_event_time) <= time_window:
                        step_counts[step] += 1
                        step_completed += 1
                        last_event_time = event_time
            
            if step_completed == len(steps):
                completed_funnel += 1
        
        # Calculate drop-off rates
        analysis = {
            "funnel_name": funnel_name,
            "total_entries": len(self.user_journeys),
            "steps": []
        }
        
        prev_count = len(self.user_journeys)
        for i, step in enumerate(steps):
            count = step_counts[step]
            drop_off = ((prev_count - count) / prev_count * 100) if prev_count > 0 else 0
            
            analysis["steps"].append({
                "step": i + 1,
                "event_type": step,
                "users": count,
                "drop_off_rate": f"{drop_off:.2f}%"
            })
            
            prev_count = count
        
        analysis["completed_funnel"] = completed_funnel
        analysis["completion_rate"] = (
            f"{(completed_funnel / len(self.user_journeys) * 100):.2f}%"
            if self.user_journeys else "0%"
        )
        
        return analysis
    
    def calculate_attribution(
        self,
        user_id: str,
        model: AttributionModel = AttributionModel.LINEAR
    ) -> Dict:
        """
        Calculate attribution for user's conversion events
        
        Args:
            user_id: User to analyze
            model: Attribution model to use
        
        Returns:
            Attribution breakdown
        """
        if user_id not in self.user_journeys:
            return {"error": "User not found"}
        
        journey = self.user_journeys[user_id]
        
        if model == AttributionModel.FIRST_TOUCH:
            return self._first_touch_attribution(journey)
        elif model == AttributionModel.LAST_TOUCH:
            return self._last_touch_attribution(journey)
        elif model == AttributionModel.LINEAR:
            return self._linear_attribution(journey)
        elif model == AttributionModel.TIME_DECAY:
            return self._time_decay_attribution(journey)
        elif model == AttributionModel.POSITION_BASED:
            return self._position_based_attribution(journey)
    
    def _first_touch_attribution(self, journey: List[Dict]) -> Dict:
        """100% credit to first touch"""
        if not journey:
            return {"error": "Empty journey"}
        
        first_event = journey[0]
        return {
            "model": "first_touch",
            "touchpoints": [{
                "event": first_event["event_type"],
                "campaign": first_event.get("campaign_id"),
                "credit": "100%",
                "timestamp": first_event["timestamp"]
            }]
        }
    
    def _last_touch_attribution(self, journey: List[Dict]) -> Dict:
        """100% credit to last touch"""
        if not journey:
            return {"error": "Empty journey"}
        
        last_event = journey[-1]
        return {
            "model": "last_touch",
            "touchpoints": [{
                "event": last_event["event_type"],
                "campaign": last_event.get("campaign_id"),
                "credit": "100%",
                "timestamp": last_event["timestamp"]
            }]
        }
    
    def _linear_attribution(self, journey: List[Dict]) -> Dict:
        """Equal credit to all touchpoints"""
        if not journey:
            return {"error": "Empty journey"}
        
        credit_per_touch = 100 / len(journey)
        touchpoints = []
        
        for event in journey:
            touchpoints.append({
                "event": event["event_type"],
                "campaign": event.get("campaign_id"),
                "credit": f"{credit_per_touch:.2f}%",
                "timestamp": event["timestamp"]
            })
        
        return {
            "model": "linear",
            "touchpoints": touchpoints
        }
    
    def _time_decay_attribution(self, journey: List[Dict]) -> Dict:
        """More credit to recent touchpoints"""
        if not journey:
            return {"error": "Empty journey"}
        
        # Exponential decay: later events get more credit
        weights = []
        for i in range(len(journey)):
            weight = 2 ** i
            weights.append(weight)
        
        total_weight = sum(weights)
        touchpoints = []
        
        for i, event in enumerate(journey):
            credit = (weights[i] / total_weight) * 100
            touchpoints.append({
                "event": event["event_type"],
                "campaign": event.get("campaign_id"),
                "credit": f"{credit:.2f}%",
                "timestamp": event["timestamp"]
            })
        
        return {
            "model": "time_decay",
            "touchpoints": touchpoints
        }
    
    def _position_based_attribution(self, journey: List[Dict]) -> Dict:
        """40% first, 40% last, 20% middle"""
        if not journey:
            return {"error": "Empty journey"}
        
        if len(journey) == 1:
            credit_each = 100.0
            touchpoints = [{
                "event": journey[0]["event_type"],
                "campaign": journey[0].get("campaign_id"),
                "credit": "100%",
                "timestamp": journey[0]["timestamp"]
            }]
        
        elif len(journey) == 2:
            touchpoints = [
                {
                    "event": journey[0]["event_type"],
                    "campaign": journey[0].get("campaign_id"),
                    "credit": "50%",
                    "timestamp": journey[0]["timestamp"]
                },
                {
                    "event": journey[-1]["event_type"],
                    "campaign": journey[-1].get("campaign_id"),
                    "credit": "50%",
                    "timestamp": journey[-1]["timestamp"]
                }
            ]
        
        else:
            middle_credit = 20 / (len(journey) - 2)
            touchpoints = []
            
            # First touch
            touchpoints.append({
                "event": journey[0]["event_type"],
                "campaign": journey[0].get("campaign_id"),
                "credit": "40%",
                "timestamp": journey[0]["timestamp"]
            })
            
            # Middle touches
            for event in journey[1:-1]:
                touchpoints.append({
                    "event": event["event_type"],
                    "campaign": event.get("campaign_id"),
                    "credit": f"{middle_credit:.2f}%",
                    "timestamp": event["timestamp"]
                })
            
            # Last touch
            touchpoints.append({
                "event": journey[-1]["event_type"],
                "campaign": journey[-1].get("campaign_id"),
                "credit": "40%",
                "timestamp": journey[-1]["timestamp"]
            })
        
        return {
            "model": "position_based",
            "touchpoints": touchpoints
        }
    
    def get_campaign_summary(self) -> Dict:
        """Get summary of all active campaigns"""
        summary = {
            "total_campaigns": len(self.campaigns),
            "campaigns": [],
            "total_revenue": 0.0,
            "average_conversion_rate": 0.0
        }
        
        conversion_rates = []
        
        for campaign_id, campaign_data in self.campaigns.items():
            metrics = campaign_data["metrics"]
            summary["campaigns"].append({
                "campaign_id": campaign_id,
                "campaign_name": campaign_data["campaign"].campaign_name,
                "channel": campaign_data["campaign"].channel,
                "scans": metrics["scans"],
                "leads": metrics["leads_created"],
                "bookings": metrics["bookings_completed"],
                "revenue": metrics["revenue_generated"],
                "conversion_rate": f"{metrics['conversion_rate']:.2f}%"
            })
            
            summary["total_revenue"] += metrics["revenue_generated"]
            if metrics["conversion_rate"] > 0:
                conversion_rates.append(metrics["conversion_rate"])
        
        if conversion_rates:
            summary["average_conversion_rate"] = f"{sum(conversion_rates) / len(conversion_rates):.2f}%"
        
        return summary


def get_analytics_engine() -> AnalyticsEngine:
    """Factory function for analytics engine singleton"""
    if not hasattr(get_analytics_engine, '_instance'):
        get_analytics_engine._instance = AnalyticsEngine()
    return get_analytics_engine._instance
