"""
Phase 5: Lead Nurturing & Automation System
Automated workflows for lead nurturing, follow-ups, and task management.
"""
from django.utils import timezone
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from enum import Enum
import json


class WorkflowType(Enum):
    """Workflow types"""
    BOOKING_ABANDONED = "booking_abandoned"
    PAYMENT_PENDING = "payment_pending"
    LEAD_COLD = "lead_cold"
    REFERRAL_NURTURE = "referral_nurture"
    REVIEW_REQUEST = "review_request"
    UPSELL = "upsell"
    WINBACK = "winback"


class TaskPriority(Enum):
    """Task priority levels"""
    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


class NurturingWorkflow:
    """Lead nurturing workflow automation"""
    
    def __init__(self):
        self.workflows = {}
        self.automation_rules = {}
        self.task_queue = []
        self.completed_tasks = []
        self.workflow_history = []
        
    def create_workflow(
        self,
        workflow_id: str,
        workflow_type: WorkflowType,
        trigger_condition: Dict,
        actions: List[Dict],
        duration_days: int = 14,
        active: bool = True
    ) -> Dict:
        """
        Create an automation workflow
        
        Args:
            workflow_id: Unique workflow identifier
            workflow_type: Type of workflow
            trigger_condition: Condition to trigger workflow
            actions: List of actions to execute
            duration_days: Duration for workflow
            active: Is workflow active
        
        Returns:
            Workflow configuration
        """
        workflow = {
            "workflow_id": workflow_id,
            "workflow_type": workflow_type.value,
            "trigger_condition": trigger_condition,
            "actions": actions,
            "duration_days": duration_days,
            "active": active,
            "created_at": timezone.now().isoformat(),
            "execution_count": 0,
            "success_rate": 0.0
        }
        
        self.workflows[workflow_id] = workflow
        return workflow
    
    def trigger_workflow(
        self,
        lead_id: str,
        phone: str,
        workflow_id: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Trigger a workflow for a lead
        
        Args:
            lead_id: Lead ID
            phone: Phone number
            workflow_id: Workflow to trigger
            metadata: Additional metadata
        
        Returns:
            Workflow execution result
        """
        if workflow_id not in self.workflows:
            return {"success": False, "error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        if not workflow["active"]:
            return {"success": False, "error": "Workflow is inactive"}
        
        execution = {
            "execution_id": f"exec_{workflow_id}_{lead_id}_{int(timezone.now().timestamp())}",
            "lead_id": lead_id,
            "phone": phone,
            "workflow_id": workflow_id,
            "workflow_type": workflow["workflow_type"],
            "triggered_at": timezone.now().isoformat(),
            "tasks_created": 0,
            "actions": []
        }
        
        # Execute workflow actions
        for action in workflow["actions"]:
            task = self._execute_action(
                lead_id=lead_id,
                phone=phone,
                action=action,
                metadata=metadata
            )
            execution["actions"].append(task)
            execution["tasks_created"] += 1
        
        workflow["execution_count"] += 1
        self.workflow_history.append(execution)
        
        return {
            "success": True,
            "execution_id": execution["execution_id"],
            "tasks_created": execution["tasks_created"]
        }
    
    def _execute_action(
        self,
        lead_id: str,
        phone: str,
        action: Dict,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Execute a single workflow action"""
        action_type = action.get("type", "whatsapp")
        
        if action_type == "whatsapp":
            return self._send_whatsapp(lead_id, phone, action, metadata)
        elif action_type == "email":
            return self._send_email(lead_id, phone, action, metadata)
        elif action_type == "create_task":
            return self._create_task(lead_id, action, metadata)
        elif action_type == "assign_sales_rep":
            return self._assign_sales_rep(lead_id, action)
        elif action_type == "create_follow_up":
            return self._create_follow_up(lead_id, action)
        
        return {"success": False, "action_type": action_type}
    
    def _send_whatsapp(self, lead_id: str, phone: str, action: Dict, metadata: Optional[Dict]) -> Dict:
        """Create WhatsApp send task"""
        return {
            "type": "whatsapp",
            "lead_id": lead_id,
            "phone": phone,
            "template": action.get("template"),
            "status": "queued",
            "created_at": timezone.now().isoformat()
        }
    
    def _send_email(self, lead_id: str, phone: str, action: Dict, metadata: Optional[Dict]) -> Dict:
        """Create email send task"""
        return {
            "type": "email",
            "lead_id": lead_id,
            "template": action.get("template"),
            "status": "queued",
            "created_at": timezone.now().isoformat()
        }
    
    def _create_task(self, lead_id: str, action: Dict, metadata: Optional[Dict]) -> Dict:
        """Create follow-up task"""
        task = {
            "task_id": f"task_{lead_id}_{int(timezone.now().timestamp())}",
            "lead_id": lead_id,
            "title": action.get("title"),
            "description": action.get("description"),
            "priority": action.get("priority", "MEDIUM"),
            "due_date": self._calculate_due_date(action.get("due_in_days", 3)),
            "status": "pending",
            "created_at": timezone.now().isoformat()
        }
        
        self.task_queue.append(task)
        return task
    
    def _assign_sales_rep(self, lead_id: str, action: Dict) -> Dict:
        """Assign lead to sales representative"""
        return {
            "type": "assign_sales_rep",
            "lead_id": lead_id,
            "sales_rep_id": action.get("sales_rep_id"),
            "status": "assigned",
            "assigned_at": timezone.now().isoformat()
        }
    
    def _create_follow_up(self, lead_id: str, action: Dict) -> Dict:
        """Create follow-up appointment"""
        return {
            "type": "follow_up",
            "lead_id": lead_id,
            "scheduled_date": self._calculate_due_date(action.get("follow_up_in_days", 5)),
            "status": "scheduled",
            "created_at": timezone.now().isoformat()
        }
    
    def _calculate_due_date(self, days: int) -> str:
        """Calculate due date from days"""
        due_date = timezone.now() + timedelta(days=days)
        return due_date.isoformat()
    
    def get_pending_tasks(self, limit: int = 20) -> List[Dict]:
        """Get pending tasks"""
        pending = [t for t in self.task_queue if t["status"] == "pending"]
        return sorted(
            pending,
            key=lambda x: (
                {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 3, "LOW": 4}.get(
                    x.get("priority", "MEDIUM"), 4
                ),
                x.get("due_date", "")
            )
        )[:limit]
    
    def complete_task(self, task_id: str, notes: Optional[str] = None) -> Dict:
        """Mark task as complete"""
        task = None
        for t in self.task_queue:
            if t["task_id"] == task_id:
                task = t
                break
        
        if not task:
            return {"success": False, "error": "Task not found"}
        
        task["status"] = "completed"
        task["completed_at"] = timezone.now().isoformat()
        task["completion_notes"] = notes
        
        self.task_queue.remove(task)
        self.completed_tasks.append(task)
        
        return {"success": True, "task_id": task_id}
    
    def get_workflow_performance(self, workflow_id: str) -> Dict:
        """Get performance metrics for workflow"""
        if workflow_id not in self.workflows:
            return {"error": "Workflow not found"}
        
        workflow = self.workflows[workflow_id]
        executions = [e for e in self.workflow_history if e["workflow_id"] == workflow_id]
        
        success_count = len([e for e in executions if all(a.get("status") != "failed" for a in e["actions"])])
        
        return {
            "workflow_id": workflow_id,
            "total_executions": workflow["execution_count"],
            "successful": success_count,
            "success_rate": (success_count / workflow["execution_count"] * 100) if workflow["execution_count"] > 0 else 0,
            "avg_tasks_per_execution": (
                sum(e["tasks_created"] for e in executions) / len(executions)
                if executions else 0
            )
        }


class AbandonedBookingRecovery:
    """Specific workflow for abandoned booking recovery"""
    
    @staticmethod
    def get_abandoned_booking_workflow() -> Dict:
        """Get abandoned booking recovery workflow"""
        return {
            "workflow_id": "abandoned_booking_recovery",
            "workflow_type": WorkflowType.BOOKING_ABANDONED.value,
            "trigger_condition": {
                "event": "booking_started",
                "days_without_completion": 2
            },
            "actions": [
                {
                    "type": "whatsapp",
                    "template": "booking_abandoned_reminder_1",
                    "delay_hours": 0
                },
                {
                    "type": "create_task",
                    "title": "Follow up on abandoned booking",
                    "priority": "HIGH",
                    "due_in_days": 1
                },
                {
                    "type": "whatsapp",
                    "template": "booking_abandoned_incentive",
                    "delay_hours": 24
                },
                {
                    "type": "email",
                    "template": "booking_abandoned_recovery",
                    "delay_hours": 48
                }
            ],
            "duration_days": 7
        }


class LeadNurturingSequence:
    """Multi-step lead nurturing sequences"""
    
    def __init__(self):
        self.sequences = {}
        self.sequence_progress = {}
    
    def create_nurture_sequence(
        self,
        sequence_id: str,
        sequence_name: str,
        steps: List[Dict]
    ) -> Dict:
        """
        Create a multi-step nurturing sequence
        
        Args:
            sequence_id: Unique sequence ID
            sequence_name: Name of sequence
            steps: List of sequential steps
        
        Returns:
            Sequence configuration
        """
        self.sequences[sequence_id] = {
            "sequence_id": sequence_id,
            "sequence_name": sequence_name,
            "steps": steps,
            "created_at": timezone.now().isoformat(),
            "total_steps": len(steps)
        }
        
        return self.sequences[sequence_id]
    
    def enroll_lead_in_sequence(
        self,
        lead_id: str,
        sequence_id: str
    ) -> Dict:
        """Enroll a lead in nurturing sequence"""
        if sequence_id not in self.sequences:
            return {"success": False, "error": "Sequence not found"}
        
        enrollment_id = f"enr_{lead_id}_{sequence_id}_{int(timezone.now().timestamp())}"
        
        self.sequence_progress[enrollment_id] = {
            "enrollment_id": enrollment_id,
            "lead_id": lead_id,
            "sequence_id": sequence_id,
            "current_step": 0,
            "status": "active",
            "enrolled_at": timezone.now().isoformat(),
            "completed_steps": []
        }
        
        return {
            "success": True,
            "enrollment_id": enrollment_id,
            "sequence_id": sequence_id,
            "steps": len(self.sequences[sequence_id]["steps"])
        }
    
    def advance_sequence(self, enrollment_id: str) -> Dict:
        """Move to next step in sequence"""
        if enrollment_id not in self.sequence_progress:
            return {"success": False, "error": "Enrollment not found"}
        
        progress = self.sequence_progress[enrollment_id]
        sequence = self.sequences[progress["sequence_id"]]
        
        if progress["current_step"] >= len(sequence["steps"]):
            progress["status"] = "completed"
            return {
                "success": True,
                "status": "sequence_completed",
                "enrollment_id": enrollment_id
            }
        
        current_step = sequence["steps"][progress["current_step"]]
        progress["current_step"] += 1
        progress["completed_steps"].append(current_step)
        
        return {
            "success": True,
            "current_step": progress["current_step"],
            "total_steps": len(sequence["steps"]),
            "step_data": current_step
        }
    
    def get_sequence_progress(self, enrollment_id: str) -> Dict:
        """Get progress in nurturing sequence"""
        if enrollment_id not in self.sequence_progress:
            return {"error": "Enrollment not found"}
        
        progress = self.sequence_progress[enrollment_id]
        sequence = self.sequences[progress["sequence_id"]]
        
        return {
            "enrollment_id": enrollment_id,
            "sequence_name": sequence["sequence_name"],
            "current_step": progress["current_step"],
            "total_steps": sequence["total_steps"],
            "percentage_complete": (progress["current_step"] / sequence["total_steps"] * 100),
            "status": progress["status"],
            "completed_steps": len(progress["completed_steps"])
        }


def get_nurturing_workflow() -> NurturingWorkflow:
    """Factory function for workflow singleton"""
    if not hasattr(get_nurturing_workflow, '_instance'):
        get_nurturing_workflow._instance = NurturingWorkflow()
    return get_nurturing_workflow._instance


def get_nurturing_service() -> NurturingWorkflow:
    """Factory function for workflow singleton - alias for get_nurturing_workflow"""
    return get_nurturing_workflow()
