# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from typing import List,Dict,Any

def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns() -> List[Dict[str, str]]:
	return [
		{
			"label": _("Vendor"),
			"fieldname": "supplier",
			"fieldtype": "Link",
			"options": "Supplier",
			"width": 200,
		},
		{
			"label": _("Budget"),
			"fieldname": "BUDGETED",
			"fieldtype": "Float",
			"width": 200,
		},
		{
			"label": _("Actual"),
			"fieldname": "ACTUAL",
			"fieldtype": "Float",
			"width": 200,
		},
	]


def get_data(filters: Any) -> List[Dict[str, Any]]:
	
	# Query shortnames meaning
	# IWB -> Item wise Budget 
	# BI -> Budget Items 
	# PI ->  Purchase Invoice
	# PII -> Purchase Invoice Item

	result_data_sql:str = """
	
	SELECT 
		PI.supplier,
		SUM(PII.amount) AS "ACTUAL",
		SUM(BI.amount) AS "BUDGETED"
	FROM `tabItem wise Budget` AS IWB
	INNER JOIN `tabPurchase Invoice` AS PI 
		ON PI.project = IWB.project AND PI.department = IWB.department
	INNER JOIN `tabBudget Items` AS BI 
		ON IWB.name = BI.parent
	INNER JOIN `tabPurchase Invoice Item` AS PII
		ON PI.name = PII.parent
	WHERE PI.docstatus = 1
	AND (BI.item = PII.item_code OR BI.item = PII.item_group)
	GROUP BY PI.supplier
	
	""" 
	
	result_data: List[Dict[str, Any]] = frappe.db.sql(result_data_sql, as_dict=True)
	
	return result_data