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
def verifying_the_budgeted_items() -> Union[List[Dict[str, Any]],None]:
	project:str = frappe.form_dict['project']
	department:str = frappe.form_dict['department']
	item:str = frappe.form_dict['item']
	applicable_on_purchase_order: bool = frappe.form_dict['applicable_on_purchase_order']
	applicable_on_purchase_invoice: bool = frappe.form_dict['applicable_on_purchase_invoice']
	fiscal_year:str = frappe.form_dict['fiscal_year']
	# BI -> Budget Items
	# IB -> Project Budget
	item_data_sql:str = f"""
	
	SELECT 
	BI.item,
	IB.name
	FROM `tabBudget Items` AS BI
	INNER JOIN `tabProject Budget` AS IB ON IB.name = BI.parent
	WHERE IB.project = "{project}"
	AND IB.department = "{department}"
	AND BI.item = "{item}"
	AND IB.fiscal_year = "{fiscal_year}"
	AND IB.docstatus = 1
	AND IB.is_used = 1
	AND IB.disable = 0
	"""
	if applicable_on_purchase_order:
		item_data_sql += " AND IB.applicable_on_purchase_order = 1"
	if applicable_on_purchase_invoice:
		item_data_sql += " AND IB.applicable_on_purchase_invoice = 1"
	item_data:List[Dict[str, Any]] = frappe.db.sql(item_data_sql, as_dict=True)
	if item_data:
		frappe.response['data'] = item_data
	else:
		frappe.response['data'] = None

