// Copyright (c) 2024, Dhruvil Mistry and contributors
// For license information, please see license.txt

frappe.query_reports["Budget vs Actual"] = {
	"filters": [
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"options": "Company",
			"default": frappe.defaults.get_user_default("Company"),
		},	
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
			
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_today(),
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
		{
			"fieldname": "project_coordinator",
			"label": __("Project Coordinator"),
			"fieldtype": "Link",
			"options": "User",
		},
		{
			"fieldname": "client",
			"label": __("Client"),
			"fieldtype": "Link",
			"options": "Customer",
		},	
	],
};
