# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from typing import List, Dict, Any


def execute(filters=None):
	columns: List[Dict[str, Any]] = get_columns()
	data: List[Dict[str, Any]] = get_data(filters)
	return columns, data

def get_columns() -> List[Dict[str, Any]]:
	return [
		{
			"label": _("<b>Item</b>"),
			"fieldname": "Item",
			"fieldtype": "Link",
			"options": "Item", 
			"width": 200,
		},
		{
			"label": _("<b>Q1 Budget Amount</b>"),
			"fieldname": "Q1 Budget Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q1 Actual Amount</b>"),
			"fieldname": "Q1 Actual Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q2 Budget Amount</b>"),
			"fieldname": "Q2 Budget Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q2 Actual Amount</b>"),
			"fieldname": "Q2 Actual Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q3 Budget Amount</b>"),
			"fieldname": "Q3 Budget Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q3 Actual Amount</b>"),
			"fieldname": "Q3 Actual Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q4 Budget Amount</b>"),
			"fieldname": "Q4 Budget Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Q4 Actual Amount</b>"),
			"fieldname": "Q4 Actual Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Total Budgeted Amount</b>"),
			"fieldname": "Total Budgeted Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
		{
			"label": _("<b>Total Actual Amount</b>"),
			"fieldname": "Total Actual Amount",
			"fieldtype": "Currency",
			"width": 200,
		},
	]
	
def get_data(filters: Any) -> List[Dict[str, Any]]:
	
	base_query: str = f"""

	SELECT
		DISTINCT(PII.item_code) AS "Item",
		-- Actual and Budgeted Amount for each Quarter
		(CASE WHEN QUARTER(PI.posting_date) = 1 THEN ROUND(BI.amount,2) ELSE "-" END) AS "Q1 Budget Amount",
		SUM(CASE WHEN QUARTER(PI.posting_date) = 1 THEN ROUND(PII.amount,2) ELSE 0 END) AS "Q1 Actual Amount",
		(CASE WHEN QUARTER(PI.posting_date) = 2 THEN ROUND(BI.amount,2) ELSE "-" END) AS "Q2 Budget Amount",
		SUM(CASE WHEN QUARTER(PI.posting_date) = 2 THEN ROUND(PII.amount,2) ELSE 0 END) AS "Q2 Actual Amount",
		(CASE WHEN QUARTER(PI.posting_date) = 3 THEN ROUND(BI.amount,2) ELSE "-" END) AS "Q3 Budget Amount",
		SUM(CASE WHEN QUARTER(PI.posting_date) = 3 THEN ROUND(PII.amount,2) ELSE 0 END) AS "Q3 Actual Amount",
		(CASE WHEN QUARTER(PI.posting_date) = 4 THEN ROUND(BI.amount,2) ELSE "-" END) AS "Q4 Budget Amount",
		SUM(CASE WHEN QUARTER(PI.posting_date) = 4 THEN ROUND(PII.amount,2) ELSE 0 END) AS "Q4 Actual Amount",
		
		-- Total Budgeted and Actual Amounts
		ROUND(
			SUM(
				CASE 
					WHEN QUARTER(PI.posting_date) IN (1, 2, 3, 4) THEN BI.amount
					ELSE 0 
				END)
		, 2) AS "Total Budgeted Amount",
		ROUND(SUM(PII.amount),2) AS "Total Actual Amount"
	FROM 
		`tabBudget Items` AS BI
	LEFT JOIN 
		`tabPurchase Invoice Item` AS PII
		ON (BI.item = PII.item_code OR BI.item = PII.item_group)
	INNER JOIN 
		`tabPurchase Invoice` AS PI
		ON PI.name = PII.parent
	WHERE
		PI.docstatus = 1
	"""

	if filters.get('company'):
		base_query += f"""
		AND PI.company = '{filters.get('company')}' 
		"""
	if filters.get('project'):
		base_query += f"""
		AND PI.project = '{filters.get('project')}' 
		"""
	if filters.get('department'):
		base_query += f"""
		AND PI.department = '{filters.get('department')}' 
		"""
	base_query += """
			-- Grouping by item no need to group by quarter since we're splitting amounts manually
			GROUP BY 
				Item, BI.amount
			ORDER BY 
				PI.posting_date DESC;
			"""
	return frappe.db.sql(base_query, as_dict=True)