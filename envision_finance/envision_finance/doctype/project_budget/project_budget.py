# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from typing import Union,List,Dict,Any
from frappe.model.document import Document


class ProjectBudget(Document):
	pass

@frappe.whitelist()
def get_item_details(item_code):
    item = frappe.get_doc("Item", item_code)
    return {
        "stock_uom": item.stock_uom,
        "gst_hsn_code": item.gst_hsn_code,
        "item_group": item.item_group
    }


@frappe.whitelist()
def verifying_the_budgeted_items() -> Union[List[Dict[str, Any]], None]:
    project: str = frappe.form_dict['project']
    department: str = frappe.form_dict['department']
    item: str = frappe.form_dict['item']
    applicable_on_purchase_order: bool = frappe.form_dict['applicable_on_purchase_order']
    applicable_on_purchase_invoice: bool = frappe.form_dict['applicable_on_purchase_invoice']
    applicable_on_journal_entry: bool = frappe.form_dict['applicable_on_journal_entry']
    fiscal_year: str = frappe.form_dict['fiscal_year']
    print(f"\n\n\n\n\n\n{fiscal_year}\n\n\n\n\n\n")
    # Use parameterized query to prevent SQL injection
    
    item_data_sql = """
    SELECT 
        BI.item,
        IB.name
    FROM `tabBudget Items` AS BI
    INNER JOIN `tabProject Budget` AS IB ON IB.name = BI.parent
    WHERE IB.project = %s
    AND IB.department = %s
    AND BI.item = %s
    AND IB.fiscal_year = %s
    AND IB.docstatus = 1
    AND IB.is_used = 1
    AND IB.workflow_state = "Approved"
    AND (IB.applicable_on_purchase_order = %s
    OR IB.applicable_on_purchase_invoice = %s
    OR IB.applicable_on_journal_entry = %s)
    """
    
    params = [project, department, item, fiscal_year,applicable_on_purchase_order, applicable_on_purchase_invoice, applicable_on_journal_entry]
    
    # Execute the query with parameters
    item_data: List[Dict[str, Any]] = frappe.db.sql(item_data_sql, params, as_dict=True)
    print(f"\n\n\n\n\n\n{item_data}\n\n\n\n")
    # Set the response data
    frappe.response['message'] = item_data if item_data else []

@frappe.whitelist()
def setting_logs_in_new_budget():
    new_budget = frappe.form_dict['new_budget']
    old_budget = frappe.form_dict['old_budget']
    
    # Fetch both old and new budget documents
    old_budget_data = frappe.get_doc("Project Budget", old_budget)
    new_budget_data = frappe.get_doc("Project Budget", new_budget)
    
    # Copy transactional logs from old budget to new budget
    for row in old_budget_data.transactional_logs:
        new_budget_data.append('transactional_logs', {
            'entry_type': row.entry_type,
            'entry_id': row.entry_id,
            'account': row.account,
            'amount': row.amount,
            'currency': row.currency,
            'company': row.company,
            'is_credited': row.is_credited,
            'is_debited': row.is_debited,
            'apply_budget_on': row.apply_budget_on,
            'quantity': row.quantity,
            'item': row.item,
            'item_group': row.item_group,
            'is_adjusted_budget':1,
            'project_budget':old_budget,
        })
        
    # Copy Expense logs from old budget to new budget
    for row in old_budget_data.logs:
        new_budget_data.append('logs', {
            'entry_type': row.entry_type,
            'id': row.id,
            'item': row.item,
            'rate': row.rate,
            'quantity': row.quantity,
            'amount': row.amount,
            'uom': row.uom,
            'is_adjusted_budget':1,
            'project_budget':old_budget,
        })
        
    # Copy Revenue logs from old budget to new budget
    for row in old_budget_data.revenue_logs:
        new_budget_data.append('revenue_logs', {
            'entry_type': row.entry_type,
            'entry_id': row.entry_id,
            'allocated_amount': row.allocated_amount,
            'sales_invoice_id': row.sales_invoice_id,
            'is_adjusted_budget':1,
            'project_budget':old_budget,
        })
    # Save new budget document after appending rows
    new_budget_data.save()
    frappe.db.commit()
    frappe.msgprint(f"All logs have been successfully copied from the {old_budget} to the {new_budget}.")

