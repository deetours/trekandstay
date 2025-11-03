"""
Phase 5: Lead Automation & Nurturing
Automated workflows for lead nurturing, follow-ups, and booking recovery.
"""
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Callable
from enum import Enum
import json


class WorkflowState(Enum):
    """Workflow execution states"""
    PENDING = "pending"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    FAILED = "failed"


class TriggerType(Enum):
    """Workflow trigger types"""
    NEW_LEAD = "new_lead"
    BOOKING_ABANDONED = "booking_abandoned"
    LEAD_INACTIVE = "lead_inactive"
    PAYMENT_PENDING = "payment_pending"
    LOW_ENGAGEMENT = "low_engagement"
    REVIEW_REQUEST = "review_request"
    REFERRAL_OPPORTUNITY = "referral_opportunity"


class ActionType(Enum):
    """Automation action types"""
    SEND_WHATSAPP = "send_whatsapp"
    SEND_EMAIL = "send_email"
    CREATE_TASK = "create_task"
    UPDATE_LEAD = "update_lead"
    AWARD_POINTS = "award_points"
    SEND_TEMPLATE = "send_template"
    ESCALATE_TO_HUMAN = "escalate_to_human"


class LeadNurturingWorkflow:
    """Define and manage automated lead nurturing workflows"""
    
    def __init__(self):
        self.workflows = {}  # Store workflow definitions
        self.active_workflows = {}  # Running workflow instances
        self.workflow_history = []  # Execution history
        self.automation_rules = {}  # Rule conditions
        
    def create_workflow(
        self,
        workflow_id: str,
        workflow_name: str,
        trigger: TriggerType,
        actions: List[Dict],
        conditions: Optional[Dict] = None,
        enabled: bool = True
    ) -> Dict:
        """
        Create an automated workflow
        
        Args:
            workflow_id: Unique identifier
            workflow_name: Human-readable name
            trigger: What triggers this workflow
            actions: List of actions to execute
            conditions: Additional conditions to check
            enabled: Whether workflow is active
        
        Returns:
            Workflow configuration
        """
        workflow = {
            "workflow_id": workflow_id,
            "workflow_name": workflow_name,
            "trigger": trigger.value,
            "actions": actions,
            "conditions": conditions or {},
            "enabled": enabled,
            "created_at": timezone.now().isoformat(),
            "execution_count": 0,
            "success_count": 0,
            "failure_count": 0,
            "state": WorkflowState.PENDING.value
        }
        
        self.workflows[workflow_id] = workflow
        return workflow
    
    def create_nurturing_sequence(
        self,
        sequence_id: str,
        sequence_name: str,
        steps: List[Dict],
        delay_hours_between_steps: int = 24
    ) -> Dict:
        """
        Create a multi-step nurturing sequence
        
        Args:
            sequence_id: Unique ID
            sequence_name: Name of sequence
            steps: List of action steps
            delay_hours_between_steps: Delay between steps
        
        Returns:
            Sequence configuration
        """
        sequence = {
            "sequence_id": sequence_id,
            "sequence_name": sequence_name,
            "steps": steps,
            "delay_hours": delay_hours_between_steps,
            "created_at": timezone.now().isoformat(),
            "total_leads_processed": 0,
            "completion_rate": 0.0
        }
        
        self.workflows[sequence_id] = sequence
        return sequence
    
    def get_abandoned_booking_workflow(self) -> Dict:
        """Get pre-configured abandoned booking recovery workflow"""
        return {
            "workflow_id": "abandon_booking_recovery",
            "workflow_name": "Abandoned Booking Recovery",
            "trigger": TriggerType.BOOKING_ABANDONED.value,
            "actions": [
                {
                    "action_type": ActionType.SEND_WHATSAPP.value,
                    "delay_minutes": 30,
                    "template": "booking_abandoned_reminder_1",
                    "variables": {"trip_name": "{{trip}}", "discount": "{{discount}}"}
                },
                {
                    "action_type": ActionType.SEND_EMAIL.value,
                    "delay_minutes": 120,
                    "template": "booking_abandoned_email",
                    "variables": {"link": "{{booking_link}}", "discount_code": "{{code}}"}
                },
                {
                    "action_type": ActionType.CREATE_TASK.value,
                    "delay_minutes": 1440,  # 1 day
                    "task_title": "Follow up on abandoned booking",
                    "priority": "high"
                },
                {
                    "action_type": ActionType.SEND_WHATSAPP.value,
                    "delay_minutes": 2880,  # 2 days
                    "template": "booking_abandoned_reminder_2",
                    "variables": {"offer": "{{special_offer}}"}
                }
            ],
            "conditions": {
                "min_bounce_time_hours": 0.5,
                "max_bounce_time_hours": 72
            }
        }
    
    def get_new_lead_nurturing_workflow(self) -> Dict:
        """Get pre-configured new lead nurturing workflow"""
        return {
            "workflow_id": "new_lead_nurture",
            "workflow_name": "New Lead Nurturing",
            "trigger": TriggerType.NEW_LEAD.value,
            "actions": [
                {
                    "action_type": ActionType.SEND_WHATSAPP.value,
                    "delay_minutes": 5,
                    "template": "welcome_message",
                    "variables": {"name": "{{customer_name}}"}
                },
                {
                    "action_type": ActionType.SEND_EMAIL.value,
                    "delay_minutes": 60,
                    "template": "welcome_email",
                    "variables": {"email": "{{email}}", "id": "{{lead_id}}"}
                },
                {
                    "action_type": ActionType.AWARD_POINTS.value,
                    "delay_minutes": 10,
                    "points": 100,
                    "reason": "Welcome bonus"
                },
                {
                    "action_type": ActionType.SEND_WHATSAPP.value,
                    "delay_minutes": 1440,  # 1 day
                    "template": "personalized_offer",
                    "variables": {"offer": "{{personalized_offer}}"}
                }
            ]
        }
    
    def get_inactive_lead_reengagement_workflow(self) -> Dict:
        """Get pre-configured inactive lead re-engagement workflow"""
        return {
            "workflow_id": "reengagement_inactive",
            "workflow_name": "Re-engage Inactive Leads",
            "trigger": TriggerType.LEAD_INACTIVE.value,
            "actions": [
                {
                    "action_type": ActionType.SEND_WHATSAPP.value,
                    "delay_minutes": 0,
                    "template": "comeback_offer",
                    "variables": {"days_inactive": "{{days}}", "discount": "30"}
                },
                {
                    "action_type": ActionType.SEND_EMAIL.value,
                    "delay_minutes": 1440,  # 1 day
                    "template": "exclusive_offer",
                    "variables": {"offer": "{{exclusive_offer}}"}
                },
                {
                    "action_type": ActionType.CREATE_TASK.value,
                    "delay_minutes": 2880,  # 2 days
                    "task_title": "Call inactive lead",
                    "priority": "medium"
                }
            ],
            "conditions": {
                "min_days_inactive": 7,
                "max_days_inactive": 90
            }
        }
    
    def execute_workflow_for_lead(
        self,
        workflow_id: str,
        lead_id: str,
        lead_data: Dict,
        execution_context: Optional[Dict] = None
    ) -> Dict:
        """
        Execute a workflow for a specific lead
        
        Args:
            workflow_id: Workflow to execute
            lead_id: Lead to process
            lead_data: Lead information
            execution_context: Additional context
        
        Returns:
            Execution result
        """
        if workflow_id not in self.workflows:
            return {"success": False, "error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        
        if not workflow["enabled"]:
            return {"success": False, "error": "Workflow is disabled"}
        
        # Create execution instance
        execution_id = f"exec_{workflow_id}_{lead_id}_{int(timezone.now().timestamp())}"
        
        execution = {
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "lead_id": lead_id,
            "state": WorkflowState.ACTIVE.value,
            "started_at": timezone.now().isoformat(),
            "actions_executed": [],
            "actions_pending": list(range(len(workflow["actions"]))),
            "context": execution_context or {}
        }
        
        self.active_workflows[execution_id] = execution
        
        # Track in history
        self.workflow_history.append({
            "execution_id": execution_id,
            "workflow_id": workflow_id,
            "lead_id": lead_id,
            "status": "started",
            "timestamp": timezone.now().isoformat()
        })
        
        # Update workflow stats
        workflow["execution_count"] += 1
        
        return {
            "success": True,
            "execution_id": execution_id,
            "workflow": workflow["workflow_name"],
            "lead": lead_id,
            "status": "started",
            "actions_count": len(workflow["actions"])
        }
    
    def execute_workflow_action(
        self,
        execution_id: str,
        action_index: int
    ) -> Dict:
        """Execute a single action in a workflow"""
        if execution_id not in self.active_workflows:
            return {"error": "Execution not found"}
        
        execution = self.active_workflows[execution_id]
        workflow = self.workflows[execution["workflow_id"]]
        
        if action_index >= len(workflow["actions"]):
            return {"error": "Invalid action index"}
        
        action = workflow["actions"][action_index]
        result = self._execute_action(action, execution)
        
        execution["actions_executed"].append({
            "action_index": action_index,
            "action_type": action.get("action_type"),
            "status": result.get("status"),
            "executed_at": timezone.now().isoformat()
        })
        
        execution["actions_pending"].remove(action_index)
        
        # Check if workflow complete
        if len(execution["actions_pending"]) == 0:
            execution["state"] = WorkflowState.COMPLETED.value
            execution["completed_at"] = timezone.now().isoformat()
            workflow["success_count"] += 1
        
        return result
    
    def _execute_action(self, action: Dict, execution: Dict) -> Dict:
        """Execute a single action"""
        action_type = action.get("action_type")
        
        if action_type == ActionType.SEND_WHATSAPP.value:
            return {
                "action_type": action_type,
                "status": "executed",
                "message": f"WhatsApp message queued",
                "template": action.get("template")
            }
        
        elif action_type == ActionType.SEND_EMAIL.value:
            return {
                "action_type": action_type,
                "status": "executed",
                "message": f"Email queued",
                "template": action.get("template")
            }
        
        elif action_type == ActionType.CREATE_TASK.value:
            return {
                "action_type": action_type,
                "status": "executed",
                "task_id": f"task_{int(timezone.now().timestamp())}",
                "title": action.get("task_title"),
                "priority": action.get("priority")
            }
        
        elif action_type == ActionType.AWARD_POINTS.value:
            return {
                "action_type": action_type,
                "status": "executed",
                "points": action.get("points"),
                "reason": action.get("reason")
            }
        
        elif action_type == ActionType.ESCALATE_TO_HUMAN.value:
            return {
                "action_type": action_type,
                "status": "escalated",
                "message": "Lead escalated to human agent"
            }
        
        return {"status": "unknown", "error": f"Unknown action type: {action_type}"}
    
    def get_workflow_status(self, execution_id: str) -> Dict:
        """Get status of an active workflow execution"""
        if execution_id not in self.active_workflows:
            return {"error": "Execution not found"}
        
        execution = self.active_workflows[execution_id]
        return {
            "execution_id": execution_id,
            "workflow_id": execution["workflow_id"],
            "lead_id": execution["lead_id"],
            "state": execution["state"],
            "actions_completed": len(execution["actions_executed"]),
            "actions_pending": len(execution["actions_pending"]),
            "started_at": execution["started_at"],
            "completed_at": execution.get("completed_at")
        }
    
    def get_workflow_metrics(self, workflow_id: str) -> Dict:
        """Get performance metrics for a workflow"""
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        total = workflow["execution_count"]
        success = workflow["success_count"]
        failed = workflow["failure_count"]
        
        return {
            "workflow_id": workflow_id,
            "workflow_name": workflow["workflow_name"],
            "total_executions": total,
            "successful": success,
            "failed": failed,
            "success_rate": f"{(success/total*100):.2f}%" if total > 0 else "0%",
            "created_at": workflow["created_at"]
        }


def get_lead_nurturing_service() -> LeadNurturingWorkflow:
    """Factory function for lead nurturing singleton"""
    if not hasattr(get_lead_nurturing_service, '_instance'):
        get_lead_nurturing_service._instance = LeadNurturingWorkflow()
    return get_lead_nurturing_service._instance
