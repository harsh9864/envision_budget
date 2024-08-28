# Copyright (c) 2024, Dhruvil Mistry and contributors
# For license information, please see license.txt

import frappe
from typing import Union,List,Dict,Any
from frappe.model.document import Document


class ItemwiseBudget(Document):
	pass

@frappe.whitelist()
def verifying_the_budgeted_items() -> Union[List[Dict[str, Any]],None]:
	project:str = frappe.form_dict['project']
	department:str = frappe.form_dict['department']
	item:str = frappe.form_dict['item']

	# BI -> Budget Items
	# IB -> Item wise Budget

	item_data_sql:str = f"""
	
	SELECT 
	BI.item,
	IB.name
	FROM `tabBudget Items` AS BI
	INNER JOIN `tabItem wise Budget` AS IB ON IB.name = BI.parent
	WHERE IB.project = "{project}"
	AND IB.department = "{department}"
	AND BI.item = "{item}"
	AND IB.docstatus = 1
	
	"""
	
	item_data:List[Dict[str, Any]] = frappe.db.sql(item_data_sql, as_dict=True)
	if item_data:
		frappe.response['data'] = item_data
	else:
		frappe.response['data'] = None