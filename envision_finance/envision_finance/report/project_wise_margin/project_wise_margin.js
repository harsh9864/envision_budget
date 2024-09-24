// Copyright (c) 2024, Dhruvil Mistry and contributors
// For license information, please see license.txt

frappe.query_reports["Project wise Margin"] = {
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
	],
	"formatter": function(value, row, column, data, default_formatter) {
        // Use the default formatter to get the basic formatting
        let formatted_value = default_formatter(value, row, column, data);

        // Apply color to the "Schedule Date" field
        if (column.fieldname == "Margin" && value < 0) {
            formatted_value = `<div style="color:#e4181e">${value}</div>`;
        }
		if (column.fieldname == "Margin" && value > 0) {
            formatted_value = `<div style="color:#1DB954">${value}</div>`;
        }
        return formatted_value;
    }
};
