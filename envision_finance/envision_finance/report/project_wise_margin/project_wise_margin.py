# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from typing import List, Dict, Any


def execute(filters=None):
	columns: List[Dict[str, Any]] = get_columns()
	data: List[Dict[str, Any]] = get_data(filters)
	return columns, data

def get_columns() -> List[Dict[str,Any]]:
	return [
		{
			"label": _("<b>Project</b>"),
			"fieldname": "project",
			"fieldtype": "Link",
			"options": "Project",
			"width": 200
		},
		{
			"label": _("<b>Client</b>"),
			"fieldname": "Client",
			"fieldtype": "Link",
			"options": "Customer",
			"width": 200
		},
		{
			"label": _("<b>Item</b>"),
			"fieldname": "item_code",
			"fieldtype": "Link",
			"options": "Item",
			"width": 200
		},
		{
			"label": _("<b>Budget</b>"),
			"fieldname": "Budget",
			"fieldtype": "Currency",
			"width": 200
		},
		{
			"label": _("<b>Revenue</b>"),
			"fieldname": "Revenue",
			"fieldtype": "Currency",
			"width": 200
		},
		{
			"label": _("<b>Expense</b>"),
			"fieldname": "Expense",
			"fieldtype": "Currency",
			"width": 200
		},
		{
			"label": _("<b>Margin</b>"),
			"fieldname": "Margin",
			"fieldtype": "Currency",
			"width": 200
		},
		]

def get_data(filters: Any) -> List[Dict[str, Any]]:
    conditions1 = ""
    conditions2= ""
    conditions3 = ""
    if filters.get('project'):
        conditions1 += " AND SI.project = %(project)s"
        conditions2 += " AND PI.project = %(project)s"
        conditions3 += " AND IB.project = %(project)s"
    if filters.get('company'):
        conditions1 += " AND SI.company = %(company)s"
        conditions2 += " AND PI.company = %(company)s"
        conditions3 += " AND IB.company = %(company)s"
    if filters.get('department'):
        conditions1 += " AND SI.department = %(department)s"
        conditions2 += " AND PI.department = %(department)s"
        conditions3 += " AND IB.department = %(department)s"
    
    result_data_sql: str = f"""
    WITH Sales_Data AS (
        SELECT 
            SII.item_code,
            SI.project,
            SI.customer AS "Client",
            ROUND(SUM(SII.net_amount), 2) AS "Revenue"
        FROM 
            `tabSales Invoice Item` AS SII
        INNER JOIN 
            `tabSales Invoice` AS SI 
            ON SI.name = SII.parent
        WHERE 
            SI.docstatus = 1
            {conditions1}
        GROUP BY 
            SII.item_code, SI.project, SI.customer
    ),
    Expense_Data AS (
        SELECT 
            PII.item_code,
            ROUND(SUM(PII.net_amount), 2) AS "Expense"
        FROM 
            `tabPurchase Invoice Item` AS PII
        INNER JOIN 
            `tabPurchase Invoice` AS PI
            ON PI.name = PII.parent
        WHERE 
            PI.docstatus = 1
            {conditions2}
        GROUP BY 
            PII.item_code
    ),
    Budget_Data AS (
        SELECT 
            BI.item AS item_code,
            ROUND(SUM(BI.amount), 2) AS "Budget"
        FROM 
            `tabBudget Items` AS BI
        INNER JOIN `tabItem wise Budget` AS IB 
        ON IB.name = BI.parent
        WHERE
			IB.docstatus = 1
            {conditions3}
        GROUP BY 
            BI.item
    )
    SELECT 
        SD.item_code,
        SD.Revenue,
        COALESCE(ED.Expense, 0) AS "Expense",
        COALESCE(BD.Budget, 0) AS "Budget",
        ROUND(SD.Revenue - COALESCE(ED.Expense, 0), 2) AS "Margin",
        SD.project,
        SD.Client
    FROM 
        Sales_Data AS SD
    LEFT JOIN 
        Expense_Data AS ED 
        ON ED.item_code = SD.item_code
    LEFT JOIN 
        Budget_Data AS BD
        ON BD.item_code = SD.item_code
    ORDER BY 
        SD.project;
    """

    return frappe.db.sql(result_data_sql, filters, as_dict=True)

