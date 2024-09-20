# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from typing import List, Dict,Any

def execute(filters=None):
	columns = get_columns()
	data = get_data(filters)
	return columns, data

def get_columns() -> List[Dict[str,Any]]:
	return [
		{
			"label":"<b>Department</b>",
			"fieldname":"Department",
			"fieldtype":"Link",
			"options":"Department"
		},
		{
			"label":"<b>Project Coordinator</b>",
			"fieldname":"Project Coordinator",
			"fieldtype":"Link",
			"options":"User",
			"width":250
		},
		{
			"label":"<b>Project Code</b>",
			"fieldname":"Project",
			"fieldtype":"Link",
			"options":"Project",
			"width":200
		},
		{
			"label":"<b>Project Name</b>",
			"fieldname":"Project Name",
			"fieldtype":"Data",
			"width":200
		},
		{
			"label":"<b>Category</b>",
			"fieldname":"Category",
			"fieldtype":"Data",
			"width":200
		},
		{
			"label":"<b>Vendor</b>",
			"fieldname":"Supplier",
			"fieldtype":"Link",
			"options":"Supplier",
			"width":200
		},
		{
			"label":"<b>Particulars</b>",
			"fieldname": "Particulars",
			"fieldtype":"Data",
			"width": 250
		},
		{
			"label":"<b>Units</b>",
			"fieldname": "Units",
			"fieldtype":"Data",
			"width": 150
		},
		{
			"label":"<b>Budgeted Qty</b>",
			"fieldname": "Budgeted Qty",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
		{
			"label":"<b>Budgeted Rate</b>",
			"fieldname": "Budgeted Rate",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
		{
			"label":"<b>Budgeted Amount</b>",
			"fieldname": "BUDGETED",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
		{
			"label":"<b>Actual Qty</b>",
			"fieldname": "Actual Qty",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
		{
			"label":"<b>Actual Rate</b>",
			"fieldname": "Actual Rate",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
		{
			"label":"<b>Actual Amount</b>",
			"fieldname": "ACTUAL",
			"fieldtype":"Float",
			"precision":2,
			"width": 150
		},
	]


def get_data(filters: Any) -> List[Dict[str,Any]]:
	
	# Query shortnames meaning
	# IWB -> Item wise Budget 
	# BI -> Budget Items 
	# PI ->  Purchase Invoice
	# PII -> Purchase Invoice Item
	# I -> Item
	# P -> Project

	result_data_sql = f"""
		SELECT 
			PI.supplier AS "Supplier",
			(PII.amount) AS "ACTUAL",
			(PII.qty) AS "Actual Qty",
			(PII.rate) AS "Actual Rate",
			(BI.amount) AS "BUDGETED",
			(BI.current_budget) AS "Current Budget",
			(BI.quantity) AS "Budgeted Qty",
			(BI.unit_price) AS "Budgeted Rate",
			BI.item AS "Item",
			I.item_group AS "Category",
			I.description AS "Particulars",
			I.stock_uom AS "Units",
			P.name AS "Project",
			P.project_name AS "Project Name",
			P.custom_project_coordinator AS "Project Coordinator",
			PI.department AS "Department"
		FROM `tabItem wise Budget` AS IWB
		INNER JOIN `tabPurchase Invoice` AS PI 
			ON PI.project = IWB.project AND PI.department = IWB.department
		INNER JOIN `tabBudget Items` AS BI 
			ON IWB.name = BI.parent
		INNER JOIN `tabPurchase Invoice Item` AS PII 
			ON PI.name = PII.parent
		INNER JOIN `tabItem` AS I
			ON I.item_code = PII.item_code
		INNER JOIN `tabProject` AS P 
			ON P.name = PI.project AND P.name = IWB.project
		WHERE PI.docstatus = 1
			AND (BI.item = PII.item_code OR BI.item = PII.item_group)
	"""

	# Add filters dynamically, ensuring correct concatenation and handling of empty filters
	if filters.get('from_date') and filters.get('to_date'):
		result_data_sql += f"""
		AND (PI.creation BETWEEN '{filters.get('from_date')}' AND '{filters.get('to_date')}')
		"""

	if filters.get('company'):
		result_data_sql += f" AND (PI.company = '{filters.get('company')}')"

	if filters.get('project'):
		result_data_sql += f" AND (PI.project = '{filters.get('project')}')"

	if filters.get('department'):
		result_data_sql += f" AND (PI.department = '{filters.get('department')}')"

	if filters.get('project_coordinator'):
		result_data_sql += f" AND (P.custom_project_coordinator = '{filters.get('project_coordinator')}')"

	# Add the final ORDER BY clause
	result_data_sql += " ORDER BY PI.creation DESC"

	
	
	result_data:List[Dict[str,Any]] = frappe.db.sql(result_data_sql,as_dict = 1)
	return result_data