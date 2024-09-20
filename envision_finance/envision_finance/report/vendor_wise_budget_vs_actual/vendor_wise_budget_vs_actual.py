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
			"label": _("<b>Vendor</b>"),
			"fieldname": "supplier",
			"fieldtype": "Link",
			"options": "Supplier",
			"width": 200,
		},
		{
			"label": _("<b>Budget</b>"),
			"fieldname": "BUDGETED",
			"fieldtype": "Float",
			"width": 200,
		},
		{
			"label": _("<b>Actual</b>"),
			"fieldname": "ACTUAL",
			"fieldtype": "Float",
			"width": 200,
		},
	]


def get_data(filters: Any) -> List[Dict[str, Any]]:
	# Query shortnames:
	# IWB -> Item wise Budget 
	# BI  -> Budget Items 
	# PI  -> Purchase Invoice
	# PII -> Purchase Invoice Item

	result_data_sql: str = """
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
	"""

	# Add filters dynamically
	if filters.get('from_date') and filters.get('to_date'):
		result_data_sql += f"""
		AND (PI.creation BETWEEN '{filters.get('from_date')}' AND '{filters.get('to_date')}')
		"""

	if filters.get('company'):
		result_data_sql += f" AND PI.company = '{filters.get('company')}'"

	if filters.get('project'):
		result_data_sql += f" AND PI.project = '{filters.get('project')}'"
		
	if filters.get('supplier'):
		result_data_sql += f" AND PI.supplier = '{filters.get('supplier')}'"
	# Add the GROUP BY clause once, after all filters are applied
	result_data_sql += " GROUP BY PI.supplier, PI.project, IWB.name"

	# Execute the query and return the result as a list of dictionaries
	result_data: List[Dict[str, Any]] = frappe.db.sql(result_data_sql, as_dict=True)
	
	return result_data
