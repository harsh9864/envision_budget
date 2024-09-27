// Copyright (c) 2024, Dhruvil Mistry and contributors
// For license information, please see license.txt

frappe.query_reports["Quarter wise Budget vs Actual"] = {
	"filters": [
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
		},	
		{
			"fieldname": "project",
			"label": __("Project"),
			"fieldtype": "Link",
			"options": "Project",
			get_query:function(){
				return {
					filters:{
						company : frappe.query_report.get_filter_value('company')
					}
				}
			}
		},
		{
			"fieldname": "department",
			"label": __("Department"),
			"fieldtype": "Link",
			"options": "Department",
			get_query:function(){
				return {
					filters:{
						company : frappe.query_report.get_filter_value('company')
					}
				}
			}
		},
	]
};
