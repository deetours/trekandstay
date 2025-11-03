"""
Phase 3: WhatsApp Message Templates Service
Handles Meta-approved template management, variable substitution, and approval workflow.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from enum import Enum
import json
import re
from typing import Dict, List, Optional, Tuple


class TemplateCategory(Enum):
    """Template categories for organization"""
    TRANSACTIONAL = "transactional"
    PROMOTIONAL = "promotional"
    NOTIFICATION = "notification"
    SUPPORT = "support"


class TemplateApprovalStatus(Enum):
    """Meta approval statuses"""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    REJECTED = "rejected"
    PENDING = "pending"


class MessageTemplate:
    """WhatsApp approved message template management"""
    
    def __init__(self):
        self.templates = {}
        self.meta_template_ids = {}
        self.approval_cache = {}
        
    def create_template(
        self, 
        template_name: str,
        category: TemplateCategory,
        body: str,
        header: Optional[str] = None,
        footer: Optional[str] = None,
        buttons: Optional[List[Dict]] = None,
        variables: Optional[List[str]] = None,
        language: str = "en"
    ) -> Dict:
        """
        Create a new message template
        
        Args:
            template_name: Unique template identifier
            category: Template category (transactional, promotional, etc)
            body: Main message body text
            header: Optional header (text, image, or document)
            footer: Optional footer text
            buttons: Optional list of quick reply/URL buttons
            variables: List of variables like {{1}}, {{2}}
            language: Language code (default: en)
        
        Returns:
            Template configuration dict
        """
        # Validate template format
        self._validate_template_format(body, header, footer)
        
        # Extract variables if not provided
        if not variables:
            variables = self._extract_variables(body, header, footer)
        
        template_config = {
            "template_id": f"template_{template_name}_{int(timezone.now().timestamp())}",
            "name": template_name,
            "category": category.value,
            "language": language,
            "status": TemplateApprovalStatus.DRAFT.value,
            "header": header,
            "body": body,
            "footer": footer,
            "buttons": buttons or [],
            "variables": variables,
            "variable_count": len(variables),
            "created_at": timezone.now().isoformat(),
            "meta_template_id": None,
            "approval_status": "draft",
            "rejection_reason": None,
        }
        
        self.templates[template_name] = template_config
        return template_config
    
    def _validate_template_format(
        self, 
        body: str, 
        header: Optional[str] = None, 
        footer: Optional[str] = None
    ) -> Tuple[bool, str]:
        """Validate template follows Meta guidelines"""
        errors = []
        
        # Body length check (max 1024 chars)
        if len(body) > 1024:
            errors.append("Body exceeds 1024 characters")
        
        # Header check
        if header and len(header) > 60:
            errors.append("Header exceeds 60 characters")
        
        # Footer check
        if footer and len(footer) > 60:
            errors.append("Footer exceeds 60 characters")
        
        # No invalid characters
        invalid_chars = ['<', '>', '{', '}']  # Except variables
        if any(char in body for char in invalid_chars if "{{" not in body):
            errors.append("Body contains invalid characters")
        
        if errors:
            return False, "; ".join(errors)
        return True, "Valid"
    
    def _extract_variables(
        self, 
        body: str, 
        header: Optional[str] = None,
        footer: Optional[str] = None
    ) -> List[str]:
        """Extract {{1}}, {{2}} style variables from template text"""
        text = f"{header or ''} {body} {footer or ''}"
        pattern = r'\{\{(\d+)\}\}'
        matches = re.findall(pattern, text)
        return sorted(list(set(matches)))  # Unique and sorted
    
    def substitute_variables(
        self,
        template_name: str,
        variable_values: Dict[str, str]
    ) -> Tuple[Optional[str], Optional[str]]:
        """
        Substitute variables in template with actual values
        
        Args:
            template_name: Name of template to use
            variable_values: Dict of variable replacements {1: "John", 2: "Trek"}
        
        Returns:
            Tuple of (message_text, error_message)
        """
        if template_name not in self.templates:
            return None, f"Template '{template_name}' not found"
        
        template = self.templates[template_name]
        body = template["body"]
        
        # Validate all required variables provided
        required_vars = template["variables"]
        provided_vars = set(str(k) for k in variable_values.keys())
        required_set = set(required_vars)
        
        missing_vars = required_set - provided_vars
        if missing_vars:
            return None, f"Missing variables: {missing_vars}"
        
        # Substitute variables
        message = body
        for var_num, var_value in variable_values.items():
            message = message.replace(
                f"{{{{{var_num}}}}}",
                str(var_value)
            )
        
        # Validate no unreplaced variables remain
        unreplaced = re.findall(r'\{\{(\d+)\}\}', message)
        if unreplaced:
            return None, f"Failed to substitute variables: {unreplaced}"
        
        return message, None
    
    def submit_for_approval(
        self,
        template_name: str,
        meta_business_account_id: str
    ) -> Dict:
        """
        Submit template to Meta for approval
        
        Args:
            template_name: Template to submit
            meta_business_account_id: Meta business account ID
        
        Returns:
            Submission status dict
        """
        if template_name not in self.templates:
            return {"success": False, "error": "Template not found"}
        
        template = self.templates[template_name]
        
        # Validate before submission
        valid, error = self._validate_template_format(
            template["body"],
            template["header"],
            template["footer"]
        )
        
        if not valid:
            return {"success": False, "error": error}
        
        # Simulate Meta API call
        meta_payload = {
            "name": template["name"],
            "language": template["language"],
            "category": template["category"],
            "components": self._build_meta_components(template)
        }
        
        # Store approval request
        approval_id = f"approval_{template_name}_{int(timezone.now().timestamp())}"
        self.approval_cache[approval_id] = {
            "template_name": template_name,
            "status": TemplateApprovalStatus.SUBMITTED.value,
            "submitted_at": timezone.now().isoformat(),
            "meta_payload": meta_payload,
            "meta_business_account_id": meta_business_account_id
        }
        
        # Update template status
        template["status"] = TemplateApprovalStatus.SUBMITTED.value
        template["approval_id"] = approval_id
        
        return {
            "success": True,
            "approval_id": approval_id,
            "status": "submitted",
            "message": f"Template '{template_name}' submitted for approval"
        }
    
    def _build_meta_components(self, template: Dict) -> List[Dict]:
        """Build Meta component format for API submission"""
        components = []
        
        # Header component
        if template["header"]:
            components.append({
                "type": "HEADER",
                "format": "TEXT",
                "text": template["header"]
            })
        
        # Body component
        body_component = {
            "type": "BODY",
            "text": template["body"]
        }
        
        # Add parameters if variables exist
        if template["variables"]:
            body_component["parameters"] = [
                {"type": "text"} for _ in template["variables"]
            ]
        
        components.append(body_component)
        
        # Footer component
        if template["footer"]:
            components.append({
                "type": "FOOTER",
                "text": template["footer"]
            })
        
        # Buttons component
        if template["buttons"]:
            components.append({
                "type": "BUTTONS",
                "buttons": template["buttons"]
            })
        
        return components
    
    def check_approval_status(
        self,
        approval_id: str
    ) -> Dict:
        """Check approval status of submitted template"""
        if approval_id not in self.approval_cache:
            return {"error": "Approval ID not found"}
        
        approval = self.approval_cache[approval_id]
        
        return {
            "approval_id": approval_id,
            "template_name": approval["template_name"],
            "status": approval["status"],
            "submitted_at": approval["submitted_at"],
            "meta_template_id": approval.get("meta_template_id"),
            "rejection_reason": approval.get("rejection_reason")
        }
    
    def update_approval_status(
        self,
        approval_id: str,
        status: TemplateApprovalStatus,
        meta_template_id: Optional[str] = None,
        rejection_reason: Optional[str] = None
    ) -> Dict:
        """Update approval status (called by webhook from Meta)"""
        if approval_id not in self.approval_cache:
            return {"error": "Approval ID not found"}
        
        approval = self.approval_cache[approval_id]
        approval["status"] = status.value
        
        template_name = approval["template_name"]
        template = self.templates[template_name]
        template["status"] = status.value
        
        if status == TemplateApprovalStatus.APPROVED:
            template["meta_template_id"] = meta_template_id
            self.meta_template_ids[template_name] = meta_template_id
            approval["meta_template_id"] = meta_template_id
        
        if status == TemplateApprovalStatus.REJECTED:
            template["rejection_reason"] = rejection_reason
            approval["rejection_reason"] = rejection_reason
        
        return {
            "success": True,
            "approval_id": approval_id,
            "new_status": status.value,
            "template_name": template_name
        }
    
    def get_approved_templates(self) -> List[Dict]:
        """Get all approved templates ready to send"""
        approved = []
        for name, template in self.templates.items():
            if template["status"] == TemplateApprovalStatus.APPROVED.value:
                approved.append({
                    "name": name,
                    "meta_template_id": template["meta_template_id"],
                    "category": template["category"],
                    "variables": template["variables"],
                    "language": template["language"]
                })
        return approved
    
    def get_template_status_summary(self) -> Dict:
        """Get summary of all templates by approval status"""
        summary = {
            "total": len(self.templates),
            "draft": 0,
            "submitted": 0,
            "approved": 0,
            "rejected": 0,
            "pending": 0
        }
        
        for template in self.templates.values():
            status = template["status"]
            if status in summary:
                summary[status] += 1
        
        return summary


class PrebuiltTemplates:
    """Collection of pre-defined templates for common use cases"""
    
    @staticmethod
    def get_booking_confirmation_template() -> Dict:
        """Template for booking confirmation"""
        return {
            "template_name": "booking_confirmation",
            "category": TemplateCategory.TRANSACTIONAL,
            "header": None,
            "body": "🎉 Your trek booking is confirmed!\n\nBooking ID: {{1}}\nTrek: {{2}}\nDates: {{3}}\nSeats: {{4}}\n\nTotal: {{5}}\n\nThank you for booking with Trek & Stay!",
            "footer": "Questions? Reply or call +91-XXXXXXXXXX",
            "buttons": [
                {
                    "type": "URL",
                    "text": "View Details",
                    "url": "https://trekandstay.com/booking/{{1}}"
                }
            ]
        }
    
    @staticmethod
    def get_payment_reminder_template() -> Dict:
        """Template for payment reminders"""
        return {
            "template_name": "payment_reminder",
            "category": TemplateCategory.TRANSACTIONAL,
            "header": "💰 Payment Reminder",
            "body": "Hi {{1}},\n\nYour trek booking ({{2}}) expires in {{3}} days.\n\nPending amount: {{4}}\n\nComplete payment to secure your seats.",
            "footer": "Booking ID: {{5}}",
            "buttons": [
                {
                    "type": "URL",
                    "text": "Pay Now",
                    "url": "https://trekandstay.com/pay/{{5}}"
                }
            ]
        }
    
    @staticmethod
    def get_trip_update_template() -> Dict:
        """Template for trip updates"""
        return {
            "template_name": "trip_update",
            "category": TemplateCategory.NOTIFICATION,
            "header": "🏔️ Trek Update",
            "body": "Hi {{1}},\n\n{{2}}\n\nTrip: {{3}}\nDates: {{4}}\n\nFor questions, reply to this message.",
            "footer": "Stay updated!",
            "buttons": None
        }
    
    @staticmethod
    def get_support_response_template() -> Dict:
        """Template for support responses"""
        return {
            "template_name": "support_response",
            "category": TemplateCategory.SUPPORT,
            "header": None,
            "body": "Hi {{1}},\n\nThank you for contacting us.\n\nIssue: {{2}}\n\n{{3}}\n\nWe're here to help!",
            "footer": "Reply for more assistance",
            "buttons": None
        }
    
    @staticmethod
    def get_referral_template() -> Dict:
        """Template for referral invites"""
        return {
            "template_name": "referral_invite",
            "category": TemplateCategory.PROMOTIONAL,
            "header": "👥 Refer & Earn",
            "body": "Hi {{1}},\n\nRefer a friend and earn ₹{{2}} credits!\n\nYour referral code: {{3}}\n\nShare this code with friends.",
            "footer": "Terms apply",
            "buttons": [
                {
                    "type": "URL",
                    "text": "Share Now",
                    "url": "https://trekandstay.com/refer/{{3}}"
                }
            ]
        }


def get_message_template_service() -> MessageTemplate:
    """Factory function for template service singleton"""
    if not hasattr(get_message_template_service, '_instance'):
        get_message_template_service._instance = MessageTemplate()
    return get_message_template_service._instance
